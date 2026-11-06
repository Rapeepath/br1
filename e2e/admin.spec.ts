import AxeBuilder from '@axe-core/playwright'
import { expect, test, type APIRequestContext, type Page } from '@playwright/test'

// The admin tests share one freshly seeded server database (see playwright.config.ts) and run in parallel on
// desktop and mobile: they find what they create by its own number or name, never by global counts, and
// they never close the open shift.

const STAFF = { id: 'st-2', pin: '2222' }

async function token(request: APIRequestContext, who = STAFF): Promise<string> {
  const res = await request.post('/api/auth/login', { data: { staffId: who.id, pin: who.pin } })
  expect(res.ok()).toBe(true)
  return (await res.json()).token
}

/** Signs the browser in by handing it a session token before the page loads. */
async function signIn(page: Page, request: APIRequestContext, who = STAFF): Promise<string> {
  const t = await token(request, who)
  await page.addInitScript((tok) => localStorage.setItem('maew.pos.token', tok), t)
  return t
}

function watchErrors(page: Page) {
  const errors: string[] = []
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('requestfailed', (r) => errors.push(`request failed: ${r.url()}`))
  page.on('response', (r) => {
    if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`)
  })
  return errors
}

async function settle(page: Page) {
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
}

async function loadAllImages(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 30))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForLoadState('networkidle')
}

const ROUTES: { name: string; path: string | ((api: APIRequestContext, t: string) => Promise<string>); heading: RegExp }[] = [
  { name: 'dashboard', path: '#/', heading: /ภาพรวมร้าน/ },
  { name: 'pos', path: '#/pos', heading: /ขายหน้าร้าน/ },
  { name: 'orders', path: '#/orders', heading: /รายการขาย/ },
  {
    name: 'order',
    path: async (api, t) => {
      const list = await (await api.get('/api/orders?limit=1', { headers: { authorization: `Bearer ${t}` } })).json()
      return `#/orders/${list.rows[0].id}`
    },
    heading: /^บิล /,
  },
  { name: 'products', path: '#/products', heading: /สินค้าและสต็อก/ },
  { name: 'product', path: '#/products/scottish-fold-pet', heading: /ลูกแมวสก็อตติช โฟลด์/ },
  { name: 'stock', path: '#/stock', heading: /ความเคลื่อนไหวสต็อก/ },
  { name: 'customers', path: '#/customers', heading: /^ลูกค้า$/ },
  { name: 'customer', path: '#/customers/c00001', heading: /./ },
  { name: 'shifts', path: '#/shifts', heading: /กะและเงินสด/ },
  { name: 'reports', path: '#/reports', heading: /รายงานยอดขาย/ },
  { name: 'activity', path: '#/activity', heading: /บันทึกกิจกรรม/ },
  { name: 'settings', path: '#/settings', heading: /ตั้งค่า/ },
  { name: 'leads', path: '#/leads', heading: /^ลูกค้าที่สนใจ$/ },
  {
    name: 'lead',
    path: async (api, t) => {
      const list = await (await api.get('/api/leads?kind=privacy&limit=1', { headers: { authorization: `Bearer ${t}` } })).json()
      return `#/leads/${list.rows[0].id}`
    },
    heading: /./,
  },
  { name: 'bookings', path: '#/bookings', heading: /^นัดหมาย$/ },
  { name: 'bookings-list', path: '#/bookings?view=list', heading: /^นัดหมาย$/ },
  { name: 'kittens', path: '#/kittens', heading: /^ลูกแมว$/ },
  {
    name: 'kitten',
    path: async (api, t) => {
      const list = await (await api.get('/api/kittens?status=available', { headers: { authorization: `Bearer ${t}` } })).json()
      return `#/kittens/${list.rows[0].id}`
    },
    heading: /^น้อง/,
  },
  { name: 'reservations', path: '#/reservations?status=all', heading: /^การจองลูกแมว$/ },
  {
    name: 'reservation',
    path: async (api, t) => {
      const list = await (await api.get('/api/reservations', { headers: { authorization: `Bearer ${t}` } })).json()
      return `#/reservations/${list.rows[list.rows.length - 1].id}`
    },
    heading: /^การจอง RS\d{6}-\d{4}$/,
  },
  { name: 'reviews', path: '#/reviews?status=all', heading: /^รีวิว$/ },
]

async function open(page: Page, request: APIRequestContext, route: (typeof ROUTES)[number]) {
  const t = await signIn(page, request)
  const path = typeof route.path === 'string' ? route.path : await route.path(request, t)
  await page.goto(`admin/${path}`)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(route.heading)
  await settle(page)
}

test.describe('admin sign-in', () => {
  test('the sign-in screen renders cleanly and passes axe', async ({ page }) => {
    const errors = watchErrors(page)
    await page.goto('admin/')
    await expect(page.getByRole('heading', { level: 1, name: 'ใครกำลังเข้ากะ' })).toBeVisible()
    await settle(page)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([])
    expect(errors).toEqual([])
  })

  test('a wrong PIN is refused, the right one opens the dashboard', async ({ page }) => {
    await page.goto('admin/')
    await page.getByRole('radio', { name: /ธนกร มีสุข/ }).check()
    const pin = page.getByLabel('รหัส PIN ของธนกร มีสุข')
    await pin.fill('0000')
    await expect(page.getByRole('alert')).toHaveText('รหัส PIN ไม่ถูกต้อง')
    await pin.fill('2222')
    await expect(page.getByRole('heading', { level: 1, name: 'ภาพรวมร้าน' })).toBeVisible()
    await expect(page.getByText('ยอดขายวันนี้')).toBeVisible()
  })

  test('/admin without the slash redirects to the admin page', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/admin\/$/)
    await expect(page.getByRole('heading', { level: 1, name: 'ใครกำลังเข้ากะ' })).toBeVisible()
  })
})

for (const route of ROUTES) {
  test.describe(`admin ${route.name}`, () => {
    test('renders cleanly: no errors, no broken images, no sideways scroll', async ({ page, request }) => {
      const errors = watchErrors(page)
      await open(page, request, route)
      await loadAllImages(page)
      const broken = await page.$$eval('img', (imgs) => imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute('src')))
      expect(broken, 'broken images').toEqual([])
      const deviceWidth = page.viewportSize()!.width
      const widest = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth))
      expect(widest - deviceWidth, 'horizontal overflow (px)').toBeLessThanOrEqual(0)
      if (deviceWidth <= 560) {
        // Phones show tables as row cards: nothing may scroll sideways inside a card either
        const sideways = await page.$$eval('.table-wrap', (els) => els.filter((e) => e.scrollWidth > e.clientWidth + 1).map((e) => e.getAttribute('aria-label')))
        expect(sideways, 'tables scrolling sideways on a phone').toEqual([])
      }
      expect(errors, 'console/network errors').toEqual([])
    })

    for (const theme of ['light', 'dark'] as const) {
      test(`has no accessibility violations (${theme})`, async ({ page, request }) => {
        await page.addInitScript((t) => localStorage.setItem('maew.theme', t), theme)
        await open(page, request, route)
        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
        const found = results.violations.map((v) => `${v.id} (${v.impact}): ${v.help} → ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)
        expect(found).toEqual([])
        await page.screenshot({ path: `e2e/screenshots/admin-${test.info().project.name}-${route.name}-${theme}.png`, fullPage: true })
      })
    }
  })
}

test.describe('selling at the till', () => {
  test('two products, a bill discount and cash with change end in a receipt that shows up in the sales list', async ({ page, request }) => {
    await signIn(page, request)
    await page.goto('admin/#/pos')
    await expect(page.getByRole('heading', { level: 1, name: 'ขายหน้าร้าน' })).toBeVisible()
    await page.getByRole('radio', { name: 'อาหารและอุปกรณ์' }).check()
    const tiles = page.getByRole('list', { name: 'สินค้า' })
    await tiles.getByRole('button', { name: /อาหารเม็ดลูกแมว/ }).click()
    await tiles.getByRole('button', { name: /ทรายแมวเต้าหู้/ }).click()
    await tiles.getByRole('button', { name: /ทรายแมวเต้าหู้/ }).click()

    // Phones keep the bill in a sheet behind the summary bar
    const sheetButton = page.getByRole('button', { name: 'ดูบิลและชำระเงิน' })
    if (await sheetButton.isVisible()) await sheetButton.click()

    await page.getByRole('radio', { name: '%' }).check()
    await page.getByLabel('ส่วนลดท้ายบิล', { exact: true }).fill('10')
    // 590 + 2 × 220 = 1,030 less 10% = 927 (priced by the server)
    const pay = page.getByRole('button', { name: 'รับชำระ 927 บาท' })
    await expect(pay).toBeEnabled()
    await pay.click()

    const payDialog = page.getByRole('dialog', { name: 'รับชำระ 927 บาท' })
    await payDialog.getByRole('button', { name: '1,000', exact: true }).click()
    await expect(payDialog.getByText('เงินทอน')).toContainText('73 บาท')
    await payDialog.getByRole('button', { name: 'รับเงินและออกใบเสร็จ' }).click()

    const done = page.getByRole('dialog', { name: /^ขายสำเร็จ MW\d{6}-\d{4}$/ })
    await expect(done).toBeVisible()
    const no = (await done.getByRole('heading').textContent())!.replace('ขายสำเร็จ ', '').trim()
    const receipt = done.getByRole('article', { name: `ใบเสร็จ ${no}` })
    await expect(receipt).toContainText('ใบเสร็จรับเงิน/ใบกำกับภาษีอย่างย่อ')
    await expect(receipt).toContainText('ส่วนลดท้ายบิล')
    await expect(receipt).toContainText('เงินทอน')
    await expect(done.getByText('ทอนเงินลูกค้า')).toContainText('73 บาท')

    // The page behind a modal is inert, so the 'sale saved' message is announced from the receipt dialog's own
    // live region, at its foot: inside the dialog, topmost at its own centre, and not covering บิลใหม่
    const status = done.getByRole('status')
    await expect(status).toHaveAttribute('aria-live', 'polite')
    const toast = status.getByText(`บันทึกการขาย ${no} แล้ว`)
    await expect(toast).toBeVisible()
    await expect(page.locator('.toasts')).toBeEmpty()
    const topmost = (sel: ReturnType<typeof page.locator>) =>
      sel.evaluate((el) => {
        const r = el.getBoundingClientRect()
        const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
        return !!hit && el.contains(hit)
      })
    expect(await topmost(toast), 'toast is the topmost element at its centre').toBe(true)
    const newBill = done.getByRole('button', { name: 'บิลใหม่', exact: true })
    await newBill.scrollIntoViewIfNeeded()
    expect(await topmost(newBill), 'บิลใหม่ is not covered').toBe(true)
    await newBill.click()
    await expect(done).toBeHidden()

    await page.goto(`admin/#/orders?q=${no}`)
    await page.getByRole('searchbox', { name: 'ค้นหา' }).fill(no)
    await expect(page.getByRole('link', { name: no })).toBeVisible()
    await page.getByRole('link', { name: no }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(`บิล ${no}`)
    await expect(page.getByText('927', { exact: true }).first()).toBeVisible()
  })

  test('staff refund a bill with a manager PIN, and the bill shows who approved it', async ({ page, request }) => {
    const t = await signIn(page, request)
    const res = await request.post('/api/orders', {
      headers: { authorization: `Bearer ${t}` },
      data: { lines: [{ productId: 'svc-booster', qty: 1 }], payment: { method: 'card', cardLast4: '4242' } },
    })
    expect(res.ok()).toBe(true)
    const order = await res.json()

    await page.goto(`admin/#/orders/${order.id}`)
    await page.getByRole('button', { name: 'คืนเงินบิลนี้' }).click()
    const dialog = page.getByRole('dialog', { name: `คืนเงินบิล ${order.no}` })
    await dialog.getByLabel('เหตุผลการคืนเงิน').fill('ลูกค้าเลื่อนนัดฉีดวัคซีน')
    await dialog.getByLabel('รหัส PIN ผู้จัดการ').fill('0000')
    await dialog.getByRole('button', { name: 'ยืนยันคืนเงิน' }).click()
    await expect(dialog.getByRole('alert')).toContainText('ผู้จัดการ')
    await dialog.getByLabel('รหัส PIN ผู้จัดการ').fill('1111')
    await dialog.getByRole('button', { name: 'ยืนยันคืนเงิน' }).click()
    await expect(dialog).toBeHidden()
    await expect(page.getByText('อนุมัติโดย ปวีณา ใจดี')).toBeVisible()
    await expect(page.getByText('เหตุผล: ลูกค้าเลื่อนนัดฉีดวัคซีน')).toBeVisible()
  })
})

test.describe('back office', () => {
  test('receiving stock raises the product stock', async ({ page, request }, info) => {
    // Each project works on its own product so the parallel runs never race
    const id = info.project.name === 'mobile' ? 'carrier' : 'scratcher'
    const t = await signIn(page, request)
    const before = (await (await request.get(`/api/products/${id}`, { headers: { authorization: `Bearer ${t}` } })).json()).product.stock
    await page.goto(`admin/#/products/${id}`)
    await page.getByLabel('จำนวนที่รับ (ชิ้น)').fill('3')
    await page.getByLabel('หมายเหตุ (ไม่บังคับ)').fill('ทดสอบรับของ')
    await page.getByRole('button', { name: 'บันทึกรับเข้า' }).click()
    await expect(page.locator('.stat', { hasText: 'สต็อกคงเหลือ' })).toContainText(`${before + 3} ชิ้น`)
    await expect(page.getByRole('cell', { name: 'ทดสอบรับของ' }).first()).toBeVisible()
    const after = (await (await request.get(`/api/products/${id}`, { headers: { authorization: `Bearer ${t}` } })).json()).product.stock
    expect(after).toBe(before + 3)
  })

  test('a new customer can be added and found by phone', async ({ page, request }, info) => {
    await signIn(page, request)
    // The worker's slot as the last digit: copies of this test running side by side (desktop and mobile, or
    // --repeat-each) can start in the same millisecond, and the shop allows one customer per phone number
    const phone = `09${String(Date.now()).slice(-7)}${info.parallelIndex % 10}`
    const name = `คุณทดสอบ ${info.project.name}`
    await page.goto('admin/#/customers')
    await page.getByRole('button', { name: 'เพิ่มลูกค้า' }).click()
    const dialog = page.getByRole('dialog', { name: 'เพิ่มลูกค้าใหม่' })
    await dialog.getByLabel('ชื่อลูกค้าหรือชื่อบริษัท').fill(name)
    await dialog.getByLabel('เบอร์โทร').fill(phone)
    await dialog.getByRole('button', { name: 'เพิ่มลูกค้า' }).click()
    await expect(dialog).toBeHidden()
    await page.getByRole('searchbox', { name: 'ค้นหา' }).fill(phone)
    await expect(page.getByRole('link', { name })).toBeVisible()
    await page.getByRole('link', { name }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(name)
  })

  test('reports render and export the bills as CSV', async ({ page, request }) => {
    await signIn(page, request)
    await page.goto('admin/#/reports')
    await expect(page.getByText('ยอดขายสุทธิ')).toBeVisible()
    await expect(page.getByRole('heading', { name: /ยอดขายรายสินค้า/ })).toBeVisible()
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'ส่งออกบิลเป็น CSV' }).click()])
    expect(download.suggestedFilename()).toMatch(/^orders-\d{4}-\d{2}-\d{2}-to-\d{4}-\d{2}-\d{2}\.csv$/)
    const path = await download.path()
    const fs = await import('node:fs')
    const csv = fs.readFileSync(path, 'utf8')
    expect(csv).toContain('เลขที่บิล')
    expect(csv.split('\n').length).toBeGreaterThan(10)

    // Every chart has a table twin
    await page.getByRole('button', { name: 'ดูเป็นตาราง' }).first().click()
    await expect(page.getByRole('region', { name: 'ยอดขายรายวัน (บาท) แบบตาราง' })).toBeVisible()
  })

  test('a cash pay-out is recorded on the open shift; the close form previews the difference', async ({ page, request }, info) => {
    await signIn(page, request)
    const reason = `ทดสอบจ่ายค่าส่ง ${info.project.name} ${Date.now()}`
    await page.goto('admin/#/shifts')
    await page.getByLabel('จำนวนเงิน (บาท)').fill('120')
    await page.getByLabel('เหตุผล', { exact: true }).fill(reason)
    await page.getByRole('button', { name: 'บันทึกรายการเงินสด' }).click()
    await expect(page.getByRole('cell', { name: reason })).toBeVisible()

    const counted = page.getByLabel('เงินสดที่นับได้ (บาท)')
    const preview = page.getByTestId('close-diff')
    await counted.fill('0')
    await expect(preview).toContainText('เงินขาด')
    await counted.fill('99999999')
    await expect(preview).toContainText('เงินเกิน')
    // Not submitted: the other tests keep selling on this shift
  })

  test('keyboard users can read the chart values', async ({ page, request }) => {
    await signIn(page, request)
    await page.goto('admin/#/')
    const plot = page.getByRole('group', { name: /ยอดขายรายวัน/ })
    await plot.focus()
    await page.keyboard.press('End')
    await expect(plot.getByRole('status')).toContainText('บาท')
    await page.keyboard.press('ArrowLeft')
    await expect(plot.getByRole('status')).toContainText('บิล')
  })
})

test.describe('layout regressions', () => {
  test('Thai product names wrap only at their spaces and stay inside the POS tiles', async ({ page, request }, info) => {
    test.skip(info.project.name !== 'desktop', 'widths are set explicitly; one project is enough')
    await signIn(page, request)
    for (const width of [1366, 1024, 390, 360, 320]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('admin/#/pos')
      await expect(page.locator('.tile').first()).toBeVisible()
      await settle(page)
      const bad = await page.$$eval('.tile .seg', (segs) =>
        segs.flatMap((s) => {
          const tile = s.closest('.tile')!.getBoundingClientRect()
          const rects = s.getClientRects()
          const r = s.getBoundingClientRect()
          const problems: string[] = []
          if (rects.length !== 1) problems.push(`${s.textContent} breaks inside`)
          if (r.right > tile.right - 2 || r.left < tile.left + 2) problems.push(`${s.textContent} overflows its tile`)
          return problems
        }),
      )
      expect(bad, `at ${width}px`).toEqual([])
      const widest = await page.evaluate(() => document.documentElement.scrollWidth)
      expect(widest, `page width at ${width}px`).toBeLessThanOrEqual(width)
    }
  })

  test('every admin screen reflows at 320px with tables as cards', async ({ page, request }, info) => {
    test.skip(info.project.name !== 'desktop', 'width is set explicitly; one project is enough')
    await page.setViewportSize({ width: 320, height: 720 })
    const t = await signIn(page, request)
    for (const route of ROUTES) {
      const path = typeof route.path === 'string' ? route.path : await route.path(request, t)
      await page.goto('about:blank')
      await page.goto(`admin/${path}`)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(route.heading)
      await settle(page)
      const widest = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth))
      expect(widest, `${route.name} width at 320px`).toBeLessThanOrEqual(320)
      const sideways = await page.$$eval('.table-wrap', (els) => els.filter((e) => e.scrollWidth > e.clientWidth + 1).length)
      expect(sideways, `${route.name}: tables scrolling sideways`).toBe(0)
      // A segment of a name never pokes out of its card
      const poking = await page.$$eval('.seg', (segs) =>
        segs
          .filter((s) => {
            const box = s.closest('tr, .tile, .line, .panel, li')?.getBoundingClientRect()
            const r = s.getBoundingClientRect()
            return box && r.width > 0 && (r.right > box.right + 1 || r.left < box.left - 1)
          })
          .map((s) => s.textContent),
      )
      expect(poking, `${route.name}: name segments outside their box`).toEqual([])
    }
  })
})

// ---------- Customer relations ----------

const MANAGER = { id: 'st-1', pin: '1111' }
const auth = (t: string) => ({ authorization: `Bearer ${t}` })
/** Something unique to this run and project, so parallel runs never find each other's records */
const tag = (info: { project: { name: string } }) => `${info.project.name}${String(Date.now()).slice(-6)}`
const form = { consent: true, website: '' }

test.describe('customer relations', () => {
  test('a lead from the website is moved along and noted', async ({ page, request }, info) => {
    const t = await signIn(page, request)
    const name = `คุณทดสอบสอบถาม ${tag(info)}`
    const sent = await request.post('/api/public/leads', { data: { ...form, name, phone: '0812345678', message: 'มีลูกแมวโคราชเพศเมียไหมคะ', refIds: ['korat'] } })
    expect(sent.ok()).toBe(true)
    const { no } = await sent.json()
    const list = await (await request.get(`/api/leads?q=${no}`, { headers: auth(t) })).json()
    await page.goto(`admin/#/leads/${list.rows[0].id}`)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(name)
    await expect(page.getByRole('link', { name: /โทร 0812345678/ })).toHaveAttribute('href', 'tel:0812345678')
    await page.getByRole('button', { name: 'เป็นติดต่อแล้ว' }).click()
    await expect(page.getByLabel('สถานะทั้งหมด')).toHaveValue('contacted')
    await page.getByLabel('บันทึกใหม่').fill('โทรแล้ว ลูกค้าจะมาดูวันเสาร์')
    await page.getByRole('button', { name: 'บันทึก', exact: true }).click()
    await expect(page.getByText('โทรแล้ว ลูกค้าจะมาดูวันเสาร์')).toBeVisible()
    const after = await (await request.get(`/api/leads?q=${no}`, { headers: auth(t) })).json()
    expect(after.rows[0].status).toBe('contacted')
    expect(after.rows[0].notes).toHaveLength(1)
  })

  test('a visit booked on the website is confirmed from the week agenda', async ({ page, request }, info) => {
    const t = await signIn(page, request)
    const who = `คุณนัดชม ${tag(info)}`
    // Each project books on its own days so the parallel runs never want the same slot
    let booked: { no: string; date: string; time: string } | null = null
    for (let d = info.project.name === 'mobile' ? 8 : 3; d < 20 && !booked; d++) {
      const date = new Date(Date.now() + d * 86_400_000 + 7 * 3_600_000).toISOString().slice(0, 10)
      const day = await (await request.get(`/api/public/slots?date=${date}`)).json()
      const free = day.slots?.find((s: { available: boolean }) => s.available)
      if (!free) continue
      const res = await request.post('/api/public/bookings', { data: { ...form, date, time: free.time, name: who, phone: '0899999999', refId: 'ragdoll' } })
      if (res.ok()) booked = await res.json()
    }
    expect(booked, 'found a free slot').not.toBeNull()
    await page.goto(`admin/#/bookings?week=${booked!.date}`)
    await page.getByRole('button', { name: new RegExp(who) }).first().click()
    const dialog = page.getByRole('dialog', { name: `นัด ${booked!.no}` })
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: 'ยืนยันนัด' }).click()
    await expect(dialog.getByText('ยืนยันแล้ว').first()).toBeVisible()
    const rows = (await (await request.get(`/api/bookings?from=${booked!.date}&to=${booked!.date}`, { headers: auth(t) })).json()).rows
    expect(rows.find((b: { no: string }) => b.no === booked!.no).status).toBe('confirmed')
  })

  test('a manager adds a kitten and it appears on the public list', async ({ page, request }, info) => {
    await signIn(page, request, MANAGER)
    const name = `ทดสอบ${tag(info)}`
    await page.goto('admin/#/kittens')
    await page.getByRole('button', { name: 'เพิ่มลูกแมว' }).click()
    const dialog = page.getByRole('dialog', { name: 'เพิ่มลูกแมว' })
    await dialog.getByLabel('สายพันธุ์และเกรด').selectOption('korat-pet')
    await dialog.getByLabel('ชื่อเรียก').fill(name)
    await dialog.getByLabel('สีขน').fill('สีสวาด')
    await dialog.getByLabel('วันเกิด').fill(new Date(Date.now() - 70 * 86_400_000).toISOString().slice(0, 10))
    await dialog.getByRole('button', { name: 'เพิ่มวัคซีน' }).click()
    await dialog.getByLabel('ชื่อวัคซีนเข็มที่ 1').fill('วัคซีนรวมเข็มที่ 1')
    await dialog.getByLabel('วันที่ฉีดเข็มที่ 1').fill(new Date(Date.now() - 14 * 86_400_000).toISOString().slice(0, 10))
    await dialog.getByRole('button', { name: 'เพิ่มลูกแมว' }).click()
    await expect(dialog).toBeHidden()
    const pub = await (await request.get('/api/public/kittens?breed=korat')).json()
    const mine = pub.find((k: { name: string }) => k.name === name)
    expect(mine, 'new kitten listed publicly').toBeTruthy()
    expect(mine.status).toBe('available')
    expect(mine.vaccines).toHaveLength(1)
  })

  test('a paid reservation is collected at the till at the kitten price, with the deposit taken off', async ({ page, request }, info) => {
    const mt = await token(request, MANAGER)
    const id = tag(info)
    // Our own kitten, so no other test can reserve or sell it first
    const added = await request.post('/api/kittens', {
      headers: auth(mt),
      // Its own price, above the SKU's: the server prices each kitten individually
      data: { productId: 'siamese-pet', name: `จอง${id}`, sex: 'male', color: 'ซีลพอยต์', birthDate: new Date(Date.now() - 80 * 86_400_000).toISOString().slice(0, 10), vaccines: [], geneticTests: [], price: 4100 },
    })
    expect(added.ok()).toBe(true)
    const kitten = await added.json()
    const reserved = await request.post('/api/public/reservations', { data: { ...form, unitId: kitten.id, name: `คุณผู้จอง ${id}`, phone: '0877777777', pickup: 'store' } })
    expect(reserved.ok()).toBe(true)
    const r = await reserved.json()
    const paid = await request.post(`/api/public/reservations/${r.no}/pay`, { data: { t: r.token, method: 'promptpay' } })
    expect(paid.ok()).toBe(true)
    const deposit = r.deposit.amount as number
    expect(deposit).toBe(2000)

    await signIn(page, request)
    await page.goto(`admin/#/reservations/${r.id}`)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(`การจอง ${r.no}`)
    await page.getByRole('button', { name: 'เปิดในหน้าขาย' }).click()
    await expect(page).toHaveURL(/#\/pos$/)
    const sheetButton = page.getByRole('button', { name: 'ดูบิลและชำระเงิน' })
    if (await sheetButton.isVisible()) await sheetButton.click()
    await expect(page.getByText(`รับลูกแมวตามการจอง ${r.no}`)).toBeVisible()
    await expect(page.getByText(kitten.code).first()).toBeVisible()
    // The server's figures: 4,100 for this kitten, 2,000 deposit off, 2,100 due today
    const totals = page.locator('.totals')
    await expect(totals).toContainText('หักมัดจำที่ชำระแล้ว')
    await expect(totals.locator('.totals__grand')).toContainText('2,100 บาท')
    const pay = page.getByRole('button', { name: 'รับชำระ 2,100 บาท' })
    await expect(pay).toBeEnabled()
    await pay.click()
    const payDialog = page.getByRole('dialog', { name: 'รับชำระ 2,100 บาท' })
    await payDialog.getByRole('radio', { name: 'โอนเงิน' }).check()
    await payDialog.getByRole('button', { name: 'ยืนยันรับเงินและออกใบเสร็จ' }).click()
    const done = page.getByRole('dialog', { name: /^ขายสำเร็จ MW\d{6}-\d{4}$/ })
    await expect(done).toBeVisible()
    const receipt = done.getByRole('article', { name: /^ใบเสร็จ / })
    await expect(receipt).toContainText(`หักเงินมัดจำ (การจอง ${r.no})`)
    await expect(receipt).toContainText(kitten.code)
    await done.getByRole('button', { name: 'บิลใหม่', exact: true }).click()

    const t = await token(request)
    const detail = await (await request.get(`/api/reservations/${r.id}`, { headers: auth(t) })).json()
    expect(detail.reservation.status).toBe('completed')
    const order = await (await request.get(`/api/orders/${detail.reservation.orderNo}`, { headers: auth(t) })).json()
    expect(order.order.total).toBe(4100)
    expect(order.order.depositApplied).toBe(deposit)
    expect(order.order.payment.amount).toBe(2100)
    expect(order.order.lines[0].unitIds).toEqual([kitten.id])
    const k = await (await request.get(`/api/kittens/${kitten.id}`, { headers: auth(t) })).json()
    expect(k.kitten.status).toBe('sold')
  })

  test('a manager approves a review and only then it shows on the website', async ({ page, request }, info) => {
    await signIn(page, request, MANAGER)
    const id = tag(info)
    const body = `เลี้ยงง่าย ขนนุ่มมาก ${id}`
    const sent = await request.post('/api/public/reviews', { data: { ...form, refId: 'korat', name: `ผู้รีวิว ${id}`, rating: 5, body } })
    expect(sent.ok()).toBe(true)
    const visible = async () => ((await (await request.get('/api/public/reviews?refId=korat')).json()).rows as { body: string }[]).some((x) => x.body === body)
    expect(await visible()).toBe(false)
    await page.goto('admin/#/reviews')
    const card = page.locator('.review', { hasText: body })
    await expect(card).toBeVisible()
    await card.getByRole('button', { name: /อนุมัติให้แสดง/ }).click()
    await expect(card).toBeHidden()
    expect(await visible()).toBe(true)
  })

  test('opening hours are checked before saving and saved with the shop details', async ({ page, request }, info) => {
    test.skip(info.project.name !== 'desktop', 'shop settings are shared; one project is enough')
    await signIn(page, request, MANAGER)
    await page.goto('admin/#/settings')
    // exact: 'เปิด วันอังคาร' (opening time) contains 'ปิด วันอังคาร' as a substring
    const close = page.getByLabel('ปิด วันอังคาร', { exact: true })
    const before = await close.inputValue()
    await close.fill('08:00')
    await page.getByRole('button', { name: 'บันทึกข้อมูลร้าน' }).click()
    await expect(page.getByRole('alert').filter({ hasText: 'วันอังคาร' })).toBeVisible()
    // Put it back unchanged and save: the bookings tests depend on these hours
    await close.fill(before)
    const [req] = await Promise.all([page.waitForRequest((r) => r.url().endsWith('/api/settings') && r.method() === 'PATCH'), page.getByRole('button', { name: 'บันทึกข้อมูลร้าน' }).click()])
    expect(req.postDataJSON().hours.length).toBeGreaterThan(0)
    await expect(page.getByText('บันทึกข้อมูลร้านแล้ว')).toBeVisible()
  })
})
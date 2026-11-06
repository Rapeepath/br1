import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

// The shop pages: contact, visits, kittens and reservations (live from the POS in the preview server),
// FAQ, privacy, aftercare and the cost calculator.
const ROUTES = [
  { name: 'contact', path: '/contact', h1: 'ติดต่อเรา', en: 'Contact us' },
  { name: 'booking', path: '/booking', h1: 'นัดชมลูกแมวที่ร้าน', en: 'Book a visit' },
  { name: 'faq', path: '/faq', h1: 'คำถามที่พบบ่อย', en: 'Frequently asked questions' },
  { name: 'privacy', path: '/privacy', h1: 'นโยบายความเป็นส่วนตัว', en: 'Privacy policy' },
  { name: 'care', path: '/care', h1: 'การดูแลหลังรับเลี้ยง', en: 'Aftercare' },
  { name: 'cost', path: '/cost', h1: 'คำนวณค่าเลี้ยงแมว', en: 'Cost of keeping a cat' },
  { name: 'kittens', path: '/kittens', h1: 'ลูกแมวพร้อมรับ', en: 'Kittens ready for a home' },
]

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

const widest = (page: Page) =>
  page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth))

for (const route of ROUTES) {
  test.describe(`${route.name} page`, () => {
    test('renders cleanly in Thai and English, with no sideways scroll', async ({ page }) => {
      const errors = watchErrors(page)
      await page.goto(route.path)
      await settle(page)
      await expect(page.getByRole('heading', { level: 1 })).toContainText(route.h1)
      expect(await widest(page)).toBeLessThanOrEqual(page.viewportSize()!.width)

      await page.goto(`/en${route.path}`)
      await settle(page)
      await expect(page.locator('html')).toHaveAttribute('lang', 'en')
      await expect(page.getByRole('heading', { level: 1 })).toContainText(route.en)
      expect(errors).toEqual([])
    })

    for (const theme of ['light', 'dark'] as const) {
      test(`has no accessibility violations (${theme})`, async ({ page }) => {
        await page.addInitScript((t) => localStorage.setItem('maew.theme', t), theme)
        await page.goto(route.path)
        await settle(page)
        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
        expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])
      })
    }
  })
}

test('every shop page reflows at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  for (const route of ROUTES) {
    await page.goto(route.path)
    await settle(page)
    expect(await widest(page), `${route.name} at 320px`).toBeLessThanOrEqual(320)
  }
})

test('the FAQ is prerendered with FAQPage structured data in both languages', async ({ request }) => {
  for (const [path, text] of [
    ['/faq', 'จองลูกแมวได้อย่างไร'],
    ['/en/faq', 'How do I reserve a kitten?'],
  ]) {
    const html = await (await request.get(path)).text()
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]))
    const faq = blocks.flat().find((b) => b['@type'] === 'FAQPage')
    expect(faq, path).toBeTruthy()
    expect(JSON.stringify(faq)).toContain(text)
    // The questions are in the page body itself, not only in the data
    expect(html).toContain(text)
  }
})

test('contact: checks the form first, then sends and gives a reference', async ({ page }) => {
  await page.goto('/contact')
  await settle(page)
  await page.getByRole('button', { name: 'ส่งคำถาม' }).click()
  await expect(page.getByText('กรอกชื่อ', { exact: true })).toBeVisible()
  await expect(page.getByRole('textbox', { name: /^ชื่อ/ })).toBeFocused()

  await page.getByRole('textbox', { name: /^ชื่อ/ }).fill('คุณทดสอบ ระบบ')
  await page.getByRole('textbox', { name: /^เบอร์โทร/ }).fill('081-234-5678')
  await page.getByLabel(/^สายพันธุ์ที่สนใจ/).selectOption('persian')
  await page.getByRole('textbox', { name: /^ข้อความ/ }).fill('อยากได้ลูกแมวตัวเมียค่ะ')
  await page.getByRole('checkbox', { name: /ยินยอม/ }).check()
  await page.getByRole('button', { name: 'ส่งคำถาม' }).click()
  await expect(page.getByRole('heading', { name: 'ส่งคำถามแล้ว' })).toBeFocused()
  await expect(page.getByText(/^เลขที่อ้างอิง LD\d{6}-\d{4}$/)).toBeVisible()
})

test('booking: picks a free day and time, books, and offers a calendar file', async ({ page }, info) => {
  await page.goto('/booking')
  await settle(page)
  // The two projects book different days so they never race for one slot
  const days = page.locator('input[name="day"]:not([disabled])')
  await days.nth(info.project.name === 'desktop' ? 2 : 3).check()
  const slot = page.locator('input[name="time"]:not([disabled])').first()
  await expect(slot).toBeVisible()
  await slot.check()

  await page.getByRole('textbox', { name: /^ชื่อ/ }).fill('คุณนัด ชม')
  await page.getByRole('textbox', { name: /^เบอร์โทร/ }).fill('089-555-1234')
  await page.getByRole('checkbox', { name: /ยินยอม/ }).check()
  await page.getByRole('button', { name: 'ยืนยันการนัด' }).click()
  await expect(page.getByRole('heading', { name: 'นัดเรียบร้อยแล้ว' })).toBeVisible()
  await expect(page.getByText(/^เลขที่นัด BK\d{6}-\d{4}$/)).toBeVisible()

  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: /บันทึกลงปฏิทิน/ }).click()
  expect((await download).suggestedFilename()).toMatch(/^BK.*\.ics$/)
})

test('kittens: list → kitten → reserve → pay the deposit → held', async ({ page }, info) => {
  await page.goto('/kittens')
  await settle(page)
  const available = page.locator('.kitten-card[data-status="available"]')
  await expect(available.first()).toBeVisible()
  // Desktop takes the first free kitten, mobile the last shown, so the two runs never want the same one
  const card = info.project.name === 'desktop' ? available.first() : available.last()
  const name = (await card.locator('.kitten-card__name a').textContent())!.trim()
  await card.locator('.kitten-card__name a').click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(name)
  await expect(page.getByText(/^มัดจำ .* หักออกจากราคาตอนรับน้อง$/)).toBeVisible()
  await expect(page.getByText(/ไม่ใช่ภาพของน้องตัวนี้/)).toBeVisible()

  await page.getByRole('link', { name: 'จองน้องตัวนี้' }).click()
  await expect(page).toHaveURL(/\/reserve\//)
  await page.getByRole('textbox', { name: /^ชื่อ/ }).fill('คุณจอง น้องแมว')
  await page.getByRole('textbox', { name: /^เบอร์โทร/ }).fill('082-000-1111')
  await page.getByRole('radio', { name: /ให้ร้านจัดส่ง/ }).check()
  await page.getByRole('button', { name: 'จองและไปชำระมัดจำ' }).click()
  // Delivery needs an address, and consent is still missing
  await expect(page.getByText('กรอกที่อยู่สำหรับจัดส่ง')).toBeVisible()
  await page.getByRole('textbox', { name: /^ที่อยู่จัดส่ง/ }).fill('99 ถนนทดสอบ กรุงเทพฯ')
  await page.getByRole('checkbox', { name: /ยินยอม/ }).check()
  await page.getByRole('button', { name: 'จองและไปชำระมัดจำ' }).click()

  await expect(page).toHaveURL(/\/reservation\/RS\d{6}-\d{4}\?t=\w+/)
  await expect(page.getByText('รอชำระมัดจำ', { exact: true })).toBeVisible()
  await expect(page.getByText(/สแกนจ่ายไม่ได้/)).toBeVisible()
  await page.getByRole('radio', { name: /โอนเงินเข้าบัญชี/ }).check()
  await page.getByRole('button', { name: 'ยืนยันว่าชำระมัดจำแล้ว' }).click()
  await expect(page.getByText('จองแล้ว ร้านกันน้องไว้ให้')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'ขั้นต่อไป' })).toBeVisible()

  // The kitten is now shown as reserved
  await page.getByRole('link', { name: 'ดูข้อมูลน้อง' }).click()
  await expect(page.getByText('ติดจองแล้ว').first()).toBeVisible()
  await expect(page.getByRole('link', { name: 'จองน้องตัวนี้' })).toHaveCount(0)
})

test('a wrong reservation link says so instead of showing anything', async ({ page }) => {
  await page.goto('/reservation/RS000000-0000?t=nope')
  await settle(page)
  await expect(page.getByText('ไม่พบการจองนี้')).toBeVisible()
})

test('privacy: sends a deletion request', async ({ page }) => {
  await page.goto('/privacy')
  await settle(page)
  await page.getByRole('radio', { name: 'ขอลบข้อมูล' }).check()
  await page.getByRole('textbox', { name: /^ชื่อ/ }).fill('คุณขอลบ ข้อมูล')
  await page.getByRole('textbox', { name: /^เบอร์โทร/ }).fill('083-222-3333')
  await page.getByRole('checkbox', { name: /ยินยอม/ }).check()
  await page.getByRole('button', { name: 'ส่งคำขอ' }).click()
  await expect(page.getByRole('heading', { name: 'ได้รับคำขอแล้ว' })).toBeVisible()
  await expect(page.getByText(/^เลขที่คำขอ LD/)).toBeVisible()
})

test('cost: the first-year total follows the kitten price and the instalments add up', async ({ page }) => {
  await page.goto('/cost?price=12000')
  await settle(page)
  const price = page.getByRole('spinbutton', { name: /ราคาลูกแมว/ })
  await expect(price).toHaveValue('12000')
  const withKitten = page.locator('.cost-totals__all dd')
  const before = Number((await withKitten.textContent())!.replace(/\D/g, ''))
  await price.fill('22000')
  await expect.poll(async () => Number((await withKitten.textContent())!.replace(/\D/g, ''))).toBe(before + 10000)
  await expect(page.locator('.cost-inst li').first()).toContainText('7,334')
  await page.getByRole('button', { name: 'ดูเป็นตาราง' }).click()
  await expect(page.getByRole('table')).toContainText('ค่าตัวลูกแมว')
})

test('phones get a floating LINE/call button that stays clear of the compare tray', async ({ page }, info) => {
  await page.addInitScript(() => localStorage.setItem('maew.compare', JSON.stringify(['persian', 'siamese'])))
  await page.goto('/kittens')
  await settle(page)
  const fab = page.getByRole('group', { name: 'ติดต่อร้าน' })
  if (info.project.name === 'desktop') {
    await expect(fab).toBeHidden()
    return
  }
  await expect(fab).toBeVisible()
  await expect(fab.getByRole('link', { name: /^LINE/ })).toHaveAttribute('href', /line\.me/)
  await expect(fab.getByRole('link', { name: /^โทร/ })).toHaveAttribute('href', /^tel:/)
  const tray = page.getByRole('complementary', { name: 'รายการเปรียบเทียบ' })
  await expect(tray).toBeVisible()
  const a = (await fab.boundingBox())!
  const b = (await tray.boundingBox())!
  expect(a.y + a.height).toBeLessThanOrEqual(b.y)
})

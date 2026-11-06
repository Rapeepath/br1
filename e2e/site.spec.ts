import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const ROUTES = [
  { name: 'home', path: '/' },
  { name: 'breed', path: '/breeds/scottish-fold' },
  { name: 'compare', path: '/compare' },
  { name: 'guide', path: '/guide' },
  { name: 'sources', path: '/sources' },
]

/** Collects console errors and failed requests so every test can assert a clean page. */
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
  // Lazy images only load near the viewport; scroll through the page so all of them are fetched.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 40))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForLoadState('networkidle')
}

for (const route of ROUTES) {
  test.describe(`${route.name} page`, () => {
    test('renders cleanly: no errors, no broken images, no sideways scroll', async ({ page }) => {
      const errors = watchErrors(page)
      await page.goto(route.path)
      await settle(page)
      await loadAllImages(page)

      const broken = await page.$$eval('img', (imgs) =>
        imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute('src')),
      )
      expect(broken, 'broken images').toEqual([])

      // Mobile emulation stretches innerWidth to fit wide content, so measure against the device width.
      const deviceWidth = page.viewportSize()!.width
      const widest = await page.evaluate(() =>
        Math.max(document.documentElement.scrollWidth, document.body.scrollWidth, window.innerWidth),
      )
      expect(widest - deviceWidth, 'horizontal overflow (px)').toBeLessThanOrEqual(0)

      expect(errors, 'console/network errors').toEqual([])
    })

    for (const theme of ['light', 'dark'] as const) {
      test(`has no serious accessibility violations (${theme})`, async ({ page }) => {
        await page.addInitScript((t) => localStorage.setItem('maew.theme', t), theme)
        await page.goto(route.path)
        await settle(page)
        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
        const serious = results.violations
          .filter((v) => v.impact === 'serious' || v.impact === 'critical')
          .map((v) => `${v.id}: ${v.help} → ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)
        expect(serious).toEqual([])

        await loadAllImages(page)
        await page.screenshot({
          path: `e2e/screenshots/${test.info().project.name}-${route.name}-${theme}.png`,
          fullPage: true,
        })
      })
    }
  })
}

test('browse → filter → open a breed → back keeps the filter', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('radio', { name: 'ไทย', exact: true }).check()
  await expect(page).toHaveURL(/group=thai/)
  const grid = page.locator('.breed-grid')
  await expect(grid.getByRole('heading', { level: 3 })).toHaveCount(3)

  await grid.getByRole('link', { name: 'วิเชียรมาศ' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('วิเชียรมาศ')

  await page.getByRole('tab', { name: 'สุขภาพ' }).click()
  await expect(page.getByRole('tabpanel')).toBeVisible()

  await page.goBack()
  await expect(page.getByRole('radio', { name: 'ไทย', exact: true })).toBeChecked()
  await expect(grid.getByRole('heading', { level: 3 })).toHaveCount(3)
})

test('compare three breeds from the catalogue', async ({ page }) => {
  await page.goto('/')
  const add = page.getByRole('button', { name: /เพิ่มเพื่อเปรียบเทียบ/ })
  for (let i = 0; i < 3; i++) await add.first().click()
  await expect(page.getByRole('button', { name: /อยู่ในรายการเปรียบเทียบ/ })).toHaveCount(3)

  const tray = page.getByRole('complementary', { name: 'รายการเปรียบเทียบ' })
  await expect(tray).toBeVisible()
  await tray.getByRole('link', { name: /เปรียบเทียบ 3\/3/ }).click()

  const table = page.getByRole('table')
  await expect(table.getByRole('columnheader')).toHaveCount(3)
  await expect(tray).toBeHidden()

  // The choice survives a reload.
  await page.reload()
  await expect(page.getByRole('table').getByRole('columnheader')).toHaveCount(3)
})

test('theme toggle switches and remembers dark mode', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'เปลี่ยนเป็นธีมมืด' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.getByRole('button', { name: 'เปลี่ยนเป็นธีมสว่าง' })).toBeVisible()
})

test('keyboard: skip link and tab arrows work', async ({ page }) => {
  await page.goto('/breeds/korat')
  await settle(page)
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'ข้ามไปยังเนื้อหา' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#main')).toBeFocused()

  await page.getByRole('tab', { name: 'ภาพรวม' }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('tab', { name: 'บุคลิกและนิสัย' })).toBeFocused()
  await expect(page.getByRole('tab', { name: 'บุคลิกและนิสัย' })).toHaveAttribute('aria-selected', 'true')
})

test.describe('regressions found in review', () => {
  test('every route reflows at 320px with a full compare tray (WCAG 1.4.10)', async ({ page }) => {
    await page.addInitScript(() =>
      localStorage.setItem('maew.compare', JSON.stringify(['siamese', 'korat', 'maine-coon'])),
    )
    await page.setViewportSize({ width: 320, height: 720 })
    for (const route of ROUTES) {
      await page.goto(route.path)
      await settle(page)
      const widest = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth))
      expect(widest, `${route.name} width at 320px`).toBeLessThanOrEqual(320)

      // Nothing inside the floating tray may overlap anything else in it.
      const boxes = await page.$$eval('.compare-tray li, .compare-tray .btn', (els) =>
        els
          .map((e) => e.getBoundingClientRect())
          .filter((r) => r.width > 0)
          .map((r) => ({ l: r.left, r: r.right, t: r.top, b: r.bottom })),
      )
      for (let i = 0; i < boxes.length; i++)
        for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i]
          const b = boxes[j]
          const overlap = a.l < b.r - 1 && b.l < a.r - 1 && a.t < b.b - 1 && b.t < a.b - 1
          expect(overlap, `${route.name}: tray items ${i} and ${j} overlap`).toBe(false)
        }
    }
  })

  for (const width of [700, 820]) {
    test(`the tray never overlaps itself at ${width}px with long names`, async ({ page }) => {
      await page.addInitScript(() =>
        localStorage.setItem('maew.compare', JSON.stringify(['exotic-shorthair', 'american-shorthair', 'british-shorthair'])),
      )
      await page.setViewportSize({ width, height: 800 })
      await page.goto('/guide')
      await settle(page)
      const boxes = await page.$$eval('.compare-tray li, .compare-tray .btn', (els) =>
        els.map((e) => e.getBoundingClientRect()).filter((r) => r.width > 0),
      )
      for (let i = 0; i < boxes.length; i++)
        for (let j = i + 1; j < boxes.length; j++) {
          const [a, b] = [boxes[i], boxes[j]]
          const overlap = a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1
          expect(overlap, `items ${i} and ${j} overlap`).toBe(false)
        }
    })
  }

  test('self-disabling buttons hand focus on (compare "เพิ่ม", checklist "เริ่มใหม่")', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('maew.compare', JSON.stringify(['siamese', 'korat'])))
    await page.goto('/compare')
    await settle(page)
    await page.getByLabel('เพิ่มสายพันธุ์').selectOption('bengal')
    await page.getByRole('button', { name: 'เพิ่ม', exact: true }).click()
    await expect(page.getByRole('table').getByRole('columnheader')).toHaveCount(3)
    expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe('BODY')

    await page.goto('/guide')
    await settle(page)
    await page.getByRole('checkbox').first().check()
    await page.getByRole('button', { name: 'เริ่มใหม่' }).click()
    await expect(page.getByRole('checkbox').first()).toBeFocused()
  })

  test('the phone price chart keeps column headers for screen readers', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 })
    await page.goto('/guide')
    await settle(page)
    const chart = page.getByRole('table', { name: /ช่วงราคาลูกแมว/ })
    await expect(chart.getByRole('columnheader')).toHaveCount(4)
  })

  test('the breed pager keeps the filtered list for the way back', async ({ page }) => {
    await page.goto('/?group=thai')
    await settle(page)
    await page.locator('.breed-grid').getByRole('link', { name: 'วิเชียรมาศ' }).click()
    await page.getByRole('link', { name: /ถัดไป/ }).click()
    await page.getByRole('link', { name: 'สายพันธุ์ทั้งหมด' }).click()
    await expect(page).toHaveURL(/group=thai/)
    await expect(page.locator('.breed-grid').getByRole('heading', { level: 3 })).toHaveCount(3)
    await expect(page.locator('#breeds')).toBeFocused()
  })

  test('each route has its own document title', async ({ page }) => {
    const titles = new Set<string>()
    for (const route of ROUTES) {
      await page.goto(route.path)
      await settle(page)
      titles.add(await page.title())
    }
    expect(titles.size).toBe(ROUTES.length)
  })

  test('removing breeds from the tray never drops focus to <body>', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('maew.compare', JSON.stringify(['siamese', 'korat'])))
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/guide')
    await settle(page)
    const tray = page.getByRole('complementary', { name: 'รายการเปรียบเทียบ' })
    await tray.getByRole('button', { name: /นำวิเชียรมาศออก/ }).click()
    expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe('BODY')
    await tray.getByRole('button', { name: /นำโคราช/ }).click()
    expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe('BODY')
    await expect(tray).toBeHidden()
  })

  test('the last breed tab is reachable on a phone-width strip', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 })
    await page.goto('/breeds/bengal')
    await settle(page)
    const last = page.getByRole('tab', { name: 'ก่อนตัดสินใจ' })
    await page.getByRole('tab', { name: 'ภาพรวม' }).focus()
    await page.keyboard.press('End')
    await expect(last).toBeFocused()
    await expect(last).toBeInViewport()
    // Loading a breed page must not scroll the page down to the tabs.
    await page.reload()
    await settle(page)
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
  })
})

test.describe('real URLs, prerendered pages and the English mirror', () => {
  test('old #/ links open the same page at its real address', async ({ page }) => {
    await page.goto('/#/breeds/korat')
    await expect(page).toHaveURL(/\/breeds\/korat$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('โคราช')
  })

  test('pages arrive as HTML with their meta; unknown paths answer 404; sitemap and robots exist', async ({ request }) => {
    const res = await request.get('/breeds/korat')
    expect(res.status()).toBe(200)
    const html = await res.text()
    expect(html).toMatch(/<title>[^<]*โคราช[^<]* – Maew<\/title>/)
    expect(html).toMatch(/<meta property="og:image" content="https?:\/\/[^"]+\/images\/[^"]+"/)
    expect(html).toContain('hreflang="en" href="')
    expect(html).toContain('application/ld+json')
    expect(html).toMatch(/<h1[^>]*>/)

    const missing = await request.get('/no-such-page')
    expect(missing.status()).toBe(404)
    expect(await missing.text()).toContain('noindex')

    const sitemap = await (await request.get('/sitemap.xml')).text()
    expect(sitemap).toContain('/breeds/korat</loc>')
    expect(sitemap).toContain('/en/breeds/korat</loc>')
    expect(await (await request.get('/robots.txt')).text()).toContain('Disallow: /admin')
  })

  test('English pages keep their language while browsing, and the switch returns to Thai', async ({ page }) => {
    await page.goto('/en/compare')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    const nav = page.getByRole('navigation', { name: 'Main menu' })
    await nav.getByRole('link', { name: 'Breeds' }).click()
    await expect(page).toHaveURL(/\/en$/)
    await page.goto('/en/breeds/korat')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/en\/breeds\/korat$/)
    await expect(page).toHaveTitle('Korat – Maew')
    await page.getByRole('link', { name: 'ภาษาไทย' }).click()
    await expect(page).toHaveURL(/\/breeds\/korat$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'th')
  })
})

test.describe('home first screen', () => {
  test('reads as one sentence, keeps the photo capsules decorative and links every breed', async ({ page }) => {
    await page.goto('/')
    await settle(page)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('แมวตัวไหน ที่ใช่ สำหรับบ้านคุณ')
    const capsules = page.locator('.hello .blink')
    await expect(capsules).toHaveCount(2)
    for (const cap of await capsules.all()) await expect(cap).toHaveAttribute('aria-hidden', 'true')
    const rail = page.getByRole('list', { name: /รู้จักทั้ง \d+ สายพันธุ์/ })
    await expect(rail.getByRole('link')).toHaveCount(12)
    await expect(rail.getByRole('link', { name: 'วิเชียรมาศ' })).toHaveAttribute('href', '/breeds/siamese')
    // The live kitten count from the POS shows on the second action
    await expect(page.getByRole('link', { name: /ลูกแมวพร้อมรับ \d+ ตัว/ })).toHaveAttribute('href', '/kittens')
  })

  test.describe('with motion', () => {
    test.use({ reducedMotion: 'no-preference' })

    test('a capsule slow-blinks to another breed when tapped', async ({ page }) => {
      await page.goto('/')
      await settle(page)
      // Let the automatic blinks of the first five seconds finish
      await page.waitForTimeout(5200)
      const cap = page.locator('.hello .blink').first()
      const before = await cap.locator('img:not(.blink__next)').getAttribute('src')
      await cap.click()
      await expect(cap).toHaveClass(/is-blinking/)
      await expect(cap).not.toHaveClass(/is-blinking/, { timeout: 3000 })
      await expect(cap.locator('img:not(.blink__next)')).not.toHaveAttribute('src', before!)
    })

    test('the floating contact button waits until the first screen scrolls away', async ({ page }, info) => {
      test.skip(info.project.name !== 'mobile', 'the floating button is phone-only')
      await page.goto('/')
      await settle(page)
      const fab = page.getByRole('group', { name: 'ติดต่อร้าน' })
      await expect(fab).toBeHidden()
      await page.locator('#breeds').scrollIntoViewIfNeeded()
      await expect(fab).toBeVisible()
    })
  })
})
import { readFileSync } from 'node:fs'
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

// English pages, the breed gallery and owners' reviews (the English mirror lives under /en).
interface BreedLite {
  id: string
  nameTh: string
  nameEn: string
  gallery: { kind: 'image' | 'video'; video?: { url: string } }[]
}
const breeds: BreedLite[] = JSON.parse(readFileSync(new URL('../src/data/breeds.json', import.meta.url), 'utf8'))
const en: { records: Record<string, { nameEn: string; tagline: string }> } = JSON.parse(
  readFileSync(new URL('../src/data/en.json', import.meta.url), 'utf8'),
)
const withGallery = breeds.find((b) => b.gallery.length >= 3)!
const withVideo = breeds.find((b) => b.gallery.some((g) => g.kind === 'video'))!

const EN_ROUTES = ['/en', `/en/breeds/${withGallery.id}`, '/en/compare', '/en/guide', '/en/sources']

function watchErrors(page: Page) {
  const errors: string[] = []
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('response', (r) => {
    if (r.status() >= 400 && !r.url().includes('upload.wikimedia.org')) errors.push(`${r.status()} ${r.url()}`)
  })
  return errors
}

async function settle(page: Page) {
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
}

/**
 * Thai script left in the page's main content once the parts marked lang="th" are set aside (Thai names
 * shown beside English ones, Thai citations) and the shop's live kitten cards, whose kittens have Thai names.
 */
const leftoverThai = (page: Page) =>
  page.evaluate(() => {
    const main = document.querySelector('main')!.cloneNode(true) as Element
    main.querySelectorAll('[lang="th"], .kitten-card__name').forEach((n) => n.remove())
    return [...(main.textContent ?? '').matchAll(/.{0,24}[฀-๿]+.{0,24}/g)].map((m) => m[0])
  })

test.describe('English pages', () => {
  for (const path of EN_ROUTES) {
    test(`${path} is English throughout and accessible`, async ({ page }, info) => {
      const errors = watchErrors(page)
      await page.goto(path)
      await settle(page)
      await expect(page.locator('html')).toHaveAttribute('lang', 'en')
      expect(await leftoverThai(page)).toEqual([])
      expect(errors).toEqual([])
      if (info.project.name !== 'desktop') return
      for (const theme of ['light', 'dark'] as const) {
        await page.evaluate((t) => (document.documentElement.dataset.theme = t), theme)
        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
        const serious = results.violations
          .filter((v) => v.impact === 'serious' || v.impact === 'critical')
          .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
        expect(serious, `${path} (${theme})`).toEqual([])
      }
    })
  }

  test('a prerendered English breed page arrives as English HTML', async ({ request }) => {
    const res = await request.get(`/en/breeds/${withGallery.id}`)
    const html = await res.text()
    expect(html).toContain('<html lang="en"')
    expect(html).toContain(en.records[withGallery.id].tagline)
  })

  test('links stay in English while browsing', async ({ page }) => {
    await page.goto('/en')
    await settle(page)
    await page.locator('.breed-grid').getByRole('link', { name: en.records[withGallery.id].nameEn, exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`/en/breeds/${withGallery.id}$`))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(en.records[withGallery.id].nameEn)
  })
})

test.describe('breed gallery', () => {
  test('opens from the hero, moves with the keyboard and hands focus back', async ({ page }) => {
    const total = withGallery.gallery.length + 1
    await page.goto(`/en/breeds/${withGallery.id}`)
    await settle(page)
    const opener = page.getByRole('button', { name: `View all photos (${total})` })
    await opener.click()
    const dialog = page.getByRole('dialog', { name: `${en.records[withGallery.id].nameEn} gallery` })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText(`1 of ${total}`)).toBeVisible()
    await page.keyboard.press('ArrowRight')
    await expect(dialog.getByText(`2 of ${total}`)).toBeVisible()
    await page.keyboard.press('End')
    await expect(dialog.getByText(`${total} of ${total}`)).toBeVisible()
    await page.keyboard.press('Home')
    await expect(dialog.getByText(`1 of ${total}`)).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(opener).toBeFocused()
  })

  test('a thumbnail opens its own photo', async ({ page }) => {
    await page.goto(`/breeds/${withGallery.id}`)
    await settle(page)
    const strip = page.getByRole('heading', { name: 'ภาพและวิดีโอเพิ่มเติม' }).locator('xpath=ancestor::section[1]')
    await strip.getByRole('button').nth(1).click()
    await expect(page.getByRole('dialog').getByText(`3 จาก ${withGallery.gallery.length + 1}`)).toBeVisible()
  })

  test('videos wait for the visitor: no download before play, never autoplay', async ({ page }) => {
    const fetched: string[] = []
    page.on('request', (r) => {
      if (r.url().includes('upload.wikimedia.org')) fetched.push(r.url())
    })
    const at = withVideo.gallery.findIndex((g) => g.kind === 'video')
    await page.goto(`/breeds/${withVideo.id}`)
    await settle(page)
    const strip = page.getByRole('heading', { name: 'ภาพและวิดีโอเพิ่มเติม' }).locator('xpath=ancestor::section[1]')
    await strip.getByRole('button').nth(at).click()
    const video = page.locator('dialog.lightbox video')
    await expect(video).toBeVisible()
    await expect(video).toHaveAttribute('preload', 'none')
    expect(await video.evaluate((v: HTMLVideoElement) => v.autoplay || !v.paused)).toBe(false)
    expect(fetched).toEqual([])
  })
})

test.describe('owners’ reviews', () => {
  test('a submitted review waits for a manager and is not shown yet', async ({ page }) => {
    const breed = breeds[breeds.length - 1]
    await page.goto(`/en/breeds/${breed.id}`)
    await settle(page)
    const reviews = page.getByRole('region', { name: 'Reviews from owners' })
    await reviews.getByRole('button', { name: 'Write a review' }).click()
    await expect(reviews.getByLabel(/Display name/)).toBeFocused()
    await reviews.getByRole('button', { name: 'Send review' }).click()
    await expect(reviews.getByText('Choose 1 to 5 stars')).toBeVisible()

    const name = `E2E ${Date.now().toString(36)}`
    await reviews.getByLabel(/Display name/).fill(name)
    await reviews.getByRole('radio', { name: '4 stars' }).check()
    await reviews.getByLabel(/Your experience/).fill('Calm, healthy and very affectionate from day one.')
    await reviews.getByRole('checkbox', { name: /publish my display name/ }).check()
    await reviews.getByRole('button', { name: 'Send review' }).click()
    await expect(reviews.getByText('It will appear once a manager has checked it.')).toBeVisible()

    // Pending reviews never reach the public list
    const listed = await page.request.get(`/api/public/reviews?refId=${breed.id}`)
    const body = (await listed.json()) as { rows: { name: string }[] }
    expect(body.rows.some((r) => r.name === name)).toBe(false)
  })
})

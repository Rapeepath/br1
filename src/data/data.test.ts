import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Breed } from '../lib/types'
import { RATING_KEYS } from '../lib/types'
import { breeds, en, market, type GalleryItem } from './index'

// Vitest runs from the project root; import.meta.url is an http URL under jsdom.
const publicDir = join(process.cwd(), 'public')

const galleryOf = (b: Breed) => (b as Breed & { gallery: GalleryItem[] }).gallery
const THAI = /[฀-๿]/
const LICENSE = /^(CC0( 1\.0)?|CC BY(-SA)? \d\.\d|Public domain)$/

describe('breed data', () => {
  it('has the 12 catalogue breeds with unique ids', () => {
    expect(breeds).toHaveLength(12)
    expect(new Set(breeds.map((b) => b.id)).size).toBe(12)
  })

  it.each(breeds.map((b) => [b.id, b] as const))('%s has complete, well-formed fields', (_id, b) => {
    for (const key of ['nameTh', 'nameEn', 'origin', 'tagline', 'summary', 'history'] as const) {
      expect(b[key].trim().length, key).toBeGreaterThan(0)
    }
    expect(['thai', 'international']).toContain(b.group)
    expect(['small', 'medium', 'large']).toContain(b.size)
    expect(['short', 'medium', 'long', 'hairless']).toContain(b.coat.length)

    for (const k of RATING_KEYS) {
      expect(Number.isInteger(b.ratings[k]), k).toBe(true)
      expect(b.ratings[k]).toBeGreaterThanOrEqual(1)
      expect(b.ratings[k]).toBeLessThanOrEqual(5)
    }

    for (const r of [b.weightKg.female, b.weightKg.male, b.lifespanYears]) {
      if (r) expect(r[0]).toBeLessThanOrEqual(r[1])
    }

    expect(b.temperament.length).toBeGreaterThanOrEqual(3)
    expect(b.health.length).toBeGreaterThan(0)
    expect(b.idealFor.length).toBeGreaterThan(0)
    expect(b.considerations.length).toBeGreaterThan(0)
    expect(b.sources.length).toBeGreaterThan(0)
    for (const s of b.sources) expect(s.url).toMatch(/^https?:\/\//)
  })

  it.each(breeds.map((b) => [b.id, b] as const))('%s has local photos and a credited licence', (_id, b) => {
    expect(existsSync(join(publicDir, b.image.src))).toBe(true)
    expect(existsSync(join(publicDir, b.image.srcSmall))).toBe(true)
    expect(b.image.author.trim()).not.toBe('')
    expect(b.image.license.trim()).not.toBe('')
    expect(b.image.page).toMatch(/^https:\/\/commons\.wikimedia\.org\//)
  })

  it('has a price entry for every breed with min ≤ max', () => {
    for (const b of breeds) {
      expect(b.price, b.id).not.toBeNull()
      if (b.price?.min != null && b.price.max != null) expect(b.price.min).toBeLessThanOrEqual(b.price.max)
    }
  })

  it('includes the three Thai heritage breeds used in the hero', () => {
    const thai = breeds.filter((b) => b.group === 'thai').map((b) => b.id)
    expect(thai).toEqual(expect.arrayContaining(['siamese', 'korat', 'khao-manee']))
  })
})

describe('market data', () => {
  it('has guide content for every section', () => {
    expect(market.buyerChecklist.length).toBeGreaterThanOrEqual(5)
    expect(market.vaccineSchedule.length).toBeGreaterThanOrEqual(3)
    expect(market.legalNotes.length).toBeGreaterThan(0)
    expect(market.ownershipCost.monthly.length).toBeGreaterThan(0)
    expect(market.ownershipCost.oneTime.length).toBeGreaterThan(0)
    expect(market.adoption.length).toBeGreaterThan(0)
    expect(market.asOf).toMatch(/^\d{4}-\d{2}$/)
  })

  it('keeps per-visit costs out of the monthly total', () => {
    for (const c of market.ownershipCost.monthly) {
      expect(c.item).not.toMatch(/ต่อครั้ง/)
      expect(c.min).toBeLessThanOrEqual(c.max)
    }
  })
})

describe('gallery', () => {
  it.each(breeds.map((b) => [b.id, b] as const))('%s has 2–4 credited Commons photos and at most one video', (_id, b) => {
    const gallery = galleryOf(b)
    expect(Array.isArray(gallery)).toBe(true)
    const photos = gallery.filter((g) => g.kind === 'image')
    expect(photos.length).toBeGreaterThanOrEqual(2)
    expect(photos.length).toBeLessThanOrEqual(4)
    expect(gallery.filter((g) => g.kind === 'video').length).toBeLessThanOrEqual(1)

    for (const g of gallery) {
      expect(['image', 'video']).toContain(g.kind)
      for (const file of [g.src, g.srcSmall]) {
        expect(file).toMatch(/^images\/gallery\/[a-z-]+-(\d|video)(-sm)?\.jpg$/)
        expect(existsSync(join(publicDir, file)), file).toBe(true)
      }
      expect(g.width).toBeGreaterThan(0)
      expect(g.height).toBeGreaterThan(0)
      expect(g.width).toBeLessThanOrEqual(1600)
      expect(g.page).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/)
      expect(g.page, 'gallery must not repeat the main photo').not.toBe(b.image.page)
      expect(g.author.trim()).not.toBe('')
      expect(g.author).not.toMatch(/[<>]/)
      expect(g.license).toMatch(LICENSE)
      expect(g.alt).toMatch(THAI)
      if (g.focus) expect(g.focus).toMatch(/^\d{1,3}% \d{1,3}%$/)
      if (g.kind === 'video') {
        expect(g.video?.url).toMatch(/^https:\/\/upload\.wikimedia\.org\/.+\.webm$/)
        expect(g.video?.duration).toBeGreaterThan(0)
      } else {
        expect(g.video).toBeUndefined()
      }
    }
  })

  it('never uses the same Commons file or local file twice', () => {
    const items = breeds.flatMap(galleryOf)
    expect(new Set(items.map((g) => g.page)).size).toBe(items.length)
    expect(new Set(items.map((g) => g.src)).size).toBe(items.length)
    const mains = new Set(breeds.map((b) => b.image.page))
    for (const g of items) expect(mains.has(g.page), g.page).toBe(false)
  })
})

describe('English content (en.json)', () => {
  /** English must mirror the Thai value: same array lengths, null where Thai is null, text without Thai script. */
  function expectMirror(th: unknown, eng: unknown, path: string) {
    if (th === null) return expect(eng, path).toBeNull()
    if (typeof th === 'string') {
      expect(typeof eng, path).toBe('string')
      expect((eng as string).trim().length, path).toBeGreaterThan(0)
      expect(eng as string, path).not.toMatch(THAI)
      return
    }
    if (Array.isArray(th)) {
      expect(Array.isArray(eng), path).toBe(true)
      expect((eng as unknown[]).length, `${path} length`).toBe(th.length)
      return th.forEach((x, i) => expectMirror(x, (eng as unknown[])[i], `${path}[${i}]`))
    }
    if (typeof th === 'object') {
      for (const [k, v] of Object.entries(th)) expectMirror(v, (eng as Record<string, unknown>)?.[k], `${path}.${k}`)
    }
  }

  it('has an English record for every breed and nothing else', () => {
    expect(Object.keys(en.records).sort()).toEqual(breeds.map((b) => b.id).sort())
  })

  it.each(breeds.map((b) => [b.id, b] as const))('%s has complete English matching the Thai structure', (id, b) => {
    const r = en.records[id]
    expect(r.nameEn).toBe(b.nameEn)
    for (const k of ['origin', 'tagline', 'summary', 'history', 'welfareNote', 'funFact'] as const) expectMirror(b[k], r[k], k)
    for (const k of ['appearance', 'temperament', 'idealFor', 'considerations'] as const) expectMirror(b[k], r[k], k)
    expectMirror(b.care, r.care, 'care')
    expectMirror(b.health, r.health, 'health')
    expectMirror(b.coat.texture, r.coat.texture, 'coat.texture')
    expectMirror(b.coat.colors, r.coat.colors, 'coat.colors')
    expect(r.coat.length).toBe(b.coat.length)
    expectMirror(b.price?.note, r.price?.note, 'price.note')
    expect(r.price?.min).toBe(b.price?.min)
    expect(r.price?.max).toBe(b.price?.max)

    const th = galleryOf(b)
    expect(r.gallery).toHaveLength(th.length)
    r.gallery.forEach((g, i) => {
      expectMirror(th[i].alt, g.alt, `gallery[${i}].alt`)
      expect({ ...g, alt: '' }).toEqual({ ...th[i], alt: '' })
    })
  })

  it('has English market text aligned with the Thai figures and links', () => {
    const m = en.market
    expectMirror(market.priceFactors, m.priceFactors, 'priceFactors')
    expectMirror(market.buyerChecklist, m.buyerChecklist, 'buyerChecklist')
    expectMirror(market.vaccineSchedule, m.vaccineSchedule, 'vaccineSchedule')
    expectMirror(market.legalNotes, m.legalNotes, 'legalNotes')
    for (const k of ['monthly', 'oneTime'] as const) {
      expect(m.ownershipCost[k]).toHaveLength(market.ownershipCost[k].length)
      m.ownershipCost[k].forEach((c, i) => {
        expectMirror(market.ownershipCost[k][i].item, c.item, `ownershipCost.${k}[${i}]`)
        expect([c.min, c.max]).toEqual([market.ownershipCost[k][i].min, market.ownershipCost[k][i].max])
      })
    }
    expect(m.ownershipCost.monthly.some((c) => /per visit/i.test(c.item))).toBe(false)
    expect(m.adoption).toHaveLength(market.adoption.length)
    m.adoption.forEach((a, i) => {
      expect(a.url).toBe(market.adoption[i].url)
      expectMirror(market.adoption[i].detail, a.detail, `adoption[${i}].detail`)
      expect(a.name).not.toMatch(THAI)
    })
    expect(m.asOf).toBe(market.asOf)
  })
})

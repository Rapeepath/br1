import { describe, expect, it } from 'vitest'
import { breeds } from '../data'
import { applyFilters, DEFAULT_FILTERS, isFiltered, type Filters } from './filter'
import { formatMonthTh, formatPrice, formatRange, overallWeight } from './format'

const run = (patch: Partial<Filters>) => applyFilters(breeds, { ...DEFAULT_FILTERS, ...patch })

describe('applyFilters', () => {
  it('returns every breed in catalogue order by default', () => {
    expect(run({}).map((b) => b.id)).toEqual(breeds.map((b) => b.id))
  })

  it('filters by group', () => {
    const thai = run({ group: 'thai' })
    expect(thai.length).toBeGreaterThan(0)
    expect(thai.every((b) => b.group === 'thai')).toBe(true)
    expect(run({ group: 'international' }).length + thai.length).toBe(breeds.length)
  })

  it('filters by coat length and size together', () => {
    const res = run({ coat: 'long', size: 'large' })
    expect(res.every((b) => b.coat.length === 'long' && b.size === 'large')).toBe(true)
  })

  it('searches Thai and English names, case-insensitively', () => {
    expect(run({ q: 'วิเชียร' }).map((b) => b.id)).toContain('siamese')
    expect(run({ q: 'MAINE' }).map((b) => b.id)).toEqual(['maine-coon'])
    expect(run({ q: '  ragdoll  ' }).map((b) => b.id)).toEqual(['ragdoll'])
  })

  it('requires every search term to match', () => {
    expect(run({ q: 'siamese maine' })).toHaveLength(0)
  })

  it('returns nothing for an unmatched query', () => {
    expect(run({ q: 'ไม่มีแมวชื่อนี้แน่นอน' })).toHaveLength(0)
  })

  it('sorts by price both ways, with unknown prices last', () => {
    const mid = (id: string) => {
      const p = breeds.find((b) => b.id === id)!.price
      return p?.min != null && p?.max != null ? (p.min + p.max) / 2 : null
    }
    const asc = run({ sort: 'priceAsc' }).map((b) => mid(b.id))
    const known = asc.filter((x): x is number => x != null)
    expect(known).toEqual([...known].sort((a, b) => a - b))
    expect(asc.slice(known.length).every((x) => x == null)).toBe(true)

    const desc = run({ sort: 'priceDesc' }).map((b) => mid(b.id)).filter((x): x is number => x != null)
    expect(desc).toEqual([...desc].sort((a, b) => b - a))
  })

  it('sorts by lifespan, longest first', () => {
    const maxes = run({ sort: 'lifespanDesc' }).map((b) => b.lifespanYears?.[1] ?? 0)
    expect(maxes).toEqual([...maxes].sort((a, b) => b - a))
  })

  it('sorts by Thai name', () => {
    const names = run({ sort: 'name' }).map((b) => b.nameTh)
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'th')))
  })

  it('does not mutate the source list', () => {
    const before = breeds.map((b) => b.id)
    run({ sort: 'name' })
    expect(breeds.map((b) => b.id)).toEqual(before)
  })
})

describe('isFiltered', () => {
  it('ignores sort and whitespace-only queries', () => {
    expect(isFiltered({ ...DEFAULT_FILTERS, sort: 'name', q: '   ' })).toBe(false)
    expect(isFiltered({ ...DEFAULT_FILTERS, group: 'thai' })).toBe(true)
  })
})

describe('formatters', () => {
  it('formats ranges and collapses equal ends', () => {
    expect(formatRange([3, 5], 'กก.')).toBe('3–5 กก.')
    expect(formatRange([15, 15], 'ปี')).toBe('15 ปี')
    expect(formatRange(null, 'ปี')).toBeNull()
  })

  it('formats prices with thousands separators', () => {
    expect(formatPrice(15000, 40000)).toBe('15,000–40,000 บาท')
    expect(formatPrice(null, null)).toBeNull()
    expect(formatPrice(8000, null)).toBe('เริ่มต้น 8,000 บาท')
  })

  it('merges female and male weight into one span', () => {
    expect(overallWeight({ female: [3, 4], male: [4, 6] })).toEqual([3, 6])
    expect(overallWeight({ female: null, male: null })).toBeNull()
  })

  it('renders months in the Buddhist era', () => {
    expect(formatMonthTh('2026-10')).toBe('ตุลาคม 2569')
  })
})

import { overallWeight } from './format'
import type { Breed, CoatLength, Group, Size } from './types'

export type SortKey = 'default' | 'name' | 'priceAsc' | 'priceDesc' | 'sizeAsc' | 'lifespanDesc'

export interface Filters {
  q: string
  group: 'all' | Group
  coat: 'all' | CoatLength
  size: 'all' | Size
  sort: SortKey
}

export const DEFAULT_FILTERS: Filters = { q: '', group: 'all', coat: 'all', size: 'all', sort: 'default' }

export const SORT_LABEL: Record<SortKey, string> = {
  default: 'แนะนำ',
  name: 'ชื่อ ก–ฮ',
  priceAsc: 'ราคาน้อยไปมาก',
  priceDesc: 'ราคามากไปน้อย',
  sizeAsc: 'ตัวเล็กไปใหญ่',
  lifespanDesc: 'อายุขัยยาวที่สุด',
}

const normalize = (s: string) => s.toLocaleLowerCase('th').normalize('NFC').trim()

function haystack(b: Breed): string {
  return normalize(
    [b.nameTh, b.nameEn, b.origin, b.tagline, ...b.temperament, ...b.coat.colors].join(' '),
  )
}

/** Midpoint of the known price range; unknown prices sort last in both directions. */
const priceMid = (b: Breed) =>
  b.price && b.price.min != null && b.price.max != null ? (b.price.min + b.price.max) / 2 : null

const weightMid = (b: Breed) => {
  const w = overallWeight(b.weightKg)
  return w ? (w[0] + w[1]) / 2 : Number.POSITIVE_INFINITY
}

const lifespanMax = (b: Breed) => b.lifespanYears?.[1] ?? 0

function byNullableNumber(a: number | null, b: number | null, dir: 1 | -1) {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  return (a - b) * dir
}

export function applyFilters(breeds: Breed[], f: Filters): Breed[] {
  const terms = normalize(f.q).split(/\s+/).filter(Boolean)

  const matched = breeds.filter((b) => {
    if (f.group !== 'all' && b.group !== f.group) return false
    if (f.coat !== 'all' && b.coat.length !== f.coat) return false
    if (f.size !== 'all' && b.size !== f.size) return false
    if (terms.length === 0) return true
    const text = haystack(b)
    return terms.every((t) => text.includes(t))
  })

  const sorted = [...matched]
  switch (f.sort) {
    case 'name':
      sorted.sort((a, b) => a.nameTh.localeCompare(b.nameTh, 'th'))
      break
    case 'priceAsc':
      sorted.sort((a, b) => byNullableNumber(priceMid(a), priceMid(b), 1))
      break
    case 'priceDesc':
      sorted.sort((a, b) => byNullableNumber(priceMid(a), priceMid(b), -1))
      break
    case 'sizeAsc':
      sorted.sort((a, b) => weightMid(a) - weightMid(b))
      break
    case 'lifespanDesc':
      sorted.sort((a, b) => lifespanMax(b) - lifespanMax(a))
      break
    case 'default':
      break
  }
  return sorted
}

export function isFiltered(f: Filters): boolean {
  return f.q.trim() !== '' || f.group !== 'all' || f.coat !== 'all' || f.size !== 'all'
}

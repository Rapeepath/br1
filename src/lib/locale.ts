// Language-aware labels and formatters for the brochure pages. Thai comes from format.ts (unchanged, so the
// Thai pages read exactly as before); English sits beside it here.
import type { Lang } from '../i18n'
import {
  COAT_LABEL,
  CONFIDENCE_LABEL,
  CONFIDENCE_SHORT,
  formatMonthTh,
  formatNumber,
  formatPrice,
  formatRange,
  GROUP_LABEL,
  RATING_GROUPS,
  RATING_HINT,
  RATING_LABEL,
  SIZE_LABEL,
} from './format'
import type { CoatLength, Confidence, Group, Range, RatingKey, Size } from './types'

export interface Labels {
  group: Record<Group, string>
  size: Record<Size, string>
  coat: Record<CoatLength, string>
  confidence: Record<Confidence, string>
  confidenceShort: Record<Confidence, string>
  rating: Record<RatingKey, string>
  ratingHint: Partial<Record<RatingKey, string>>
  ratingGroups: { title: string; keys: RatingKey[] }[]
  /** "ระดับ 3 จาก 5" / "3 out of 5" for a meter's accessible name */
  meter: (label: string, v: number, max: number) => string
  kg: string
  years: string
  unknown: string
  noPrice: string
}

const TH: Labels = {
  group: GROUP_LABEL,
  size: SIZE_LABEL,
  coat: COAT_LABEL,
  confidence: CONFIDENCE_LABEL,
  confidenceShort: CONFIDENCE_SHORT,
  rating: RATING_LABEL,
  ratingHint: RATING_HINT,
  ratingGroups: RATING_GROUPS,
  meter: (label, v, max) => `${label} ระดับ ${v} จาก ${max}`,
  kg: 'กก.',
  years: 'ปี',
  unknown: 'ไม่ระบุ',
  noPrice: 'ยังไม่มีข้อมูลราคา',
}

const EN: Labels = {
  group: { thai: 'Thai breed', international: 'International breed' },
  size: { small: 'Small', medium: 'Medium', large: 'Large' },
  coat: { short: 'Short coat', medium: 'Semi-long coat', long: 'Long coat', hairless: 'Hairless' },
  confidence: {
    high: 'Price data fairly complete',
    medium: 'Price data moderate',
    low: 'Little price data',
  },
  confidenceShort: { high: 'High', medium: 'Medium', low: 'Low' },
  rating: {
    energy: 'Energy',
    affection: 'Affection',
    vocal: 'Vocal',
    intelligence: 'Intelligence',
    socialNeeds: 'Dislikes being alone',
    kidFriendly: 'Good with children',
    petFriendly: 'Good with other pets',
    grooming: 'Grooming',
    shedding: 'Shedding',
  },
  ratingHint: {
    grooming: 'Higher means brushing more often',
    socialNeeds: 'Higher means it needs people or a companion around',
  },
  ratingGroups: [
    { title: 'Personality', keys: ['energy', 'affection', 'vocal', 'intelligence', 'socialNeeds'] },
    { title: 'Living together', keys: ['kidFriendly', 'petFriendly'] },
    { title: 'Upkeep', keys: ['grooming', 'shedding'] },
  ],
  meter: (label, v, max) => `${label}: ${v} out of ${max}`,
  kg: 'kg',
  years: 'years',
  unknown: 'Not stated',
  noPrice: 'No price data yet',
}

export const labels = (lang: Lang): Labels => (lang === 'en' ? EN : TH)

export const num = formatNumber

/** "3–5 กก." / "3–5 kg"; null when unknown. */
export const range = (r: Range | null | undefined, unit: 'kg' | 'years', lang: Lang): string | null =>
  formatRange(r, labels(lang)[unit])

/** "2,000–10,000 บาท" / "2,000–10,000 baht"; null when there is no price. */
export function price(min: number | null, max: number | null, lang: Lang): string | null {
  if (lang === 'th') return formatPrice(min, max)
  if (min == null && max == null) return null
  if (min != null && max != null) return `${formatNumber(min)}–${formatNumber(max)} baht`
  if (min != null) return `from ${formatNumber(min)} baht`
  return `up to ${formatNumber(max as number)} baht`
}

/** The currency word a price string ends with, for setting it smaller than the figure. */
export const CURRENCY = /^(.*\d)\s+(บาท|baht)$/

const EN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/** "2026-10" → "ตุลาคม 2569" (Buddhist Era) or "October 2026". */
export function month(yyyyMm: string, lang: Lang): string {
  if (lang === 'th') return formatMonthTh(yyyyMm)
  const [y, m] = yyyyMm.split('-').map(Number)
  return y && m ? `${EN_MONTHS[m - 1]} ${y}` : yyyyMm
}

/** A Gregorian ISO date as the reader expects: "6 พ.ย. 2569" / "6 Nov 2026" (Bangkok time). */
export function date(iso: string, lang: Lang): string {
  return new Date(iso).toLocaleDateString(lang === 'en' ? 'en-GB' : 'th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Bangkok',
  })
}

/** Picks the copy for the current language from a `{ th, en }` pair. */
export const pick = <T,>(copy: { th: T; en: T }, lang: Lang): T => copy[lang]

/**
 * lang attribute for a string shown on a page of the other language (citations, names, credits): Thai text
 * on an English page gets lang="th", Latin text on a Thai page lang="en", so screen readers switch voice.
 */
export function textLang(s: string, page: Lang): 'en' | 'th' | undefined {
  const thai = /[\u0E00-\u0E7F]/.test(s)
  if (page === 'en') return thai ? 'th' : undefined
  return thai ? undefined : 'en'
}

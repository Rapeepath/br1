import type { CoatLength, Confidence, Group, Range, RatingKey, Size } from './types'

const number = new Intl.NumberFormat('th-TH')

export const formatNumber = (n: number) => number.format(n)

/** "3–5 กก." — collapses equal ends, returns null when the range is unknown. */
export function formatRange(range: Range | null | undefined, unit: string): string | null {
  if (!range) return null
  const [min, max] = range
  const body = min === max ? formatNumber(min) : `${formatNumber(min)}–${formatNumber(max)}`
  return `${body} ${unit}`
}

export function formatPrice(min: number | null, max: number | null): string | null {
  if (min == null && max == null) return null
  if (min != null && max != null) return `${formatNumber(min)}–${formatNumber(max)} บาท`
  if (min != null) return `เริ่มต้น ${formatNumber(min)} บาท`
  return `ไม่เกิน ${formatNumber(max as number)} บาท`
}

/** Combined female/male weight span, used where space is tight (cards, sorting). */
export function overallWeight(w: { female: Range | null; male: Range | null }): Range | null {
  const parts = [w.female, w.male].filter((r): r is Range => r != null)
  if (parts.length === 0) return null
  return [Math.min(...parts.map((r) => r[0])), Math.max(...parts.map((r) => r[1]))]
}

export const GROUP_LABEL: Record<Group, string> = {
  thai: 'สายพันธุ์ไทย',
  international: 'สายพันธุ์ต่างประเทศ',
}

export const SIZE_LABEL: Record<Size, string> = {
  small: 'เล็ก',
  medium: 'กลาง',
  large: 'ใหญ่',
}

export const COAT_LABEL: Record<CoatLength, string> = {
  short: 'ขนสั้น',
  medium: 'ขนกึ่งยาว',
  long: 'ขนยาว',
  hairless: 'ไม่มีขน',
}

export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  high: 'ข้อมูลราคาค่อนข้างครบ',
  medium: 'ข้อมูลราคาปานกลาง',
  low: 'ข้อมูลราคามีน้อย',
}

export const CONFIDENCE_SHORT: Record<Confidence, string> = {
  high: 'สูง',
  medium: 'ปานกลาง',
  low: 'ต่ำ',
}

export const RATING_LABEL: Record<RatingKey, string> = {
  energy: 'ระดับพลังงาน',
  affection: 'ความขี้อ้อน',
  vocal: 'ความช่างส่งเสียง',
  intelligence: 'ความฉลาด',
  socialNeeds: 'ไม่ชอบอยู่ลำพัง',
  kidFriendly: 'เข้ากับเด็ก',
  petFriendly: 'เข้ากับสัตว์อื่น',
  grooming: 'การดูแลขน',
  shedding: 'ขนร่วง',
}

export const RATING_HINT: Partial<Record<RatingKey, string>> = {
  grooming: 'ยิ่งสูงยิ่งต้องแปรงขนบ่อย',
  socialNeeds: 'ยิ่งสูงยิ่งต้องมีคนหรือเพื่อนอยู่ด้วย',
}

/** Rating groups shown on the breed page, so nine bars read as three short lists. */
export const RATING_GROUPS: { title: string; keys: RatingKey[] }[] = [
  { title: 'บุคลิก', keys: ['energy', 'affection', 'vocal', 'intelligence', 'socialNeeds'] },
  { title: 'การอยู่ร่วมกัน', keys: ['kidFriendly', 'petFriendly'] },
  { title: 'งานดูแล', keys: ['grooming', 'shedding'] },
]

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
]

/** "2026-10" → "ตุลาคม 2569" (Buddhist Era, as Thai readers expect). */
export function formatMonthTh(yyyyMm: string): string {
  const [y, m] = yyyyMm.split('-').map(Number)
  if (!y || !m) return yyyyMm
  return `${THAI_MONTHS[m - 1]} ${y + 543}`
}

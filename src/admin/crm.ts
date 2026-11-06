// Labels and small rules for the customer-relations screens (leads, bookings, kittens, reservations, reviews).
// Pure functions, so they can be unit-tested; the server stays the authority on every change.
import type {
  BookingStatus,
  GeneticResult,
  KittenStatus,
  Lead,
  LeadKind,
  LeadStatus,
  OpeningHours,
  ReservationStatus,
  ReviewStatus,
  Sex,
} from '../../server/types.ts'

export const LEAD_KIND_LABEL: Record<LeadKind, string> = {
  inquiry: 'สอบถาม',
  booking: 'นัดชมลูกแมว',
  quote: 'ขอใบเสนอราคา',
  reservation: 'จองลูกแมว',
  privacy: 'คำขอตาม PDPA',
}

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  new: 'ใหม่',
  contacted: 'ติดต่อแล้ว',
  scheduled: 'นัดแล้ว',
  won: 'ปิดการขาย',
  lost: 'ไม่สำเร็จ',
  closed: 'ปิดเรื่อง',
}

/** Badge tone per lead status */
export const LEAD_STATUS_TONE: Record<LeadStatus, string> = {
  new: 'peach',
  contacted: 'sky',
  scheduled: 'lavender',
  won: 'mint',
  lost: 'rose',
  closed: 'butter',
}

export const LEAD_STATUSES = Object.keys(LEAD_STATUS_LABEL) as LeadStatus[]

/**
 * What staff usually do next with a lead in this status, so the detail page offers it first. Every status
 * stays reachable from the full status list; this only orders the shortcuts.
 */
export function nextLeadSteps(status: LeadStatus, kind: LeadKind): LeadStatus[] {
  if (kind === 'privacy') return status === 'closed' ? [] : ['contacted', 'closed'].filter((s) => s !== status) as LeadStatus[]
  switch (status) {
    case 'new':
      return ['contacted', 'scheduled', 'lost']
    case 'contacted':
      return ['scheduled', 'won', 'lost']
    case 'scheduled':
      return ['won', 'lost']
    case 'won':
    case 'lost':
      return ['closed']
    case 'closed':
      return []
  }
}

export const PRIVACY_REQUEST_LABEL: Record<NonNullable<Lead['request']>, string> = {
  access: 'ขอดูข้อมูลที่ร้านเก็บไว้',
  delete: 'ขอให้ลบข้อมูล',
  correct: 'ขอแก้ไขข้อมูล',
}

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  pending: 'รอยืนยัน',
  confirmed: 'ยืนยันแล้ว',
  done: 'มาตามนัด',
  'no-show': 'ไม่มาตามนัด',
  cancelled: 'ยกเลิก',
}

export const BOOKING_STATUS_TONE: Record<BookingStatus, string> = {
  pending: 'butter',
  confirmed: 'mint',
  done: 'sky',
  'no-show': 'rose',
  cancelled: 'lavender',
}

/** The actions a booking in this status can take next. */
export function bookingActions(status: BookingStatus): BookingStatus[] {
  switch (status) {
    case 'pending':
      return ['confirmed', 'cancelled']
    case 'confirmed':
      return ['done', 'no-show', 'cancelled']
    case 'done':
    case 'no-show':
    case 'cancelled':
      return []
  }
}

/** Button wording for a booking action */
export const BOOKING_ACTION_LABEL: Record<BookingStatus, string> = {
  pending: 'ย้อนเป็นรอยืนยัน',
  confirmed: 'ยืนยันนัด',
  done: 'ลูกค้ามาแล้ว',
  'no-show': 'ไม่มาตามนัด',
  cancelled: 'ยกเลิกนัด',
}

export const KITTEN_STATUS_LABEL: Record<KittenStatus, string> = {
  available: 'พร้อมขาย',
  reserved: 'ติดจอง',
  sold: 'มีเจ้าของแล้ว',
  withdrawn: 'งดขาย',
}

export const KITTEN_STATUS_TONE: Record<KittenStatus, string> = {
  available: 'mint',
  reserved: 'butter',
  sold: 'sky',
  withdrawn: 'rose',
}

export const SEX_LABEL: Record<Sex, string> = { male: 'ตัวผู้', female: 'ตัวเมีย' }

export const GENETIC_LABEL: Record<GeneticResult, string> = {
  negative: 'ไม่พบยีน',
  carrier: 'เป็นพาหะ',
  'not-tested': 'ยังไม่ได้ตรวจ',
}

export const RESERVATION_STATUS_LABEL: Record<ReservationStatus, string> = {
  'pending-payment': 'รอชำระมัดจำ',
  held: 'ชำระมัดจำแล้ว รอรับ',
  completed: 'รับลูกแมวแล้ว',
  cancelled: 'ยกเลิก',
  expired: 'หมดเวลา',
}

export const RESERVATION_STATUS_TONE: Record<ReservationStatus, string> = {
  'pending-payment': 'butter',
  held: 'mint',
  completed: 'sky',
  cancelled: 'rose',
  expired: 'lavender',
}

export const PICKUP_LABEL = { store: 'รับที่ร้าน', delivery: 'จัดส่งถึงบ้าน' } as const

export const REVIEW_STATUS_LABEL: Record<ReviewStatus, string> = {
  pending: 'รอตรวจ',
  approved: 'แสดงบนเว็บ',
  rejected: 'ไม่แสดง',
}

export const REVIEW_STATUS_TONE: Record<ReviewStatus, string> = {
  pending: 'butter',
  approved: 'mint',
  rejected: 'rose',
}

// ---------- Contact links ----------

/** tel: link with only the digits (and a leading +) a dialler accepts. */
export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`

/**
 * A LINE chat link for a customer's LINE id: an official account (@…) opens its chat, a personal id can only
 * be searched in the app, so it opens LINE's add-friend page with the id.
 */
export function lineHref(lineId: string): string {
  const id = lineId.trim()
  if (id.startsWith('@')) return `https://line.me/R/ti/p/${encodeURIComponent(id)}`
  return `https://line.me/R/ti/p/~${encodeURIComponent(id)}`
}

// ---------- Time ----------

const MINUTE = 60_000

/**
 * "เหลือ 1 ชม. 20 นาที" until a deadline, "เหลือไม่ถึง 1 นาที" in the last minute, "หมดเวลาแล้ว" after it.
 * Days are spelled out beyond 24 hours ("เหลือ 1 วัน 3 ชม.").
 */
export function countdown(until: string, now: Date = new Date()): { text: string; urgent: boolean; over: boolean } {
  const ms = new Date(until).getTime() - now.getTime()
  if (ms <= 0) return { text: 'หมดเวลาแล้ว', urgent: true, over: true }
  const mins = Math.floor(ms / MINUTE)
  if (mins < 1) return { text: 'เหลือไม่ถึง 1 นาที', urgent: true, over: false }
  const days = Math.floor(mins / 1440)
  const hours = Math.floor((mins % 1440) / 60)
  const rest = mins % 60
  const parts = days ? [`${days} วัน`, hours ? `${hours} ชม.` : ''] : [hours ? `${hours} ชม.` : '', rest ? `${rest} นาที` : '']
  return { text: `เหลือ ${parts.filter(Boolean).join(' ')}`, urgent: ms < 2 * 60 * MINUTE, over: false }
}

/** Age from a YYYY-MM-DD birth date (Bangkok): "11 สัปดาห์", "4 เดือน" past 16 weeks. */
export function ageText(birthDate: string, now: Date = new Date()): string {
  const days = Math.floor((now.getTime() - new Date(`${birthDate}T00:00:00+07:00`).getTime()) / 86_400_000)
  if (days < 0) return 'ยังไม่เกิด'
  const weeks = Math.floor(days / 7)
  if (weeks < 1) return `${days} วัน`
  if (weeks <= 16) return `${weeks} สัปดาห์`
  return `${Math.floor(days / 30.44)} เดือน`
}

/** Monday of the week a YYYY-MM-DD day falls in. */
export function weekStart(day: string): string {
  const d = new Date(`${day}T00:00:00Z`)
  const back = (d.getUTCDay() + 6) % 7
  d.setUTCDate(d.getUTCDate() - back)
  return d.toISOString().slice(0, 10)
}

/** The seven days from `start`. */
export function weekDays(start: string): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(`${start}T00:00:00Z`)
    d.setUTCDate(d.getUTCDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

// ---------- Opening hours ----------

export const WEEKDAY_LABEL = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']

/** One editor row per weekday, Monday first (as a Thai shop's week is read). */
export interface HoursRow {
  day: number
  open: boolean
  from: string
  to: string
}

export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]

export function hoursToRows(hours: OpeningHours[] | undefined): HoursRow[] {
  return WEEK_ORDER.map((day) => {
    const h = hours?.find((x) => x.day === day)
    return { day, open: !!h, from: h?.open ?? '10:00', to: h?.close ?? '19:00' }
  })
}

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/

/** Rows back to the stored list, or the first problem found (closed days are simply left out). */
export function rowsToHours(rows: HoursRow[]): { hours: OpeningHours[]; error: string | null } {
  const hours: OpeningHours[] = []
  for (const r of rows) {
    if (!r.open) continue
    if (!HHMM.test(r.from) || !HHMM.test(r.to)) return { hours, error: `วัน${WEEKDAY_LABEL[r.day]}: ใส่เวลาเป็น ชม.:นาที เช่น 10:00` }
    if (r.from >= r.to) return { hours, error: `วัน${WEEKDAY_LABEL[r.day]}: เวลาปิดต้องหลังเวลาเปิด` }
    hours.push({ day: r.day, open: r.from, close: r.to })
  }
  if (!hours.length) return { hours, error: 'เปิดร้านอย่างน้อยหนึ่งวัน ลูกค้าจะได้จองเวลานัดได้' }
  return { hours: hours.sort((a, b) => a.day - b.day), error: null }
}

/** "จันทร์–ศุกร์ 10:00–20:00, เสาร์ 10:00–18:00" style summary for the settings preview. */
export function hoursSummary(hours: OpeningHours[] | undefined): string {
  if (!hours?.length) return 'ยังไม่ได้ตั้งเวลาเปิดร้าน'
  const byDay = new Map(hours.map((h) => [h.day, `${h.open}–${h.close}`]))
  const groups: { days: number[]; time: string | null }[] = []
  for (const d of WEEK_ORDER) {
    const time = byDay.get(d) ?? null
    const last = groups[groups.length - 1]
    if (last && last.time === time) last.days.push(d)
    else groups.push({ days: [d], time })
  }
  return groups
    .map((g) => {
      const days = g.days.length > 2 ? `${WEEKDAY_LABEL[g.days[0]]}–${WEEKDAY_LABEL[g.days[g.days.length - 1]]}` : g.days.map((d) => WEEKDAY_LABEL[d]).join(' ')
      return `${days} ${g.time ?? 'ปิด'}`
    })
    .join(', ')
}

// ---------- Kitten form ----------

export interface KittenDraft {
  productId: string
  name: string
  sex: Sex
  color: string
  birthDate: string
  microchip: boolean
  vaccines: { name: string; date: string }[]
  vetCheckAt: string
  geneticTests: { name: string; result: GeneticResult }[]
  sire: string
  dam: string
  price: string
  note: string
}

/** The PATCH/POST body for a kitten form; empty optional fields become null so the server clears them. */
export function kittenBody(d: KittenDraft) {
  const price = d.price.replace(/[,\s]/g, '')
  return {
    productId: d.productId,
    name: d.name.trim(),
    sex: d.sex,
    color: d.color.trim(),
    birthDate: d.birthDate,
    microchip: d.microchip,
    vaccines: d.vaccines.filter((v) => v.name.trim() || v.date).map((v) => ({ name: v.name.trim(), date: v.date })),
    vetCheckAt: d.vetCheckAt || null,
    geneticTests: d.geneticTests.filter((t) => t.name.trim()).map((t) => ({ name: t.name.trim(), result: t.result })),
    sire: d.sire.trim(),
    dam: d.dam.trim(),
    price: price === '' ? null : Number(price),
    note: d.note.trim() || null,
  }
}

/** Checks the form says what the server will insist on, so errors appear next to the fields at once. */
export function kittenProblems(d: KittenDraft, today: string): Partial<Record<keyof KittenDraft, string>> {
  const out: Partial<Record<keyof KittenDraft, string>> = {}
  if (!d.productId) out.productId = 'เลือกสายพันธุ์และเกรด'
  if (!d.name.trim()) out.name = 'ตั้งชื่อเรียกลูกแมว'
  if (!d.color.trim()) out.color = 'ระบุสีขน'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.birthDate)) out.birthDate = 'ใส่วันเกิด'
  else if (d.birthDate > today) out.birthDate = 'วันเกิดต้องไม่อยู่ในอนาคต'
  if (d.vaccines.some((v) => (v.name.trim() && !v.date) || (!v.name.trim() && v.date))) out.vaccines = 'วัคซีนแต่ละเข็มต้องมีทั้งชื่อและวันที่'
  const price = d.price.replace(/[,\s]/g, '')
  if (price !== '' && !(Number(price) > 0)) out.price = 'ราคาต้องเป็นตัวเลขมากกว่า 0 หรือเว้นว่างไว้'
  return out
}

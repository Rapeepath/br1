// Pure helpers for the shop pages (contact, booking, kittens, cost): Bangkok calendar days, opening
// hours, the booking window, .ics files, money and the cost calculator. No React here, so they are
// unit-tested directly (shop.test.ts).
import type { Lang } from '../i18n'
import type { OpeningHours } from './storeInfo'

export const BKK_TZ = 'Asia/Bangkok'
const BKK_OFFSET_MS = 7 * 3_600_000

/** Bangkok calendar day (YYYY-MM-DD) of an instant; Thailand has no daylight saving. */
export const bkkDay = (at: Date | number = Date.now()): string =>
  new Date(new Date(at).getTime() + BKK_OFFSET_MS).toISOString().slice(0, 10)

/** Minutes after midnight, Bangkok time. */
export const bkkMinutes = (at: Date | number = Date.now()): number => {
  const d = new Date(new Date(at).getTime() + BKK_OFFSET_MS)
  return d.getUTCHours() * 60 + d.getUTCMinutes()
}

export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10)
}

/** 0 = Sunday … 6 = Saturday */
export const weekdayOf = (day: string): number => new Date(`${day}T00:00:00Z`).getUTCDay()

export const minutesOf = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + (m || 0)
}

export const hoursFor = (hours: OpeningHours[], weekday: number) => hours.find((h) => h.day === weekday)

/** Open right now (Bangkok time)? */
export function isOpenNow(hours: OpeningHours[], now: Date | number = Date.now()): boolean {
  const h = hoursFor(hours, weekdayOf(bkkDay(now)))
  if (!h) return false
  const m = bkkMinutes(now)
  return m >= minutesOf(h.open) && m < minutesOf(h.close)
}

export interface BookingDay {
  day: string
  weekday: number
  open: boolean
}

/** The days a visit can be booked: tomorrow to `windowDays` ahead, closed days marked shut. */
export function bookingDays(hours: OpeningHours[], now: Date | number = Date.now(), windowDays = 21): BookingDay[] {
  const today = bkkDay(now)
  return Array.from({ length: windowDays }, (_, i) => {
    const day = addDays(today, i + 1)
    const weekday = weekdayOf(day)
    return { day, weekday, open: !!hoursFor(hours, weekday) }
  })
}

const WEEKDAY: Record<Lang, string[]> = {
  th: ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
}
const WEEKDAY_SHORT: Record<Lang, string[]> = {
  th: ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
}

export const weekdayName = (weekday: number, lang: Lang, short = false) => (short ? WEEKDAY_SHORT : WEEKDAY)[lang][weekday]

/** "6 พฤศจิกายน 2569" / "6 November 2026" (Thai readers get the Buddhist Era) */
export function formatDay(day: string, lang: Lang, opts: { weekday?: boolean; short?: boolean } = {}): string {
  const d = new Date(`${day}T00:00:00Z`)
  return d.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-GB', {
    timeZone: 'UTC',
    day: 'numeric',
    month: opts.short ? 'short' : 'long',
    year: 'numeric',
    ...(opts.weekday ? { weekday: opts.short ? 'short' : 'long' } : {}),
  })
}

/** Date and time of an instant in Bangkok: "8 พ.ย. 2569 14:30" */
export function formatDateTime(iso: string, lang: Lang): string {
  return new Date(iso).toLocaleString(lang === 'th' ? 'th-TH' : 'en-GB', {
    timeZone: BKK_TZ,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Opening hours as short lines: every day alike → one line ("ทุกวัน 10:00–20:00"); otherwise runs of
 * days with the same hours, closed days named.
 */
export function hoursLines(hours: OpeningHours[], lang: Lang): { days: string; time: string }[] {
  const closed = lang === 'th' ? 'ปิด' : 'Closed'
  const byDay = [0, 1, 2, 3, 4, 5, 6].map((d) => {
    const h = hoursFor(hours, d)
    return h ? `${h.open}–${h.close}` : closed
  })
  if (byDay.every((t) => t === byDay[0])) return [{ days: lang === 'th' ? 'ทุกวัน' : 'Every day', time: byDay[0] }]
  // Monday-first runs
  const order = [1, 2, 3, 4, 5, 6, 0]
  const out: { days: string; time: string }[] = []
  let start = 0
  for (let i = 1; i <= order.length; i++) {
    if (i === order.length || byDay[order[i]] !== byDay[order[start]]) {
      const a = weekdayName(order[start], lang, true)
      const b = weekdayName(order[i - 1], lang, true)
      out.push({ days: i - 1 === start ? a : `${a}–${b}`, time: byDay[order[start]] })
      start = i
    }
  }
  return out
}

/** "3,500 บาท" / "THB 3,500" */
export function money(n: number, lang: Lang): string {
  const s = Math.round(n).toLocaleString('th-TH')
  return lang === 'th' ? `${s} บาท` : `THB ${s}`
}

/** "3,000–9,000 บาท" / "THB 3,000–9,000" */
export function moneyRange(lo: number, hi: number, lang: Lang): string {
  const a = Math.round(lo).toLocaleString('th-TH')
  const b = Math.round(hi).toLocaleString('th-TH')
  return lang === 'th' ? `${a}–${b} บาท` : `THB ${a}–${b}`
}

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`

// ---------- Calendar file ----------

const icsStamp = (day: string, minutes: number) => {
  // Bangkok wall clock → UTC
  const [y, m, d] = day.split('-').map(Number)
  const t = new Date(Date.UTC(y, m - 1, d, 0, minutes) - BKK_OFFSET_MS)
  return t.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

const icsText = (s: string) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1')

/** An .ics calendar entry for a booked visit (times stored in UTC, so every calendar app agrees). */
export function icsFor(e: { uid: string; day: string; time: string; durationMin: number; title: string; location: string; description: string; now?: Date }): string {
  const start = minutesOf(e.time)
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Maew Cat House//Booking//TH',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${e.uid}@maew-cathouse.example`,
    `DTSTAMP:${(e.now ?? new Date()).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
    `DTSTART:${icsStamp(e.day, start)}`,
    `DTEND:${icsStamp(e.day, start + e.durationMin)}`,
    `SUMMARY:${icsText(e.title)}`,
    `LOCATION:${icsText(e.location)}`,
    `DESCRIPTION:${icsText(e.description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n')
}

// ---------- Kittens ----------

/** Whole weeks since birth (birth date is a Bangkok calendar day). */
export const ageWeeks = (birthDate: string, now: Date | number = Date.now()): number =>
  Math.max(0, Math.floor((new Date(now).getTime() - new Date(`${birthDate}T00:00:00+07:00`).getTime()) / (7 * 86_400_000)))

/** The shop's deposit (mirrors server/extras.ts): 2,000 baht, or 10% rounded to the hundred above 40,000. */
export const depositFor = (price: number) => (price > 40_000 ? Math.round((price * 0.1) / 100) * 100 : 2000)

/** Unpaid reservations lapse after 2 hours; a paid deposit holds the kitten for 48 hours. */
export const UNPAID_HOLD_HOURS = 2
export const PAID_HOLD_HOURS = 48

/** The guide's rule: a kitten goes home at 12 weeks at the earliest. */
export const READY_WEEKS = 12

export const readyDay = (birthDate: string) => addDays(birthDate, READY_WEEKS * 7)

/** Time left until an instant, as {h, m} (zero once passed). */
export function timeLeft(until: string, now: Date | number = Date.now()): { ms: number; h: number; m: number } {
  const ms = Math.max(0, new Date(until).getTime() - new Date(now).getTime())
  return { ms, h: Math.floor(ms / 3_600_000), m: Math.floor((ms % 3_600_000) / 60_000) }
}

// ---------- Cost calculator ----------

export interface CostItem {
  item: string
  min: number
  max: number
}

/** A starting value for each slider: the midpoint, rounded to a tidy step. */
export const midpoint = (c: CostItem, step = 50) => Math.round((c.min + c.max) / 2 / step) * step

export const sliderStep = (c: CostItem) => (c.max - c.min > 5000 ? 500 : c.max - c.min > 1000 ? 50 : 10)

export interface CostTotals {
  monthly: number
  yearlyRunning: number
  oneTime: number
  firstYear: number
  /** First year including the kitten itself */
  firstYearWithKitten: number
}

export function costTotals(monthly: number[], oneTime: number[], kittenPrice = 0): CostTotals {
  const m = monthly.reduce((s, v) => s + v, 0)
  const o = oneTime.reduce((s, v) => s + v, 0)
  return { monthly: m, yearlyRunning: m * 12, oneTime: o, firstYear: o + m * 12, firstYearWithKitten: o + m * 12 + kittenPrice }
}

/** The market table's "recommended emergency fund" is money set aside, not a cost: kept apart in totals. */
export const isReserve = (c: CostItem) => /สำรอง|reserve|emergency/i.test(c.item)

/** Range of the first-year cost from the market table (all low ends / all high ends), reserves left out. */
export function firstYearRange(monthly: CostItem[], oneTime: CostItem[]): [number, number] {
  const once = oneTime.filter((c) => !isReserve(c))
  const lo = once.reduce((s, c) => s + c.min, 0) + 12 * monthly.reduce((s, c) => s + c.min, 0)
  const hi = once.reduce((s, c) => s + c.max, 0) + 12 * monthly.reduce((s, c) => s + c.max, 0)
  return [lo, hi]
}

export const INSTALMENT_MONTHS = [3, 6, 10] as const

/** 0% card instalments: equal monthly amounts, rounded up to the baht, last month takes the remainder. */
export function instalments(price: number, months: number): { monthly: number; last: number } {
  const monthly = Math.ceil(price / months)
  return { monthly, last: price - monthly * (months - 1) }
}

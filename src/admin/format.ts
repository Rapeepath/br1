// Thai formatting for the back office: baht, Buddhist-era dates in Bangkok time, and the labels the API's
// codes stand for.
import type { ActivityType, MovementType, OrderStatus, PaymentMethod, Role } from '../../server/types.ts'

const BKK = 'Asia/Bangkok'
const BKK_OFFSET_MS = 7 * 60 * 60 * 1000

const whole = new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 })
const satang = new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const short = new Intl.NumberFormat('th-TH', { notation: 'compact', maximumFractionDigits: 1 })

/** 1234 → "1,234", 1234.5 → "1,234.50": satang only when there are some. */
export function baht(n: number): string {
  const r = Math.round((n + Number.EPSILON) * 100) / 100
  return Number.isInteger(r) ? whole.format(r) : satang.format(r)
}

export const bahtText = (n: number) => `${baht(n)} บาท`

/** Signed baht for differences: "+20", "−40", "0". */
export function signedBaht(n: number): string {
  if (n === 0) return '0'
  return `${n > 0 ? '+' : '−'}${baht(Math.abs(n))}`
}

export const num = (n: number) => whole.format(n)

/** Axis ticks: 40000 → "4 หมื่น", 1500000 → "1.5 ล้าน". */
export const compact = (n: number) => short.format(n)

export const percent = (n: number, digits = 1) =>
  `${n.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: digits })}%`

/** "6 พ.ย. 2569 15:30" */
export const dateTime = (iso: string) =>
  new Date(iso).toLocaleString('th-TH', {
    timeZone: BKK,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

/** "6 พฤศจิกายน 2569 เวลา 15:30:12" for receipts */
export const dateTimeLong = (iso: string) =>
  new Date(iso).toLocaleString('th-TH', {
    timeZone: BKK,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

/** "5 พ.ย. 18:55" for tight tables */
export const shortDateTime = (iso: string) =>
  new Date(iso).toLocaleString('th-TH', { timeZone: BKK, day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export const timeOnly = (iso: string) =>
  new Date(iso).toLocaleTimeString('th-TH', { timeZone: BKK, hour: '2-digit', minute: '2-digit' })

/** A YYYY-MM-DD Bangkok day as "6 พ.ย." (short) or "ศุกร์ 6 พฤศจิกายน 2569" (long). */
export function dayLabel(day: string, style: 'short' | 'long' | 'medium' = 'short'): string {
  const d = new Date(`${day}T12:00:00+07:00`)
  if (style === 'long') {
    return d.toLocaleDateString('th-TH', { timeZone: BKK, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }
  if (style === 'medium') return d.toLocaleDateString('th-TH', { timeZone: BKK, day: 'numeric', month: 'short', year: 'numeric' })
  return d.toLocaleDateString('th-TH', { timeZone: BKK, day: 'numeric', month: 'short' })
}

/** Today (or any instant) as a Bangkok calendar day, YYYY-MM-DD. */
export function bkkDay(at: Date | string | number = new Date()): string {
  return new Date(new Date(at).getTime() + BKK_OFFSET_MS).toISOString().slice(0, 10)
}

export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10)
}

/** Change against a comparison figure; null when there is nothing to compare with. */
export function change(now: number, before: number): { pct: number; dir: 'up' | 'down' | 'flat' } | null {
  if (!before) return null
  const pct = ((now - before) / before) * 100
  return { pct, dir: Math.abs(pct) < 0.05 ? 'flat' : pct > 0 ? 'up' : 'down' }
}

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  cash: 'เงินสด',
  promptpay: 'พร้อมเพย์',
  card: 'บัตรเครดิต/เดบิต',
  transfer: 'โอนเงิน',
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  paid: 'ชำระแล้ว',
  refunded: 'คืนเงินแล้ว',
}

export const MOVEMENT_LABEL: Record<MovementType, string> = {
  initial: 'ยอดยกมา',
  receive: 'รับเข้า',
  adjust: 'ปรับจากการนับ',
  sale: 'ขาย',
  refund: 'คืนเข้าสต็อก',
}

export const ACTIVITY_LABEL: Record<ActivityType, string> = {
  login: 'เข้าสู่ระบบ',
  logout: 'ออกจากระบบ',
  sale: 'ขาย',
  refund: 'คืนเงิน',
  stock: 'สต็อก',
  product: 'แก้ไขสินค้า',
  customer: 'ลูกค้า',
  shift: 'กะและเงินสด',
  settings: 'ตั้งค่า',
  reset: 'สร้างข้อมูลใหม่',
}

export const ROLE_LABEL: Record<Role, string> = {
  manager: 'ผู้จัดการ',
  staff: 'พนักงาน',
}

/** Initials for an avatar bubble: the first letter of the first name, skipping Thai leading vowels. */
export function initial(name: string): string {
  const first = name.trim().replace(/^(ดร\.|นาย|นาง|นางสาว)\s*/, '')
  const ch = [...first].find((c) => !/[เแโใไ]/.test(c))
  return ch ?? first.slice(0, 1)
}

/** Receipt number pattern, for linking activity entries to their bills. */
export const isReceiptNo = (s: string) => /^[A-Z]{2}\d{6}-\d{4}$/.test(s)

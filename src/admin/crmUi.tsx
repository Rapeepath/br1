// Small pieces the customer-relations screens share: contact buttons, status badges, star ratings and a
// ticking hold countdown.
import { useEffect, useState } from 'react'
import { Mail, MessageCircle, Phone, Star } from 'lucide-react'
import type { BookingStatus, KittenStatus, LeadStatus, ReservationStatus, ReviewStatus } from '../../server/types.ts'
import {
  BOOKING_STATUS_LABEL,
  BOOKING_STATUS_TONE,
  KITTEN_STATUS_LABEL,
  KITTEN_STATUS_TONE,
  LEAD_STATUS_LABEL,
  LEAD_STATUS_TONE,
  RESERVATION_STATUS_LABEL,
  RESERVATION_STATUS_TONE,
  REVIEW_STATUS_LABEL,
  REVIEW_STATUS_TONE,
  countdown,
  lineHref,
  telHref,
} from './crm'
import { Badge } from './ui'

export const LeadStatusBadge = ({ status }: { status: LeadStatus }) => <Badge tone={LEAD_STATUS_TONE[status]}>{LEAD_STATUS_LABEL[status]}</Badge>
export const BookingStatusBadge = ({ status }: { status: BookingStatus }) => <Badge tone={BOOKING_STATUS_TONE[status]}>{BOOKING_STATUS_LABEL[status]}</Badge>
export const KittenStatusBadge = ({ status }: { status: KittenStatus }) => <Badge tone={KITTEN_STATUS_TONE[status]}>{KITTEN_STATUS_LABEL[status]}</Badge>
export const ReservationStatusBadge = ({ status }: { status: ReservationStatus }) => (
  <Badge tone={RESERVATION_STATUS_TONE[status]}>{RESERVATION_STATUS_LABEL[status]}</Badge>
)
export const ReviewStatusBadge = ({ status }: { status: ReviewStatus }) => <Badge tone={REVIEW_STATUS_TONE[status]}>{REVIEW_STATUS_LABEL[status]}</Badge>

/** Call, e-mail and LINE buttons for whichever contact details a person left. */
export function ContactLinks({ phone, email, lineId, name }: { phone?: string | null; email?: string | null; lineId?: string | null; name: string }) {
  if (!phone && !email && !lineId) return <p className="empty-line">ไม่มีช่องทางติดต่อ (ข้อมูลถูกลบตามคำขอ)</p>
  return (
    <div className="contact-links">
      {phone && (
        <a className="btn btn-primary btn-sm" href={telHref(phone)}>
          <Phone size={16} aria-hidden /> โทร {phone}
          <span className="visually-hidden"> หา{name}</span>
        </a>
      )}
      {lineId && (
        <a className="btn btn-ghost btn-sm" href={lineHref(lineId)} target="_blank" rel="noreferrer">
          <MessageCircle size={16} aria-hidden /> LINE {lineId}
          <span className="visually-hidden"> (เปิดในแท็บใหม่)</span>
        </a>
      )}
      {email && (
        <a className="btn btn-ghost btn-sm" href={`mailto:${email}`}>
          <Mail size={16} aria-hidden /> {email}
        </a>
      )}
    </div>
  )
}

/** Five stars, the rating also given as text (stars alone are not enough to read). */
export function Stars({ rating }: { rating: number }) {
  return (
    <span className="stars" role="img" aria-label={`${rating} จาก 5 ดาว`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={16} aria-hidden className={i <= rating ? 'stars__on' : 'stars__off'} fill={i <= rating ? 'currentColor' : 'none'} />
      ))}
    </span>
  )
}

/** Re-renders every 30 seconds so countdowns stay current while the screen is open. */
export function useNow(ms = 30_000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), ms)
    return () => clearInterval(t)
  }, [ms])
  return now
}

/** "เหลือ 1 ชม. 20 นาที", coloured when the hold is about to run out. */
export function Countdown({ until, now }: { until: string; now: Date }) {
  const c = countdown(until, now)
  return <span className={`countdown ${c.urgent ? 'countdown--urgent' : ''} ${c.over ? 'countdown--over' : ''}`}>{c.text}</span>
}

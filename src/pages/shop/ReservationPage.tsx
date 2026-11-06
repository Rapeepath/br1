import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { Copy, Hourglass, PawPrint, Store, Truck } from 'lucide-react'
import { getBreed } from '../../data'
import { useLang } from '../../i18n'
import { localized } from '../../i18n/content'
import { PayStep } from '../../components/shop/Pay'
import { ShopHead } from '../../components/shop/ShopHead'
import { ContactButtons, StoreDetails } from '../../components/shop/StoreDetails'
import { Picture } from '../../components/Picture'
import { kittenPhoto, kittenText, usePublic, type Reservation } from '../../lib/kittens'
import { ApiError } from '../../lib/publicApi'
import { formatDateTime, money, timeLeft } from '../../lib/shop'
import './shop-pages.css'
import './cost.css'
import './privacy.css'
import './care.css'
import './kitten-page.css'
import './reserve.css'

const COPY = {
  th: {
    title: 'สถานะการจอง',
    no: 'เลขที่จอง',
    status: {
      'pending-payment': 'รอชำระมัดจำ',
      held: 'จองแล้ว ร้านกันน้องไว้ให้',
      completed: 'รับน้องแล้ว',
      cancelled: 'ยกเลิกแล้ว',
      expired: 'หมดเวลาจอง',
    } as Record<Reservation['status'], string>,
    payBy: (t: string) => `ชำระมัดจำภายใน ${t}`,
    heldUntil: (t: string) => `ร้านกันน้องไว้ถึง ${t}`,
    left: (h: number, m: number) => (h > 0 ? `เหลือ ${h} ชั่วโมง ${m} นาที` : `เหลือ ${m} นาที`),
    paidOn: (t: string) => `ชำระมัดจำแล้วเมื่อ ${t}`,
    nextTitle: 'ขั้นต่อไป',
    next: [
      'ร้านจะโทรหรือทัก LINE นัดวันรับน้องภายในเวลาเปิดทำการ',
      'วันรับน้อง ชำระส่วนที่เหลือด้วยเงินสด พร้อมเพย์ บัตร หรือโอน',
      'รับสมุดวัคซีน ใบรายงานสุขภาพ และเอกสารไมโครชิปพร้อมตัวน้อง',
    ],
    rest: 'ส่วนที่เหลือชำระตอนรับน้อง',
    pickupStore: 'รับที่ร้าน',
    pickupDelivery: 'ร้านจัดส่ง',
    endedCancelled: 'การจองนี้ถูกยกเลิกแล้ว ถ้าชำระมัดจำไว้ ร้านคืนเงินภายใน 7 วัน',
    endedExpired: 'การจองนี้หมดเวลาแล้ว น้องกลับไปอยู่ในรายการพร้อมรับ ถ้ายังสนใจ จองใหม่ได้เลย',
    completedBody: 'ขอบคุณที่รับน้องไปดูแล ปรึกษาสัตวแพทย์ของร้านได้ฟรีตลอด 30 วันแรก',
    keepLink: 'เก็บลิงก์หน้านี้ไว้ดูสถานะการจอง ลิงก์นี้ใช้ได้เฉพาะคุณ',
    copy: 'คัดลอกลิงก์',
    copied: 'คัดลอกแล้ว',
    cancel: 'ต้องการยกเลิกหรือเปลี่ยนแปลง แจ้งร้านพร้อมเลขที่จอง',
    seeKitten: 'ดูข้อมูลน้อง',
    seeAll: 'ดูลูกแมวทั้งหมด',
    aftercare: 'การดูแลหลังรับเลี้ยง',
    loading: 'กำลังโหลดการจอง',
    goneTitle: 'ไม่พบการจองนี้',
    goneBody: 'ลิงก์อาจไม่ครบ ลองเปิดจากลิงก์ที่ได้ตอนจองอีกครั้ง หรือแจ้งเลขที่จองกับร้าน',
    offlineTitle: 'ยังดูสถานะการจองไม่ได้ในขณะนี้',
    offlineBody: 'ระบบของร้านไม่ตอบสนอง ลองใหม่อีกครั้ง หรือโทรและทัก LINE สอบถามได้เลย',
    retry: 'ลองใหม่',
    storeTitle: 'ร้าน',
  },
  en: {
    title: 'Reservation status',
    no: 'Reservation',
    status: {
      'pending-payment': 'Waiting for the deposit',
      held: 'Reserved: the kitten is held for you',
      completed: 'Collected',
      cancelled: 'Cancelled',
      expired: 'Lapsed',
    } as Record<Reservation['status'], string>,
    payBy: (t: string) => `Pay the deposit by ${t}`,
    heldUntil: (t: string) => `Held for you until ${t}`,
    left: (h: number, m: number) => (h > 0 ? `${h} h ${m} min left` : `${m} min left`),
    paidOn: (t: string) => `Deposit paid ${t}`,
    nextTitle: 'What happens next',
    next: [
      'The shop calls or messages you on LINE during opening hours to set the collection day.',
      'On the day, pay the rest by cash, PromptPay, card or transfer.',
      'The vaccine book, health report and microchip papers come with the kitten.',
    ],
    rest: 'Rest to pay on collection',
    pickupStore: 'Collect at the shop',
    pickupDelivery: 'Delivery by the shop',
    endedCancelled: 'This reservation was cancelled. If you paid a deposit, it is refunded within 7 days.',
    endedExpired: 'This reservation lapsed and the kitten is back on the list. If you’re still interested, reserve again.',
    completedBody: 'Thank you for giving the kitten a home. Call the shop’s vet free for the first 30 days.',
    keepLink: 'Keep the link to this page to check your reservation; it works only for you.',
    copy: 'Copy link',
    copied: 'Copied',
    cancel: 'To cancel or change anything, tell the shop your reservation number.',
    seeKitten: 'See the kitten',
    seeAll: 'See all kittens',
    aftercare: 'Aftercare',
    loading: 'Loading the reservation',
    goneTitle: 'Reservation not found',
    goneBody: 'The link may be incomplete. Open the link you got when reserving, or give the shop your reservation number.',
    offlineTitle: 'The reservation can’t be shown right now',
    offlineBody: 'The shop’s system isn’t responding. Try again, or call or message us on LINE.',
    retry: 'Try again',
    storeTitle: 'The shop',
  },
}

const TONE: Record<Reservation['status'], string> = {
  'pending-payment': 'tone-butter',
  held: 'tone-mint',
  completed: 'tone-sky',
  cancelled: 'tone-rose',
  expired: 'tone-rose',
}

/** Re-renders every 30 seconds so countdowns stay current. */
function useClock(ms = 30_000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms)
    return () => clearInterval(t)
  }, [ms])
  return now
}

export function ReservationPage() {
  const lang = useLang()
  const c = COPY[lang]
  const { no = '' } = useParams()
  const [params] = useSearchParams()
  const token = params.get('t') ?? ''
  const res = usePublic<Reservation>(`reservations/${encodeURIComponent(no)}?t=${encodeURIComponent(token)}`)
  const [fresh, setFresh] = useState<Reservation | null>(null)
  const [copied, setCopied] = useState(false)
  const now = useClock()

  if (res.status === 'loading') {
    return (
      <section className="shop-band kitten-page">
        <div className="container">
          <p role="status">{c.loading}</p>
        </div>
      </section>
    )
  }
  if (res.status === 'error') {
    const gone = res.error instanceof ApiError && res.error.status === 404
    return (
      <>
        <ShopHead title={c.title} />
        <section className="shop-band">
          <div className="container narrow">
            <div className="empty-card">
              <p className="empty-card__title">{gone ? c.goneTitle : c.offlineTitle}</p>
              <p>{gone ? c.goneBody : c.offlineBody}</p>
              {!gone && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={res.reload}>
                  {c.retry}
                </button>
              )}
              <ContactButtons />
            </div>
          </div>
        </section>
      </>
    )
  }

  const r = fresh ?? res.data
  // A hold lapses on its own clock; show it the moment it does
  const status = (r.status === 'pending-payment' || r.status === 'held') && new Date(r.holdUntil).getTime() <= now ? 'expired' : r.status
  const k = r.kitten
  const text = k ? kittenText(k, lang) : null
  const photo = k ? kittenPhoto(k) : null
  const breed = k ? getBreed(k.refId) : undefined
  const breedName = k ? (lang === 'en' && breed ? localized(breed, 'en').nameEn : text!.breedName) : ''
  const left = timeLeft(r.holdUntil, now)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <>
      <ShopHead
        title={c.title}
        tint={
          <>
            {c.no} <span className="nowrap">{r.no}</span>
          </>
        }
      />
      <section className="shop-band">
        <div className="container reserve-layout">
          <div className="shop-stack">
            <div className="shop-sheet reservation-status">
              <p className={`pill ${TONE[status]} reservation-status__pill`}>{c.status[status]}</p>
              {status === 'pending-payment' && (
                <p className="reservation-status__time">
                  <Hourglass size={18} aria-hidden />
                  {c.payBy(formatDateTime(r.holdUntil, lang))} <strong>{c.left(left.h, left.m)}</strong>
                </p>
              )}
              {status === 'held' && (
                <>
                  <p className="reservation-status__time">
                    <Hourglass size={18} aria-hidden />
                    {c.heldUntil(formatDateTime(r.holdUntil, lang))}
                  </p>
                  {r.deposit.paidAt && <p className="reservation-status__sub">{c.paidOn(formatDateTime(r.deposit.paidAt, lang))}</p>}
                </>
              )}
              {status === 'cancelled' && <p>{c.endedCancelled}</p>}
              {status === 'expired' && <p>{c.endedExpired}</p>}
              {status === 'completed' && <p>{c.completedBody}</p>}
            </div>

            {status === 'pending-payment' && (
              <div className="shop-sheet">
                <PayStep reservation={r} token={token} onPaid={setFresh} />
              </div>
            )}

            {status === 'held' && (
              <div className="shop-sheet">
                <h2>{c.nextTitle}</h2>
                <ol className="care-first reservation-next">
                  {c.next.map((s) => (
                    <li key={s}>
                      <p>{s}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="shop-sheet reservation-link">
              <p>{c.keepLink}</p>
              <div className="btn-row">
                <button type="button" className="btn btn-ghost btn-sm" onClick={copyLink}>
                  <Copy size={16} aria-hidden />
                  {c.copy}
                </button>
                <span aria-live="polite" className="reservation-link__done">
                  {copied ? c.copied : ''}
                </span>
              </div>
              <p className="reservation-link__cancel">{c.cancel}</p>
            </div>
          </div>

          <aside className="shop-stack">
            {k && (
              <div className="shop-sheet reserve-summary">
                <div className="reserve-kitten">
                  {photo && <Picture src={photo.srcSmall} alt="" sizes="120px" className="reserve-kitten__photo" />}
                  <div>
                    <p className="reserve-kitten__name">
                      {lang === 'th' ? 'น้อง' : ''}
                      <span lang="th">{k.name}</span>
                    </p>
                    <p>
                      {breedName}
                      {text?.grade ? `, ${text.grade}` : ''}
                    </p>
                    <p>{text?.color}</p>
                  </div>
                </div>
                <dl className="cost-totals">
                  <div>
                    <dt>{lang === 'th' ? 'ราคาน้อง' : 'Price'}</dt>
                    <dd>{money(k.price, lang)}</dd>
                  </div>
                  <div>
                    <dt>{lang === 'th' ? 'มัดจำ' : 'Deposit'}</dt>
                    <dd>{money(r.deposit.amount, lang)}</dd>
                  </div>
                  <div className="cost-totals__big">
                    <dt>{c.rest}</dt>
                    <dd>{money(k.price - r.deposit.amount, lang)}</dd>
                  </div>
                </dl>
                <p className="reservation-pickup">
                  {r.pickup === 'delivery' ? <Truck size={18} aria-hidden /> : <Store size={18} aria-hidden />}
                  {r.pickup === 'delivery' ? c.pickupDelivery : c.pickupStore}
                </p>
                <div className="btn-row">
                  <Link to={`/kittens/${k.id}`} className="link-arrow">
                    <PawPrint size={16} aria-hidden />
                    {c.seeKitten}
                  </Link>
                  {(status === 'expired' || status === 'cancelled') && (
                    <Link to="/kittens" className="link-arrow">
                      {c.seeAll}
                    </Link>
                  )}
                  {(status === 'held' || status === 'completed') && (
                    <Link to="/care" className="link-arrow">
                      {c.aftercare}
                    </Link>
                  )}
                </div>
              </div>
            )}
            <div className="shop-sheet">
              <h2>{c.storeTitle}</h2>
              <StoreDetails />
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}

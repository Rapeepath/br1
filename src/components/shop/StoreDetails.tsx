import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { useLang } from '../../i18n'
import { useStoreInfo } from '../../lib/live'
import { bkkDay, hoursFor, hoursLines, isOpenNow, telHref, weekdayName, weekdayOf } from '../../lib/shop'
import './store.css'

const COPY = {
  th: {
    address: 'ที่อยู่',
    phone: 'โทร',
    line: 'LINE',
    email: 'อีเมล',
    hours: 'เวลาเปิด',
    map: 'เปิดแผนที่',
    openNow: 'เปิดอยู่ตอนนี้',
    closedNow: 'ปิดอยู่ตอนนี้',
    today: 'วันนี้',
    closed: 'ปิด',
    addLine: 'เพิ่มเพื่อนใน LINE',
  },
  en: {
    address: 'Address',
    phone: 'Phone',
    line: 'LINE',
    email: 'Email',
    hours: 'Opening hours',
    map: 'Open the map',
    openNow: 'Open now',
    closedNow: 'Closed now',
    today: 'today',
    closed: 'Closed',
    addLine: 'Add us on LINE',
  },
}

/** Opening hours for the whole week, today's row marked (Bangkok time). */
export function WeekHours({ compact = false }: { compact?: boolean }) {
  const lang = useLang()
  const c = COPY[lang]
  const store = useStoreInfo()
  const today = weekdayOf(bkkDay())
  if (compact) {
    return (
      <ul className="hours-lines">
        {hoursLines(store.hours, lang).map((l) => (
          <li key={l.days}>
            <span>{l.days}</span> <span className="nowrap">{l.time}</span>
          </li>
        ))}
      </ul>
    )
  }
  // Monday first, as Thai calendars print the week
  const order = [1, 2, 3, 4, 5, 6, 0]
  return (
    <table className="week-hours">
      <caption className="visually-hidden">{c.hours}</caption>
      <tbody>
        {order.map((d) => {
          const h = hoursFor(store.hours, d)
          const isToday = d === today
          return (
            <tr key={d} data-today={isToday || undefined}>
              <th scope="row">
                {weekdayName(d, lang)}
                {isToday && <span className="week-hours__today"> ({c.today})</span>}
              </th>
              <td>{h ? `${h.open}–${h.close}` : c.closed}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

/** Address, phone, LINE, email, hours and map: the shop's details as one block. */
export function StoreDetails({ showHours = true }: { showHours?: boolean }) {
  const lang = useLang()
  const c = COPY[lang]
  const store = useStoreInfo()
  const open = isOpenNow(store.hours)
  return (
    <div className="store-details">
      <p className="store-details__name">
        {store.storeName} <span className="store-details__branch" lang="th">{store.branch}</span>
      </p>
      <ul className="store-details__list">
        <li>
          <MapPin size={20} aria-hidden />
          <span>
            <span className="visually-hidden">{c.address}: </span>
            <span lang="th">{store.address}</span>
            {store.mapUrl && (
              <>
                {' '}
                <a href={store.mapUrl} target="_blank" rel="noopener" className="store-details__map">
                  {c.map}
                </a>
              </>
            )}
          </span>
        </li>
        <li>
          <Phone size={20} aria-hidden />
          <span>
            <span className="visually-hidden">{c.phone}: </span>
            <a href={telHref(store.phone)}>{store.phone}</a>
          </span>
        </li>
        {store.lineId && (
          <li>
            <MessageCircle size={20} aria-hidden />
            <span>
              <span className="visually-hidden">{c.line}: </span>
              <a href={store.lineUrl} target="_blank" rel="noopener" lang="en">
                LINE {store.lineId}
              </a>
            </span>
          </li>
        )}
        {store.email && (
          <li>
            <Mail size={20} aria-hidden />
            <span>
              <span className="visually-hidden">{c.email}: </span>
              <a href={`mailto:${store.email}`}>{store.email}</a>
            </span>
          </li>
        )}
        {showHours && (
          <li>
            <Clock size={20} aria-hidden />
            <span>
              <span className={`pill ${open ? 'tone-mint' : 'tone-butter'}`}>{open ? c.openNow : c.closedNow}</span>
              <WeekHours compact />
            </span>
          </li>
        )}
      </ul>
    </div>
  )
}

/** The two quickest ways to reach the shop, as buttons. */
export function ContactButtons() {
  const lang = useLang()
  const store = useStoreInfo()
  return (
    <div className="btn-row">
      {store.lineUrl && (
        <a href={store.lineUrl} target="_blank" rel="noopener" className="btn btn-primary">
          <MessageCircle size={18} aria-hidden />
          {COPY[lang].addLine}
        </a>
      )}
      <a href={telHref(store.phone)} className="btn btn-ghost">
        <Phone size={18} aria-hidden />
        {store.phone}
      </a>
    </div>
  )
}

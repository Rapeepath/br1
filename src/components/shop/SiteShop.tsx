// The shop's parts of the site shell: the footer's shop links and contact block, and the phone-only
// floating contact button. Layout.tsx places them.
import { Link } from 'react-router'
import { MapPin, MessageCircle, Phone } from 'lucide-react'
import { useLang } from '../../i18n'
import { useStoreInfo } from '../../lib/live'
import { hoursLines, telHref } from '../../lib/shop'
import './site-shop.css'

const COPY = {
  th: {
    shop: 'บริการของร้าน',
    links: [
      { to: '/kittens', label: 'ลูกแมวพร้อมรับ' },
      { to: '/booking', label: 'นัดชมที่ร้าน' },
      { to: '/cost', label: 'ค่าเลี้ยงและการผ่อน' },
      { to: '/care', label: 'การดูแลและรับประกัน' },
      { to: '/faq', label: 'คำถามที่พบบ่อย' },
      { to: '/contact', label: 'ติดต่อเรา' },
      { to: '/privacy', label: 'นโยบายความเป็นส่วนตัว' },
    ],
    contact: 'ติดต่อร้าน',
    map: 'แผนที่',
    call: 'โทร',
    callFull: 'หาร้าน',
    line: 'LINE',
    lineFull: 'ทักร้าน',
    fab: 'ติดต่อร้าน',
  },
  en: {
    shop: 'The shop',
    links: [
      { to: '/kittens', label: 'Kittens available' },
      { to: '/booking', label: 'Book a visit' },
      { to: '/cost', label: 'Costs and instalments' },
      { to: '/care', label: 'Aftercare and guarantee' },
      { to: '/faq', label: 'FAQ' },
      { to: '/contact', label: 'Contact us' },
      { to: '/privacy', label: 'Privacy policy' },
    ],
    contact: 'Contact the shop',
    map: 'Map',
    call: 'Call',
    callFull: 'the shop',
    line: 'LINE',
    lineFull: 'Message the shop on',
    fab: 'Contact the shop',
  },
}

/** Footer column: links to the shop pages. */
export function FooterShopLinks() {
  const lang = useLang()
  const c = COPY[lang]
  return (
    <nav aria-labelledby="footer-shop-title">
      <p id="footer-shop-title" className="site-footer__title">
        {c.shop}
      </p>
      <ul className="site-footer__links footer-shop-links">
        {c.links.map((l) => (
          <li key={l.to}>
            <Link to={l.to}>{l.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/** Footer column: the shop's address, phone, LINE and hours. */
export function FooterStore() {
  const lang = useLang()
  const c = COPY[lang]
  const store = useStoreInfo()
  return (
    <div className="footer-store">
      <p className="site-footer__title">{c.contact}</p>
      <p className="footer-store__name">
        {store.storeName} <span lang="th">{store.branch}</span>
      </p>
      <p>
        <span lang="th">{store.address}</span>{' '}
        {store.mapUrl && (
          <a href={store.mapUrl} target="_blank" rel="noopener" className="nowrap">
            <MapPin size={14} aria-hidden /> {c.map}
          </a>
        )}
      </p>
      <ul className="footer-store__list">
        <li>
          <Phone size={15} aria-hidden />
          <a href={telHref(store.phone)}>{store.phone}</a>
        </li>
        {store.lineId && (
          <li>
            <MessageCircle size={15} aria-hidden />
            <a href={store.lineUrl} target="_blank" rel="noopener" lang="en">
              LINE {store.lineId}
            </a>
          </li>
        )}
        {store.email && (
          <li>
            <span aria-hidden="true" className="footer-store__at">
              @
            </span>
            <a href={`mailto:${store.email}`}>{store.email}</a>
          </li>
        )}
      </ul>
      <ul className="footer-store__hours">
        {hoursLines(store.hours, lang).map((l) => (
          <li key={l.days}>
            {l.days} <span className="nowrap">{l.time}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Phones only: LINE and call, floating at the bottom corner. It rises above the compare tray when the
 * tray is open, so the two never overlap.
 */
export function FloatingContact() {
  const lang = useLang()
  const c = COPY[lang]
  const store = useStoreInfo()
  return (
    <div className="fab-contact" role="group" aria-label={c.fab}>
      {store.lineUrl && (
        <a href={store.lineUrl} target="_blank" rel="noopener" className="fab-contact__btn fab-contact__btn--line">
          <MessageCircle size={18} aria-hidden />
          {lang === 'en' && <span className="visually-hidden">{c.lineFull} </span>}
          <span lang="en">{c.line}</span>
          {lang === 'th' && <span className="visually-hidden"> {c.lineFull}</span>}
        </a>
      )}
      <a href={telHref(store.phone)} className="fab-contact__btn">
        <Phone size={18} aria-hidden />
        <span>{c.call}</span>
        <span className="visually-hidden"> {c.callFull}</span>
      </a>
    </div>
  )
}

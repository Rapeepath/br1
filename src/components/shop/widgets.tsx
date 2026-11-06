// Live shop widgets for the existing brochure pages (home, breed pages). Each renders nothing when the
// shop's system can't be reached, so the static brochure still reads cleanly without it.
//
//   <StockBadge refId="persian" />     "ลูกแมวพร้อมรับ 3 ตัว" + the shop's starting price
//   <KittenStrip breedId="persian" />  up to 4 kittens of the breed, linking to /kittens/:id
//   <CostWidget price={8000} />        0% instalments + first-year running cost, linking to /cost
//   <CtaRow breedId="persian" />       see kittens / book a visit / ask a question
import { Link } from 'react-router'
import { ArrowRight, CalendarDays, MessageCircle, PawPrint, Wallet } from 'lucide-react'
import { getBreed, market } from '../../data'
import { useLang } from '../../i18n'
import { localized } from '../../i18n/content'
import { usePublic, type Kitten } from '../../lib/kittens'
import { useLiveCatalog } from '../../lib/live'
import { firstYearRange, instalments, money, moneyRange } from '../../lib/shop'
import { KittenCard } from './KittenCard'
import './widgets.css'

const COPY = {
  th: {
    ready: (n: number) => `ลูกแมวพร้อมรับ ${n} ตัว`,
    readyBrief: (n: number) => `พร้อมรับ ${n} ตัว`,
    none: 'ตอนนี้ยังไม่มีลูกแมวพร้อมรับ',
    from: (p: string) => `ราคาที่ร้าน เริ่มต้น ${p}`,
    strip: (b: string) => `ลูกแมว${b}ที่ร้าน`,
    stripLede: 'ข้อมูลจากระบบของร้าน อัปเดตตามการจองจริง',
    all: 'ดูลูกแมวทั้งหมด',
    stripEmpty: (b: string) => `ตอนนี้ร้านยังไม่มีลูกแมว${b}ว่าง นัดมาคุยหรือฝากชื่อไว้ได้ ร้านจะแจ้งเมื่อมีครอกใหม่`,
    ask: 'ฝากชื่อไว้',
    costTitle: 'ค่าใช้จ่ายโดยประมาณ',
    perMonth: (m: string) => `ผ่อนบัตร 0% 10 เดือน เดือนละ ${m}`,
    firstYear: (r: string) => `ค่าเลี้ยงปีแรก (ไม่รวมตัวลูกแมว) ราว ${r}`,
    calc: 'คำนวณละเอียด',
    seeKittens: 'ดูลูกแมวที่พร้อมรับ',
    book: 'นัดชมที่ร้าน',
    contact: 'สอบถามร้าน',
  },
  en: {
    ready: (n: number) => `${n} ${n === 1 ? 'kitten' : 'kittens'} ready for a home`,
    readyBrief: (n: number) => `${n} ready for a home`,
    none: 'No kittens available right now',
    from: (p: string) => `At the shop from ${p}`,
    strip: (b: string) => `${b} kittens at the shop`,
    stripLede: 'Live from the shop’s system, updated as kittens are reserved.',
    all: 'See all kittens',
    stripEmpty: (b: string) => `The shop has no ${b} kitten free right now. Book a visit or leave your details and we’ll tell you about the next litter.`,
    ask: 'Leave your details',
    costTitle: 'Estimated cost',
    perMonth: (m: string) => `0% card instalments: ${m} a month for 10 months`,
    firstYear: (r: string) => `First-year running cost (kitten not included): about ${r}`,
    calc: 'Work it out in detail',
    seeKittens: 'See available kittens',
    book: 'Book a visit',
    contact: 'Ask the shop',
  },
}

/** The breed's live availability and the shop's starting price (kitten SKUs in the POS). `brief` is the
    lineup card's shorter wording, where the breed's name and photo already say what is ready. */
export function StockBadge({ refId, brief }: { refId: string; brief?: boolean }) {
  const lang = useLang()
  const c = COPY[lang]
  const { status, byRef } = useLiveCatalog()
  if (status !== 'live') return null
  const skus = byRef(refId).filter((i) => i.categoryId === 'kitten')
  if (!skus.length) return null
  const count = skus.reduce((s, i) => s + (i.kittensAvailable ?? i.stock ?? 0), 0)
  const low = Math.min(...skus.map((i) => i.price))
  return (
    <p className="stock-badge">
      <span className={`pill ${count > 0 ? 'tone-mint' : 'tone-butter'}`}>
        <PawPrint size={14} aria-hidden />
        {count > 0 ? (brief ? c.readyBrief(count) : c.ready(count)) : c.none}
      </span>
      <span className="stock-badge__price">{c.from(money(low, lang))}</span>
    </p>
  )
}

/** Up to four of the breed's kittens (available first), linking to each kitten's page. */
export function KittenStrip({ breedId }: { breedId: string }) {
  const lang = useLang()
  const c = COPY[lang]
  const res = usePublic<Kitten[]>(`kittens?breed=${encodeURIComponent(breedId)}`)
  const breed = getBreed(breedId)
  if (res.status !== 'ready' || !breed) return null
  const name = lang === 'en' ? localized(breed, 'en').nameEn : breed.nameTh
  const list = res.data.slice(0, 4)
  return (
    <section className="kitten-strip" aria-labelledby={`strip-${breedId}`}>
      <div className="kitten-strip__head">
        <div>
          <h2 id={`strip-${breedId}`}>{c.strip(name)}</h2>
          <p>{c.stripLede}</p>
        </div>
        <Link to={`/kittens?breed=${breedId}`} className="link-arrow">
          {c.all}
          <ArrowRight size={16} aria-hidden />
        </Link>
      </div>
      {list.length ? (
        <ul className="kitten-grid kitten-strip__grid">
          {list.map((k) => (
            <li key={k.id}>
              <KittenCard kitten={k} compact />
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-card">
          <p>{c.stripEmpty(name)}</p>
          <div className="btn-row">
            <Link to={`/booking?breed=${breedId}`} className="btn btn-primary btn-sm">
              {c.book}
            </Link>
            <Link to={`/contact?breed=${breedId}`} className="btn btn-ghost btn-sm">
              {c.ask}
            </Link>
          </div>
        </div>
      )}
    </section>
  )
}

/** A compact cost estimate for a kitten price: 0% instalments and the first-year running cost. */
export function CostWidget({ price }: { price: number }) {
  const lang = useLang()
  const c = COPY[lang]
  const { monthly } = instalments(price, 10)
  const [lo, hi] = firstYearRange(market.ownershipCost.monthly, market.ownershipCost.oneTime)
  return (
    <aside className="cost-widget" aria-label={c.costTitle}>
      <p className="cost-widget__title">
        <Wallet size={18} aria-hidden />
        {c.costTitle}
      </p>
      <ul>
        <li>{c.perMonth(money(monthly, lang))}</li>
        <li>{c.firstYear(moneyRange(lo, hi, lang))}</li>
      </ul>
      <Link to={`/cost?price=${price}`} className="link-arrow">
        {c.calc}
        <ArrowRight size={16} aria-hidden />
      </Link>
    </aside>
  )
}

/** The three next steps for someone interested in a breed. */
export function CtaRow({ breedId }: { breedId?: string }) {
  const lang = useLang()
  const c = COPY[lang]
  const q = breedId ? `?breed=${breedId}` : ''
  return (
    <div className="cta-row">
      <Link to={`/kittens${q}`} className="btn btn-primary">
        <PawPrint size={18} aria-hidden />
        {c.seeKittens}
      </Link>
      <Link to={`/booking${q}`} className="btn btn-ghost">
        <CalendarDays size={18} aria-hidden />
        {c.book}
      </Link>
      <Link to={`/contact${q}`} className="btn btn-ghost">
        <MessageCircle size={18} aria-hidden />
        {c.contact}
      </Link>
    </div>
  )
}

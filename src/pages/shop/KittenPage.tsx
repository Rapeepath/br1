import { useEffect } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, BadgeCheck, CalendarDays, Dna, MessageCircle, PawPrint, Stethoscope, Syringe } from 'lucide-react'
import { getBreed } from '../../data'
import { useLang } from '../../i18n'
import { localized } from '../../i18n/content'
import { SexLabel, StatusPill } from '../../components/shop/KittenCard'
import { CostWidget } from '../../components/shop/widgets'
import { ContactButtons } from '../../components/shop/StoreDetails'
import { Picture } from '../../components/Picture'
import { kittenPhoto, kittenText, usePublic, type GeneticResult, type Kitten } from '../../lib/kittens'
import { ApiError } from '../../lib/publicApi'
import { formatDay, money, READY_WEEKS, readyDay } from '../../lib/shop'
import '../../components/shop/kittens.css'
import '../../components/shop/shop.css'
import './shop-pages.css'
import './kitten-page.css'

const COPY = {
  th: {
    back: 'ลูกแมวทั้งหมด',
    code: 'รหัส',
    price: 'ราคา',
    vat: 'รวม VAT แล้ว',
    deposit: (d: string) => `มัดจำ ${d} หักออกจากราคาตอนรับน้อง`,
    reserve: 'จองน้องตัวนี้',
    reservedBody: 'น้องตัวนี้ติดจองอยู่ ถ้าการจองหมดเวลา น้องจะกลับมาว่างอีกครั้ง ฝากชื่อไว้ได้',
    soldBody: 'น้องตัวนี้ได้บ้านใหม่แล้ว',
    waitlist: 'ฝากชื่อไว้',
    book: 'นัดมาดูตัวจริง',
    ask: 'สอบถามเกี่ยวกับน้อง',
    photoNote: (b: string) => `ภาพตัวอย่างแมว${b} ไม่ใช่ภาพของน้องตัวนี้ ดูตัวจริงได้เมื่อนัดชมที่ร้าน`,
    credit: (a: string, l: string) => `ภาพ: ${a} (${l})`,
    factsTitle: 'ข้อมูลน้อง',
    sex: 'เพศ',
    color: 'สี',
    born: 'วันเกิด',
    age: (n: number) => `อายุ ${n} สัปดาห์`,
    ready: 'รับกลับบ้านได้',
    readyNow: 'ได้เลย',
    readyOn: (d: string) => `ตั้งแต่ ${d} (ครบ ${READY_WEEKS} สัปดาห์)`,
    grade: 'เกรด',
    chip: 'ไมโครชิป',
    chipYes: 'ฝังแล้ว พร้อมลงทะเบียนเจ้าของใหม่',
    chipNo: 'ยังไม่ได้ฝัง',
    vet: 'ตรวจสุขภาพล่าสุด',
    vetNone: 'รอนัดตรวจก่อนส่งมอบ',
    sire: 'พ่อพันธุ์',
    dam: 'แม่พันธุ์',
    vaccTitle: 'วัคซีนที่ได้แล้ว',
    vaccNone: 'ยังไม่ถึงกำหนดฉีดวัคซีนเข็มแรก (8 สัปดาห์)',
    vaccNext: 'เข็มที่เหลือดูได้ในตารางวัคซีน',
    dnaTitle: 'ผลตรวจทางพันธุกรรม',
    dnaNone: 'สายพันธุ์นี้ยังไม่มีการตรวจ DNA เฉพาะโรค น้องผ่านการตรวจสุขภาพทั่วไปโดยสัตวแพทย์',
    results: { negative: 'ไม่พบโรค', carrier: 'เป็นพาหะ', 'not-tested': 'ยังไม่ได้ตรวจ' } as Record<GeneticResult, string>,
    breedTitle: (b: string) => `รู้จักแมว${b}`,
    breedLink: 'อ่านข้อมูลสายพันธุ์ทั้งหมด',
    care: 'การดูแลและการรับประกัน',
    loading: 'กำลังโหลดข้อมูลน้อง',
    goneTitle: 'ไม่พบน้องตัวนี้',
    goneBody: 'น้องอาจได้บ้านใหม่แล้ว หรือลิงก์ไม่ถูกต้อง ดูน้องตัวอื่นที่พร้อมรับได้',
    offlineTitle: 'ยังดูข้อมูลน้องไม่ได้ในขณะนี้',
    offlineBody: 'ระบบของร้านไม่ตอบสนอง ลองใหม่อีกครั้ง หรือโทรและทัก LINE สอบถามได้เลย',
    retry: 'ลองใหม่',
    seeAll: 'ดูลูกแมวทั้งหมด',
  },
  en: {
    back: 'All kittens',
    code: 'Code',
    price: 'Price',
    vat: 'VAT included',
    deposit: (d: string) => `Deposit ${d}, taken off the price when you collect`,
    reserve: 'Reserve this kitten',
    reservedBody: 'This kitten is reserved. If the hold lapses, it becomes available again; leave your details to hear.',
    soldBody: 'This kitten has found a home.',
    waitlist: 'Leave your details',
    book: 'Book a visit to meet it',
    ask: 'Ask about this kitten',
    photoNote: (b: string) => `A sample photo of a ${b}, not of this kitten. Meet the real one when you visit the shop.`,
    credit: (a: string, l: string) => `Photo: ${a} (${l})`,
    factsTitle: 'About this kitten',
    sex: 'Sex',
    color: 'Colour',
    born: 'Born',
    age: (n: number) => `${n} weeks old`,
    ready: 'Can go home',
    readyNow: 'Now',
    readyOn: (d: string) => `From ${d} (at ${READY_WEEKS} weeks)`,
    grade: 'Grade',
    chip: 'Microchip',
    chipYes: 'Fitted, ready to register to you',
    chipNo: 'Not yet',
    vet: 'Last vet check',
    vetNone: 'Booked before handover',
    sire: 'Sire',
    dam: 'Dam',
    vaccTitle: 'Vaccines given',
    vaccNone: 'Not yet due for the first vaccine (8 weeks).',
    vaccNext: 'The remaining doses are on the vaccine schedule',
    dnaTitle: 'DNA test results',
    dnaNone: 'This breed has no disease-specific DNA test; the kitten has had a general vet examination.',
    results: { negative: 'Clear', carrier: 'Carrier', 'not-tested': 'Not tested' } as Record<GeneticResult, string>,
    breedTitle: (b: string) => `About the ${b}`,
    breedLink: 'Read the full breed profile',
    care: 'Aftercare and guarantee',
    loading: 'Loading the kitten',
    goneTitle: 'Kitten not found',
    goneBody: 'It may have found a home already, or the link is wrong. See the other kittens ready for a home.',
    offlineTitle: 'This kitten can’t be shown right now',
    offlineBody: 'The shop’s system isn’t responding. Try again, or call or message us on LINE.',
    retry: 'Try again',
    seeAll: 'See all kittens',
  },
}

const RESULT_TONE: Record<GeneticResult, string> = { negative: 'tone-mint', carrier: 'tone-butter', 'not-tested': 'tone-lavender' }

export function KittenPage() {
  const lang = useLang()
  const c = COPY[lang]
  const { id = '' } = useParams()
  const res = usePublic<Kitten>(`kittens/${encodeURIComponent(id)}`)
  const loaded = res.status === 'ready' ? res.data : null

  // The route's title is generic; once the kitten is known, name it
  useEffect(() => {
    if (!loaded) return
    const breed = getBreed(loaded.refId)
    const breedName = lang === 'en' ? (breed ? localized(breed, 'en').nameEn : '') : (breed?.nameTh ?? loaded.breedName)
    document.title = `${lang === 'th' ? 'น้อง' : ''}${loaded.name} ${breedName} – Maew`.replace(/\s+/g, ' ')
  }, [loaded, lang])

  if (res.status === 'loading') {
    return (
      <section className="shop-band kitten-page">
        <div className="container">
          <p className="visually-hidden" role="status">
            {c.loading}
          </p>
          <div className="kitten-hero" aria-hidden="true">
            <div className="skeleton kitten-hero__photo-skel" />
            <div className="skeleton kitten-hero__info-skel" />
          </div>
        </div>
      </section>
    )
  }

  if (res.status === 'error') {
    const gone = res.error instanceof ApiError && res.error.status === 404
    return (
      <section className="shop-band kitten-page">
        <div className="container narrow">
          <h1 className="kitten-missing__title">{gone ? c.goneTitle : c.offlineTitle}</h1>
          <div className="empty-card">
            <p>{gone ? c.goneBody : c.offlineBody}</p>
            <div className="btn-row">
              {!gone && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={res.reload}>
                  {c.retry}
                </button>
              )}
              <Link to="/kittens" className="btn btn-primary btn-sm">
                {c.seeAll}
              </Link>
            </div>
            {!gone && <ContactButtons />}
          </div>
        </div>
      </section>
    )
  }

  const k = res.data
  const text = kittenText(k, lang)
  const photo = kittenPhoto(k)
  const breed = getBreed(k.refId)
  const lb = breed ? localized(breed, lang) : null
  const breedName = lang === 'en' ? (lb?.nameEn ?? text.breedName) : (breed?.nameTh ?? text.breedName)
  const readyOn = readyDay(k.birthDate)

  return (
    <section className="shop-band kitten-page">
      <div className="container">
        <Link to="/kittens" className="shop-head__crumb">
          <ArrowLeft size={16} aria-hidden />
          {c.back}
        </Link>

        <div className="kitten-hero">
          <figure className="kitten-hero__photo">
            {photo && (
              <Picture
                src={photo.src}
                alt=""
                priority
                sizes="(max-width: 900px) 100vw, 50vw"
                style={photo.focus ? { objectPosition: photo.focus } : undefined}
              />
            )}
            <figcaption>
              <span>{c.photoNote(breedName)}</span>
              {photo?.author && <span className="kitten-hero__credit">{c.credit(photo.author, photo.license)}</span>}
            </figcaption>
          </figure>

          <div className="kitten-hero__info shop-sheet">
            <p className="kitten-hero__breed">
              <Link to={`/breeds/${k.refId}`}>{breedName}</Link>
              {text.grade && <span className="pill tone-peach">{text.grade}</span>}
            </p>
            <h1 className="kitten-hero__name">
              {lang === 'th' ? 'น้อง' : ''}
              <span lang="th">{k.name}</span>
            </h1>
            <p className="kitten-hero__meta">
              <StatusPill status={k.status} />
              <SexLabel sex={k.sex} />
              <span>{c.age(k.ageWeeks)}</span>
              <span className="kitten-hero__code">
                {c.code} {k.code}
              </span>
            </p>
            <div className="kitten-hero__price">
              <p className="kitten-hero__figure">{money(k.price, lang)}</p>
              <p>{c.vat}</p>
              <p>{c.deposit(money(k.deposit, lang))}</p>
            </div>

            {k.status === 'available' ? (
              <div className="btn-row">
                <Link to={`/reserve/${k.id}`} className="btn btn-primary">
                  <PawPrint size={18} aria-hidden />
                  {c.reserve}
                </Link>
                <Link to={`/booking?kitten=${k.id}`} className="btn btn-ghost">
                  <CalendarDays size={18} aria-hidden />
                  {c.book}
                </Link>
              </div>
            ) : (
              <div className="kitten-hero__held">
                <p>{k.status === 'reserved' ? c.reservedBody : c.soldBody}</p>
                <Link to={`/contact?breed=${k.refId}`} className="btn btn-ghost btn-sm">
                  {c.waitlist}
                </Link>
              </div>
            )}
            <Link to={`/contact?breed=${k.refId}`} className="link-arrow kitten-hero__ask">
              <MessageCircle size={16} aria-hidden />
              {c.ask}
            </Link>
          </div>
        </div>

        <div className="kitten-detail">
          <section className="shop-sheet" aria-labelledby="k-facts">
            <h2 id="k-facts">{c.factsTitle}</h2>
            <dl className="shop-facts">
              <div>
                <dt>{c.sex}</dt>
                <dd>
                  <SexLabel sex={k.sex} />
                </dd>
              </div>
              <div>
                <dt>{c.color}</dt>
                <dd>{text.color}</dd>
              </div>
              <div>
                <dt>{c.born}</dt>
                <dd>
                  {formatDay(k.birthDate, lang)} <span className="kitten-detail__sub">{c.age(k.ageWeeks)}</span>
                </dd>
              </div>
              <div>
                <dt>{c.ready}</dt>
                <dd>{k.ageWeeks >= READY_WEEKS ? c.readyNow : c.readyOn(formatDay(readyOn, lang))}</dd>
              </div>
              {text.grade && (
                <div>
                  <dt>{c.grade}</dt>
                  <dd>{text.grade}</dd>
                </div>
              )}
              <div>
                <dt>{c.chip}</dt>
                <dd>
                  <BadgeCheck size={16} aria-hidden className="kitten-detail__ok" /> {k.microchip ? c.chipYes : c.chipNo}
                </dd>
              </div>
              <div>
                <dt>{c.vet}</dt>
                <dd>
                  <Stethoscope size={16} aria-hidden className="kitten-detail__ok" /> {k.vetCheckAt ? formatDay(k.vetCheckAt, lang) : c.vetNone}
                </dd>
              </div>
              {text.sire && (
                <div>
                  <dt>{c.sire}</dt>
                  <dd>{text.sire}</dd>
                </div>
              )}
              {text.dam && (
                <div>
                  <dt>{c.dam}</dt>
                  <dd>{text.dam}</dd>
                </div>
              )}
            </dl>
          </section>

          <div className="shop-stack">
            <section className="shop-sheet" aria-labelledby="k-vacc">
              <h2 id="k-vacc">{c.vaccTitle}</h2>
              {text.vaccines.length ? (
                <ol className="kitten-vacc">
                  {text.vaccines.map((v) => (
                    <li key={v.name + v.date}>
                      <Syringe size={18} aria-hidden />
                      <span>
                        <strong>{v.name}</strong>
                        <span>{formatDay(v.date, lang)}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="kitten-detail__empty">{c.vaccNone}</p>
              )}
              <Link to="/care" className="link-arrow">
                {c.vaccNext}
              </Link>
            </section>

            <section className="shop-sheet" aria-labelledby="k-dna">
              <h2 id="k-dna">
                <Dna size={22} aria-hidden /> {c.dnaTitle}
              </h2>
              {text.tests.length ? (
                <ul className="kitten-dna">
                  {text.tests.map((t) => (
                    <li key={t.name}>
                      <span>{t.name}</span>
                      <span className={`pill ${RESULT_TONE[t.result]}`}>{c.results[t.result]}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="kitten-detail__empty">{c.dnaNone}</p>
              )}
            </section>

            <CostWidget price={k.price} />
          </div>
        </div>

        {lb && (
          <section className="shop-sheet kitten-breed" aria-labelledby="k-breed">
            <h2 id="k-breed">{c.breedTitle(breedName)}</h2>
            <p className="kitten-breed__tagline">{lb.tagline}</p>
            <p>{lb.summary}</p>
            <div className="btn-row">
              <Link to={`/breeds/${k.refId}`} className="link-arrow">
                {c.breedLink}
              </Link>
              <Link to="/care" className="link-arrow">
                {c.care}
              </Link>
            </div>
          </section>
        )}
      </div>
    </section>
  )
}

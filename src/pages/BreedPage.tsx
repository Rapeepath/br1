import { Picture } from '../components/Picture'
import { useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import {
  Activity,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  Check,
  ChevronRight,
  CircleAlert,
  HeartPulse,
  House,
  Images,
  Lightbulb,
  Plus,
  Scissors,
  Smile,
  Stethoscope,
  TriangleAlert,
  Utensils,
} from 'lucide-react'
import { Gallery } from '../components/Gallery'
import { useContactAway } from '../lib/fab'
import { RatingMeter } from '../components/RatingMeter'
import { Reviews } from '../components/Reviews'
import { CostWidget, CtaRow, KittenStrip, StockBadge } from '../components/shop/widgets'
import { Tabs, type TabItem } from '../components/Tabs'
import { breeds, getBreed } from '../data'
import { useLang, type Lang } from '../i18n'
import { localized } from '../i18n/content'
import { focusSoon, langOf } from '../lib/a11y'
import { useCompare } from '../lib/compare'
import { CURRENCY, labels, pick, price as formatPrice, range, textLang } from '../lib/locale'
import type { Breed } from '../lib/types'
import { NotFoundPage } from './NotFoundPage'
import './BreedPage.css'

const COPY = {
  th: {
    history: 'ประวัติ',
    looks: 'รูปลักษณ์เด่น',
    colours: 'สีและลายที่พบ',
    funFact: 'รู้หรือไม่',
    temperament: 'นิสัยเด่น',
    ratingNote: 'คะแนน 1–5 โดย 3 คือแมวบ้านทั่วไป แมวแต่ละตัวอาจต่างกันได้ตามการเลี้ยงดูและการเข้าสังคมตั้งแต่เล็ก',
    care: { grooming: 'การดูแลขน', exercise: 'การออกกำลังและของเล่น', diet: 'อาหาร', environment: 'ที่อยู่และสภาพแวดล้อม' },
    welfare: 'ข้อควรรู้ด้านสุขภาพและสวัสดิภาพ',
    healthNote:
      'รายการนี้คือโรคที่มีรายงานในสายพันธุ์ ส่วนใหญ่ไม่ได้หมายความว่าแมวทุกตัวจะเป็น (ยกเว้นที่ระบุในกรอบด้านบน) ขอผลตรวจของพ่อแม่พันธุ์จากฟาร์ม และพาลูกแมวตรวจสุขภาพกับสัตวแพทย์หลังรับเข้าบ้าน',
    suits: 'เหมาะกับ',
    consider: 'ควรพิจารณาก่อน',
    priceBlock: 'ราคาลูกแมวเกรดเลี้ยงโดยประมาณในไทย',
    priceLink: 'ดูเช็กลิสต์ก่อนซื้อและค่าใช้จ่ายรายเดือน',
    tabs: {
      overview: 'ภาพรวม',
      personality: 'บุคลิกและนิสัย',
      personalityShort: 'นิสัย',
      care: 'การดูแล',
      health: 'สุขภาพ',
      decide: 'ก่อนตัดสินใจ',
    },
    tabsLabel: (n: string) => `ข้อมูล${n}`,
    facts: {
      origin: 'ต้นกำเนิด',
      size: 'ขนาด',
      lifespan: 'อายุขัย',
      female: 'น้ำหนักเพศเมีย',
      male: 'น้ำหนักเพศผู้',
      coat: 'ลักษณะขน',
      recognised: 'สมาคมที่รับรอง',
      none: 'ยังไม่มีสมาคมหลักรับรอง',
    },
    crumbs: 'เส้นทาง',
    all: 'สายพันธุ์ทั้งหมด',
    categories: 'หมวดหมู่',
    photoAlt: (n: string) => `แมวสายพันธุ์${n}`,
    photo: 'ภาพ',
    allPhotos: (n: number) => `ดูภาพทั้งหมด (${n})`,
    approx: 'ราคาโดยประมาณ',
    inCompare: 'อยู่ในรายการเปรียบเทียบ',
    addCompare: 'เพิ่มเพื่อเปรียบเทียบ',
    goCompare: 'ไปหน้าเปรียบเทียบ',
    full: 'รายการเปรียบเทียบเต็มแล้ว',
    fullMax: '(สูงสุด 3 สายพันธุ์)',
    welfareFlag: 'ดูข้อควรรู้ด้านสุขภาพและสวัสดิภาพในแท็บสุขภาพ',
    shop: (n: string) => `รับ${n}จากร้าน`,
    sources: (n: number) => `แหล่งอ้างอิงของหน้านี้ (${n})`,
    others: 'สายพันธุ์อื่น',
    prev: 'ก่อนหน้า',
    next: 'ถัดไป',
  },
  en: {
    history: 'History',
    looks: 'Distinctive looks',
    colours: 'Colours and patterns',
    funFact: 'Did you know?',
    temperament: 'Temperament',
    ratingNote:
      'Scores run from 1 to 5, where 3 is an average house cat. Individual cats vary with their upbringing and early socialisation.',
    care: { grooming: 'Coat care', exercise: 'Exercise and play', diet: 'Diet', environment: 'Home and environment' },
    welfare: 'Health and welfare notes',
    healthNote:
      'These are conditions reported in the breed. Most do not mean every cat will have them (except where the box above says so). Ask the cattery for the parents’ test results, and take your kitten for a vet check once it is home.',
    suits: 'Suits',
    consider: 'Think about first',
    priceBlock: 'Approximate price of a pet-quality kitten in Thailand',
    priceLink: 'See the buyer’s checklist and monthly costs',
    tabs: {
      overview: 'Overview',
      personality: 'Personality and temperament',
      personalityShort: 'Personality',
      care: 'Care',
      health: 'Health',
      decide: 'Before you decide',
    },
    tabsLabel: (n: string) => `About the ${n}`,
    facts: {
      origin: 'Origin',
      size: 'Size',
      lifespan: 'Lifespan',
      female: 'Female weight',
      male: 'Male weight',
      coat: 'Coat',
      recognised: 'Recognised by',
      none: 'Not yet recognised by a major association',
    },
    crumbs: 'Breadcrumb',
    all: 'All breeds',
    categories: 'Categories',
    photoAlt: (n: string) => `${n} cat`,
    photo: 'Photo',
    allPhotos: (n: number) => `View all photos (${n})`,
    approx: 'Approximate price',
    inCompare: 'In your comparison',
    addCompare: 'Add to compare',
    goCompare: 'Go to the comparison',
    full: 'The comparison list is full',
    fullMax: '(up to 3 breeds)',
    welfareFlag: 'See the health and welfare notes in the Health tab',
    shop: (n: string) => `Get a ${n} from the shop`,
    sources: (n: number) => `References for this page (${n})`,
    others: 'Other breeds',
    prev: 'Previous',
    next: 'Next',
  },
}

type Copy = (typeof COPY)['th']

/**
 * Sets the currency unit smaller than the figure, as on a price tag. The range itself never
 * breaks; a line may only wrap before the unit. The text stays the same.
 */
function PriceFigure({ value }: { value: string }) {
  const m = value.match(CURRENCY)
  if (!m) return <span className="nowrap">{value}</span>
  return (
    <>
      <span className="nowrap">{m[1]}</span> <span className="price-unit">{m[2]}</span>
    </>
  )
}

/**
 * "โรคถุงน้ำในไต (Polycystic Kidney Disease, PKD)": the bracketed name in its own span, so phones can
 * set it as a quieter second line instead of squeezing both into one ragged heading. The text and
 * the heading's accessible name stay exactly the same.
 */
function ConditionName({ name }: { name: string }) {
  const m = name.match(/^(.*\S)\s+(\([^()]*[A-Za-z][^()]*\))$/)
  if (!m) return <>{name}</>
  return (
    <>
      {m[1]}{' '}
      <span className="health-list__en" lang={langOf(m[2])}>
        {m[2]}
      </span>
    </>
  )
}

function Overview({ b, c }: { b: Breed; c: Copy }) {
  return (
    <div className="panel-grid">
      <div className="prose overview-story">
        <p>{b.summary}</p>
        <h3 className="panel-subhead">{c.history}</h3>
        <p>{b.history}</p>
      </div>
      <div className="panel-side">
        <h3 className="panel-subhead">{c.looks}</h3>
        <ul className="ticks">
          {b.appearance.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
        <h3 className="panel-subhead">{c.colours}</h3>
        <ul className="chip-list chip-list--tones chip-list--colours">
          {b.coat.colors.map((col) => (
            <li key={col} className="chip">
              {col}
            </li>
          ))}
        </ul>
        {b.funFact && (
          <p className="note tone-butter">
            <span className="bubble note__bubble" aria-hidden="true">
              <Lightbulb size={20} />
            </span>
            <span>
              <strong>{c.funFact}</strong> <span className="note__text">{b.funFact}</span>
            </span>
          </p>
        )}
      </div>
    </div>
  )
}

function Personality({ b, c, lang }: { b: Breed; c: Copy; lang: Lang }) {
  const L = labels(lang)
  return (
    <div className="personality">
      <h3 className="panel-subhead panel-subhead--first">{c.temperament}</h3>
      <ul className="chip-list chip-list--lg chip-list--tones">
        {b.temperament.map((t) => (
          <li key={t} className="chip">
            {t}
          </li>
        ))}
      </ul>
      <div className="rating-groups">
        {L.ratingGroups.map((g) => (
          <section key={g.title} aria-label={g.title} className="rating-card">
            <h3 className="panel-subhead panel-subhead--first">{g.title}</h3>
            <ul className="rating-list">
              {g.keys.map((k) => (
                <li key={k}>
                  <span className="rating-list__label">
                    <span className="rating-list__name">{L.rating[k]}</span>
                    {L.ratingHint[k] && <small>{L.ratingHint[k]}</small>}
                  </span>
                  <RatingMeter value={b.ratings[k]} label={L.rating[k]} showValue />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <p className="panel-footnote">{c.ratingNote}</p>
    </div>
  )
}

const CARE_ITEMS = [
  { key: 'grooming', Icon: Scissors, tone: 'tone-peach' },
  { key: 'exercise', Icon: Activity, tone: 'tone-mint' },
  { key: 'diet', Icon: Utensils, tone: 'tone-butter' },
  { key: 'environment', Icon: House, tone: 'tone-sky' },
] as const

function Care({ b, c }: { b: Breed; c: Copy }) {
  return (
    <ul className="care-grid">
      {CARE_ITEMS.map(({ key, Icon, tone }) => (
        <li key={key} className={tone}>
          <span className="bubble care-grid__bubble" aria-hidden="true">
            <Icon size={22} />
          </span>
          <div>
            <h3>{c.care[key]}</h3>
            <p>{b.care[key]}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

function Health({ b, c }: { b: Breed; c: Copy }) {
  return (
    <div className="health">
      {b.welfareNote && (
        <div className="callout" role="note">
          <span className="bubble callout__bubble" aria-hidden="true">
            <TriangleAlert size={20} />
          </span>
          <div>
            <p className="callout__title">{c.welfare}</p>
            <p>{b.welfareNote}</p>
          </div>
        </div>
      )}
      <ul className="health-list">
        {b.health.map((h) => (
          <li key={h.name}>
            <span className="bubble tone-rose health-list__bubble" aria-hidden="true">
              <HeartPulse size={20} />
            </span>
            <div className="health-list__body">
              <h3>
                <ConditionName name={h.name} />
              </h3>
              <p>{h.detail}</p>
              {h.screening && (
                <p className="health-list__screen">
                  <Stethoscope size={16} aria-hidden />
                  <span>{h.screening}</span>
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
      <p className="panel-footnote">{c.healthNote}</p>
    </div>
  )
}

function Decide({ b, c, lang }: { b: Breed; c: Copy; lang: Lang }) {
  const L = labels(lang)
  const price = b.price ? formatPrice(b.price.min, b.price.max, lang) : null
  return (
    <div className="decide">
      <div className="decide__cols">
        <section aria-labelledby="ideal-title" className="decide__panel tone-mint">
          <div className="decide__head">
            <span className="bubble decide__bubble" aria-hidden="true">
              <Smile size={22} />
            </span>
            <h3 id="ideal-title" className="panel-subhead panel-subhead--first">
              {c.suits}
            </h3>
          </div>
          <ul className="ticks">
            {b.idealFor.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="consider-title" className="decide__panel tone-rose">
          <div className="decide__head">
            <span className="bubble decide__bubble" aria-hidden="true">
              <CircleAlert size={22} />
            </span>
            <h3 id="consider-title" className="panel-subhead panel-subhead--first">
              {c.consider}
            </h3>
          </div>
          <ul className="ticks ticks--caution">
            {b.considerations.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </section>
      </div>

      {/* Price panel: the figure on a peach tile, the context and a next step beside it */}
      <div className="price-block">
        <div className="price-block__figure tone-peach">
          <span className="bubble price-block__bubble" aria-hidden="true">
            <Banknote size={22} />
          </span>
          <div>
            <p className="price-block__label">{c.priceBlock}</p>
            <p className="price-block__value">{price ? <PriceFigure value={price} /> : L.noPrice}</p>
            {b.price && <p className="price-block__conf">{L.confidence[b.price.confidence]}</p>}
          </div>
        </div>
        <div className="price-block__note">
          {b.price?.note && <p>{b.price.note}</p>}
          <Link to="/guide" className="link-arrow">
            {c.priceLink}
            <ArrowUpRight size={18} aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  )
}

export function BreedPage() {
  const { id } = useParams()
  const breed = getBreed(id)
  if (!breed) return <NotFoundPage />
  // Keyed so tab state resets when moving to another breed with the pager.
  return <BreedDetail key={breed.id} breed={breed} />
}

function BreedDetail({ breed: thai }: { breed: Breed }) {
  const lang = useLang()
  const c = pick(COPY, lang)
  const L = labels(lang)
  const breed = localized(thai, lang)
  const [tab, setTab] = useState('overview')
  const { has, toggle, isFull } = useCompare()
  const location = useLocation()
  const openGallery = useRef<((index: number) => void) | null>(null)
  const photoRef = useRef<HTMLElement>(null)
  useContactAway(photoRef)
  // Return to the catalogue exactly as the visitor left it (filters live in the query string).
  const from = (location.state as { from?: string } | null)?.from ?? ''
  // The page's own name for the breed, and the other language's beneath it
  const name = lang === 'en' ? breed.nameEn : breed.nameTh
  const otherName = lang === 'en' ? thai.nameTh : breed.nameEn
  const nameOf = (b: Breed) => (lang === 'en' ? localized(b, 'en').nameEn : b.nameTh)

  const openHealth = () => {
    setTab('health')
    focusSoon('#breed-tabs [role="tab"][aria-selected="true"]')
    requestAnimationFrame(() =>
      document.getElementById('breed-tabs')?.scrollIntoView({
        block: 'start',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      }),
    )
  }

  const index = breeds.findIndex((b) => b.id === breed.id)
  const prev = breeds[(index - 1 + breeds.length) % breeds.length]
  const next = breeds[(index + 1) % breeds.length]
  const selected = has(breed.id)

  const tabs: TabItem[] = [
    { id: 'overview', label: c.tabs.overview, content: <Overview b={breed} c={c} /> },
    {
      id: 'personality',
      label: c.tabs.personality,
      shortLabel: c.tabs.personalityShort,
      content: <Personality b={breed} c={c} lang={lang} />,
    },
    { id: 'care', label: c.tabs.care, content: <Care b={breed} c={c} /> },
    { id: 'health', label: c.tabs.health, content: <Health b={breed} c={c} /> },
    { id: 'decide', label: c.tabs.decide, content: <Decide b={breed} c={c} lang={lang} /> },
  ]

  // Key facts as small lavender tiles under the price and actions; long values take a full row.
  const facts: { label: string; value: string; wide?: boolean }[] = [
    { label: c.facts.origin, value: breed.origin, wide: true },
    { label: c.facts.size, value: L.size[breed.size] },
    { label: c.facts.lifespan, value: range(breed.lifespanYears, 'years', lang) ?? L.unknown },
    { label: c.facts.female, value: range(breed.weightKg.female, 'kg', lang) ?? L.unknown },
    { label: c.facts.male, value: range(breed.weightKg.male, 'kg', lang) ?? L.unknown },
    { label: c.facts.coat, value: breed.coat.texture, wide: true },
    {
      label: c.facts.recognised,
      value: breed.recognizedBy.length > 0 ? breed.recognizedBy.join(', ') : c.facts.none,
      wide: true,
    },
  ]
  const price = breed.price ? formatPrice(breed.price.min, breed.price.max, lang) : null
  const focus = (b: Breed) => (b.image.focus ? { objectPosition: b.image.focus } : undefined)
  const gallery = breed.gallery ?? []

  return (
    <article className="breed">
      <div className="breed__hero">
        <div className="container">
          <nav className="crumbs" aria-label={c.crumbs}>
            <Link to={{ pathname: '/', search: from }} state={{ scrollTo: 'breeds' }}>
              {c.all}
            </Link>
            <ChevronRight size={14} aria-hidden />
            <span aria-current="page">{name}</span>
          </nav>

          <header className="breed__head">
            <figure className="breed__media" ref={photoRef}>
              <Picture src={breed.image.src} alt={c.photoAlt(name)} sizes="(max-width: 960px) 100vw, 50vw" priority style={focus(breed)} />
              {/* More photos sit right under the main one, as small thumbnails, instead of a section of their own */}
              {gallery.length > 0 && (
                <div className="breed__strip">
                  <Gallery
                    items={gallery}
                    main={breed.image}
                    mainAlt={c.photoAlt(name)}
                    name={name}
                    openRef={openGallery}
                    compact
                  />
                  <button type="button" className="breed__gallery-btn" onClick={() => openGallery.current?.(0)}>
                    <Images size={18} aria-hidden />
                    {c.allPhotos(gallery.length + 1)}
                  </button>
                </div>
              )}
              <figcaption>
                {c.photo}: {breed.image.author}{' '}
                <a href={breed.image.page} target="_blank" rel="noreferrer">
                  {breed.image.license}
                </a>
              </figcaption>
            </figure>

            <div className="breed__info">
              <ul className="chip-list" aria-label={c.categories}>
                <li className={breed.group === 'thai' ? 'chip chip-thai' : 'chip'}>{L.group[breed.group]}</li>
                <li className="chip tone-mint">{L.coat[breed.coat.length]}</li>
              </ul>
              <h1 lang={lang === 'en' ? 'en' : undefined}>{name}</h1>
              <p className="breed__en" lang={lang === 'en' ? 'th' : 'en'}>
                {otherName}
              </p>
              <p className="breed__tagline">{breed.tagline}</p>

              {/* Name, price, then the actions; the key facts follow */}
              <dl className="breed__price">
                <dt>{c.approx}</dt>
                <dd>{price ? <PriceFigure value={price} /> : L.noPrice}</dd>
              </dl>
              <div className="breed__stock">
                <StockBadge refId={breed.id} />
              </div>

              <div className="breed__actions">
                <button
                  type="button"
                  className={selected ? 'btn breed__compare' : 'btn btn-primary breed__compare'}
                  data-selected={selected || undefined}
                  aria-disabled={(!selected && isFull) || undefined}
                  aria-describedby={!selected && isFull ? 'compare-full-hint' : undefined}
                  onClick={() => (selected || !isFull) && toggle(breed.id)}
                >
                  {selected ? <Check size={18} aria-hidden /> : <Plus size={18} aria-hidden />}
                  {selected ? c.inCompare : c.addCompare}
                </button>
                {selected && (
                  <Link to="/compare" className="link-arrow">
                    {c.goCompare}
                    <ArrowUpRight size={18} aria-hidden />
                  </Link>
                )}
                {!selected && isFull && (
                  <p className="breed__hint" id="compare-full-hint">
                    {c.full} <span className="nowrap">{c.fullMax}</span>
                  </p>
                )}
              </div>

              {breed.welfareFlag && breed.welfareNote && (
                <button type="button" className="welfare-flag" onClick={openHealth}>
                  <span className="welfare-flag__bubble" aria-hidden="true">
                    <TriangleAlert size={18} />
                  </span>
                  <span className="welfare-flag__text">{c.welfareFlag}</span>
                  <ArrowDown size={18} aria-hidden className="welfare-flag__arrow" />
                </button>
              )}

              <dl className="facts">
                {facts.map((f) => (
                  <div key={f.label} className={f.wide ? 'facts__wide' : undefined}>
                    <dt>{f.label}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </header>
        </div>
      </div>

      <div className="container">
        <div className="breed__tabs">
          <Tabs id="breed-tabs" items={tabs} active={tab} onChange={setTab} label={c.tabsLabel(name)} />
        </div>

        {/* The shop: its kittens of this breed, the likely cost, and the next steps */}
        {/* The strip brings its own heading (it renders nothing when the shop's system can't be reached) */}
        <section className="breed__shop" aria-label={c.shop(name)}>
          <KittenStrip breedId={breed.id} />
          <div className="breed__shop-row">
            {breed.price?.min != null && <CostWidget price={breed.price.min} />}
            <CtaRow breedId={breed.id} />
          </div>
        </section>

        <div className="breed__reviews">
          <Reviews refId={breed.id} name={name} />
        </div>

        <details className="breed__sources">
          <summary>
            <span>{c.sources(breed.sources.length)}</span>
            <span className="breed__sources-bubble" aria-hidden="true">
              <Plus size={20} />
            </span>
          </summary>
          <ol>
            {breed.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noreferrer" lang={textLang(s.title, lang)}>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </details>

        <div className="breed__more">
          <nav className="pager" aria-label={c.others}>
            <Link to={`/breeds/${prev.id}`} state={{ from }} className="pager__link">
              <span className="pager__arrow" aria-hidden="true">
                <ArrowLeft size={20} />
              </span>
              <Picture className="pager__thumb" src={prev.image.src} alt="" sizes="120px" style={focus(prev)} />
              <span className="pager__text">
                <small>{c.prev}</small> <span className="pager__name">{nameOf(prev)}</span>
              </span>
            </Link>
            <Link to={`/breeds/${next.id}`} state={{ from }} className="pager__link pager__link--next">
              <span className="pager__text">
                <small>{c.next}</small> <span className="pager__name">{nameOf(next)}</span>
              </span>
              <Picture className="pager__thumb" src={next.image.src} alt="" sizes="120px" style={focus(next)} />
              <span className="pager__arrow" aria-hidden="true">
                <ArrowRight size={20} />
              </span>
            </Link>
          </nav>
        </div>
      </div>
    </article>
  )
}

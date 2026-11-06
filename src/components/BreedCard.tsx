import { Picture } from './Picture'
import { Link, useLocation } from 'react-router'
import { Check, Plus } from 'lucide-react'
import { useLang } from '../i18n'
import { localized } from '../i18n/content'
import { useCompare } from '../lib/compare'
import { overallWeight } from '../lib/format'
import { CURRENCY, labels, pick, price as formatPrice, range } from '../lib/locale'
import type { Breed } from '../lib/types'
import { StockBadge } from './shop/widgets'
import './BreedCard.css'

// Brief labels fit a half-width phone card: "เปรียบเทียบ" reads like a lineup's compare checkbox,
// with the icon and fill showing whether it is ticked.
const COPY = {
  th: {
    add: { full: 'เพิ่มเพื่อเปรียบเทียบ', brief: 'เปรียบเทียบ' },
    selected: { full: 'อยู่ในรายการเปรียบเทียบ', brief: 'เปรียบเทียบ' },
    blocked: { full: 'เลือกครบ 3 สายพันธุ์แล้ว', brief: 'ครบ 3 แล้ว' },
    priceHead: 'ราคา',
    priceTail: 'ประมาณ',
    unit: ' บาท',
    weight: 'น้ำหนัก',
    lifespan: 'อายุขัย',
  },
  en: {
    add: { full: 'Add to compare', brief: 'Compare' },
    selected: { full: 'In your comparison', brief: 'Compare' },
    blocked: { full: '3 breeds already chosen', brief: '3 chosen' },
    priceHead: 'Approx.',
    priceTail: ' price',
    unit: ' baht',
    weight: 'Weight',
    lifespan: 'Lifespan',
  },
}

/**
 * A catalogue card kept quiet: the photo, the names, an approximate price and two figures in a row, the shop's
 * live availability and the compare toggle. Everything else waits on the breed page.
 */
export function BreedCard({ breed: base }: { breed: Breed }) {
  const lang = useLang()
  const c = pick(COPY, lang)
  const L = labels(lang)
  const breed = localized(base, lang)
  const { has, toggle, isFull } = useCompare()
  const { search } = useLocation()
  const selected = has(breed.id)
  const blocked = !selected && isFull
  const to = `/breeds/${breed.id}`
  // Remember the filtered list so the breed page's "back" link returns to it.
  const state = { from: search }
  const price = breed.price ? formatPrice(breed.price.min, breed.price.max, lang) : null
  const priceUnit = price?.match(CURRENCY)
  const label = c[selected ? 'selected' : blocked ? 'blocked' : 'add']
  // English pages lead with the English name; the Thai one follows as the second line, and vice versa
  const primary = lang === 'en' ? breed.nameEn : breed.nameTh
  const secondary = lang === 'en' ? base.nameTh : breed.nameEn

  return (
    // The wrapper lets every grid cell stretch the card to the row's height
    <div className="plate-stack">
      <article className="plate" aria-labelledby={`plate-${breed.id}`}>
        {/* The photo is an extra pointer target for the title link, so it stays out of the tab order */}
        <Link to={to} state={state} className="plate__media" tabIndex={-1} aria-hidden="true">
          <Picture
            src={breed.image.srcSmall}
            alt=""
            sizes="(max-width: 960px) 50vw, (max-width: 1199px) 33vw, 25vw"
            style={breed.image.focus ? { objectPosition: breed.image.focus } : undefined}
          />
        </Link>

        <div className="plate__body">
          <div className="plate__title">
            <h3 id={`plate-${breed.id}`} lang={lang === 'en' ? 'en' : undefined}>
              <Link to={to} state={state}>
                {primary}
              </Link>
            </h3>
            {breed.group === 'thai' && <span className="chip chip-thai">{L.group.thai}</span>}
          </div>
          <p className="plate__en" lang={lang === 'en' ? 'th' : 'en'}>
            {secondary}
          </p>

          {/* The price, then two figures in a row; the rest of the story is on the breed page */}
          <p className="plate__price">
            <span className="plate__price-label">
              {c.priceHead}
              {c.priceTail}{' '}
            </span>
            {priceUnit ? (
              <>
                <span className="plate__figure nowrap">{priceUnit[1]}</span>
                <span className="plate__unit">{c.unit}</span>
              </>
            ) : (
              <Figure text={price ?? L.noPrice} />
            )}
          </p>
          <ul className="plate__specs">
            <li>
              <span className="plate__spec-label">{c.weight} </span>
              <Figure text={range(overallWeight(breed.weightKg), 'kg', lang) ?? L.unknown} />
            </li>
            <li>
              <span className="plate__spec-label">{c.lifespan} </span>
              <Figure text={range(breed.lifespanYears, 'years', lang) ?? L.unknown} />
            </li>
          </ul>

          {/* The shop's live availability (only when its system answers) */}
          <div className="plate__stock">
            <StockBadge refId={breed.id} brief />
          </div>
          {/* The label carries the state, so no aria-pressed; a full list keeps the button focusable.
              Phone cards show the brief label and keep the full one for screen readers, so the name
              is the same everywhere and always contains the words on screen. */}
          <button
            type="button"
            className="plate__compare"
            data-selected={selected || undefined}
            aria-disabled={blocked || undefined}
            onClick={() => !blocked && toggle(breed.id)}
          >
            {selected ? <Check size={16} aria-hidden /> : <Plus size={16} aria-hidden />}
            <span className="plate__label">{label.full}</span>
            <span className="plate__label-brief" aria-hidden="true">
              {label.brief}
            </span>
            <span className="visually-hidden"> {primary}</span>
          </button>
        </div>
      </article>
    </div>
  )
}

/** "2,000–10,000 บาท" → the number range never breaks; a narrow card may only wrap before the unit. */
function Figure({ text }: { text: string }) {
  const m = text.match(/^(.*\d)\s+(\D+)$/)
  if (!m) return <>{text}</>
  return (
    <>
      <span className="nowrap">{m[1]}</span> {m[2]}
    </>
  )
}

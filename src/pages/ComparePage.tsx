import { Picture } from '../components/Picture'
import { Fragment, useId, useState, useSyncExternalStore, type ReactNode } from 'react'
import { Link } from 'react-router'
import { Check, ChevronDown, Plus, X } from 'lucide-react'
import { RatingMeter } from '../components/RatingMeter'
import { breeds, getBreed } from '../data'
import { useLang, type Lang } from '../i18n'
import { localized } from '../i18n/content'
import { focusSoon, focusSoonQuietly } from '../lib/a11y'
import { COMPARE_LIMIT, useCompare } from '../lib/compare'
import { CURRENCY, labels, pick, price as formatPrice, range } from '../lib/locale'
import type { Breed } from '../lib/types'
import './ComparePage.css'

interface Row {
  label: string
  /** The label as phones show it, on its own line above the values (it may carry the unit) */
  phoneLabel?: string
  render: (b: Breed) => ReactNode
  /** Free text that three ~100px phone columns would chop up: phones restack it, one named block per breed */
  stack?: boolean
}

const COPY = {
  th: {
    rows: {
      group: 'กลุ่ม',
      groupPhone: 'กลุ่มสายพันธุ์',
      origin: 'ต้นกำเนิด',
      size: 'ขนาด',
      female: 'น้ำหนักเพศเมีย',
      male: 'น้ำหนักเพศผู้',
      lifespan: 'อายุขัย',
      coat: 'ความยาวขน',
      price: 'ราคาโดยประมาณ',
      pricePhone: 'ราคาโดยประมาณ (บาท)',
      temperament: 'นิสัยเด่น',
      health: 'เรื่องสุขภาพที่ควรรู้',
      suits: 'เหมาะกับ',
    },
    basics: 'ข้อมูลพื้นฐาน',
    details: 'รายละเอียด',
    addLabel: 'เพิ่มสายพันธุ์',
    addFull: 'ครบ 3 สายพันธุ์แล้ว',
    addChoose: 'เลือกสายพันธุ์',
    add: 'เพิ่ม',
    pickFirstA: 'เลือกอย่างน้อย 2 สายพันธุ์',
    pickFirstB: 'เพื่อเริ่มเปรียบเทียบ',
    pickMore: 'เลือกอีกอย่างน้อย 1 สายพันธุ์',
    pickHintA: 'แตะเพื่อเลือกหรือยกเลิก หรือกด',
    pickHintB: '“เพิ่มเพื่อเปรียบเทียบ”',
    pickHintC: 'ที่หน้าสายพันธุ์',
    h1a: 'เปรียบเทียบ',
    h1b: 'สายพันธุ์',
    lede: (n: number) => `วางข้อมูลเทียบกันทีละแถว เลือกได้สูงสุด ${n} สายพันธุ์`,
    clear: 'ล้างรายการ',
    region: 'ตารางเปรียบเทียบ',
    caption: (names: string) => `เปรียบเทียบ ${names}`,
    remove: (n: string) => `นำ${n}ออก`,
    footnote: 'คะแนน 1–5 โดย 3 คือแมวบ้านทั่วไป แมวแต่ละตัวอาจต่างกันได้ตามการเลี้ยงดู',
  },
  en: {
    rows: {
      group: 'Group',
      groupPhone: 'Breed group',
      origin: 'Origin',
      size: 'Size',
      female: 'Female weight',
      male: 'Male weight',
      lifespan: 'Lifespan',
      coat: 'Coat length',
      price: 'Approx. price',
      pricePhone: 'Approx. price (baht)',
      temperament: 'Temperament',
      health: 'Health issues to know',
      suits: 'Suits',
    },
    basics: 'Basics',
    details: 'Details',
    addLabel: 'Add a breed',
    addFull: '3 breeds chosen',
    addChoose: 'Choose a breed',
    add: 'Add',
    pickFirstA: 'Choose at least 2 breeds',
    pickFirstB: 'to start comparing',
    pickMore: 'Choose at least 1 more breed',
    pickHintA: 'Tap to choose or remove, or press',
    pickHintB: '“Add to compare”',
    pickHintC: 'on a breed page',
    h1a: 'Compare',
    h1b: 'breeds',
    lede: (n: number) => `Line breeds up row by row. Choose up to ${n}.`,
    clear: 'Clear list',
    region: 'Comparison table',
    caption: (names: string) => `Comparing ${names}`,
    remove: (n: string) => `Remove ${n}`,
    footnote: 'Scores run from 1 to 5, where 3 is an average house cat. Individual cats vary with their upbringing.',
  },
}

type Copy = (typeof COPY)['th']

function basicRows(c: Copy, lang: Lang): Row[] {
  const L = labels(lang)
  return [
    {
      label: c.rows.group,
      phoneLabel: c.rows.groupPhone,
      render: (b) => (lang === 'th' ? <GroupText text={L.group[b.group]} /> : L.group[b.group]),
    },
    { label: c.rows.origin, render: (b) => b.origin, stack: true },
    { label: c.rows.size, render: (b) => L.size[b.size] },
    { label: c.rows.female, render: (b) => range(b.weightKg.female, 'kg', lang) ?? L.unknown },
    { label: c.rows.male, render: (b) => range(b.weightKg.male, 'kg', lang) ?? L.unknown },
    { label: c.rows.lifespan, render: (b) => range(b.lifespanYears, 'years', lang) ?? L.unknown },
    { label: c.rows.coat, render: (b) => L.coat[b.coat.length] },
    {
      label: c.rows.price,
      phoneLabel: c.rows.pricePhone,
      render: (b) => {
        const price = b.price && formatPrice(b.price.min, b.price.max, lang)
        return (
          <span className="cmp-price">
            {price ? (
              <span className="cmp-price__fig">
                <PriceText text={price} />
              </span>
            ) : (
              L.noPrice
            )}
          </span>
        )
      },
    },
  ]
}

function listRows(c: Copy): Row[] {
  return [
    { label: c.rows.temperament, render: (b) => b.temperament.slice(0, 4).join(', '), stack: true },
    {
      label: c.rows.health,
      stack: true,
      render: (b) => (
        <ul className="cmp-list">
          {b.health.map((h) => (
            // The short name only; the bracketed term stays on the breed page, columns are narrow
            <li key={h.name}>{h.name.replace(/\s*\([^)]*\)\s*$/, '')}</li>
          ))}
        </ul>
      ),
    },
    {
      label: c.rows.suits,
      stack: true,
      render: (b) => (
        <ul className="cmp-list">
          {b.idealFor.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      ),
    },
  ]
}
/**
 * Keeps the figures of a price together ("10,000–60,000"); a line may only break before "บาท".
 * Phones move the unit up into the row label, so there it stays for screen readers only.
 */
function PriceText({ text }: { text: string }) {
  const m = CURRENCY.exec(text)
  if (!m) return text
  return (
    <>
      <span className="nowrap">{m[1]}</span> <span className="cmp-phone-sr">{m[2]}</span>
    </>
  )
}

/** "สายพันธุ์ไทย": phones label the row "กลุ่มสายพันธุ์", so the prefix stays for screen readers only. */
function GroupText({ text }: { text: string }) {
  const m = /^(สายพันธุ์)(.+)$/.exec(text)
  if (!m) return text
  return (
    <>
      <span className="cmp-phone-sr">{m[1]}</span>
      {m[2]}
    </>
  )
}

/** Two-word Thai names ("อเมริกัน ช็อตแฮร์") wrap at the space, never inside a word. */
function Words({ text }: { text: string }) {
  return text.split(' ').map((word, k) => (
    <Fragment key={k}>
      {k > 0 && ' '}
      <span className="nowrap">{word}</span>
    </Fragment>
  ))
}

/** Matches ComparePage.css's phone layout */
const PHONE_QUERY = '(max-width: 640px)'

function useMedia(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
  )
}

/** A select plus an explicit button: browsing the options with arrow keys must not add anything. */
function AddBreed({ exclude, onAdd, full, c, lang }: { exclude: string[]; onAdd: (id: string) => void; full: boolean; c: Copy; lang: Lang }) {
  const id = useId()
  const [choice, setChoice] = useState('')
  const options = breeds.filter((b) => !exclude.includes(b.id))
  // A closed select shows its choice on one line; on a phone "อเมริกัน ช็อตแฮร์ (American Shorthair)"
  // would be cut off, so phones list Thai names only, as their column headers do.
  const phone = useMedia(PHONE_QUERY)
  return (
    <div className="cmp-add">
      <div className="cmp-add__select">
        <label htmlFor={id}>{c.addLabel}</label>
        <select id={id} value={choice} disabled={full} onChange={(e) => setChoice(e.target.value)} data-cmp-add>
          <option value="">{full ? c.addFull : c.addChoose}</option>
          {options.map((b) => (
            <option key={b.id} value={b.id}>
              {lang === 'en' ? localized(b, 'en').nameEn : phone ? b.nameTh : `${b.nameTh} (${b.nameEn})`}
            </option>
          ))}
        </select>
        <ChevronDown size={16} aria-hidden />
      </div>
      <button
        type="button"
        className="btn btn-ghost btn-sm cmp-add__btn"
        disabled={full || !choice}
        onClick={() => {
          onAdd(choice)
          setChoice('')
          // This button disables itself; continue at the newly added column.
          focusSoon(() => [...document.querySelectorAll<HTMLElement>('.cmp-breed a')].at(-1), '.cmp-scroll')
        }}
      >
        <Plus size={16} aria-hidden />
        <span className="cmp-add__btn-text">{c.add}</span>
      </button>
    </div>
  )
}

/** Picker shown until two breeds are chosen — a comparison needs at least two columns. */
function Picker({ ids, toggle, c, lang }: { ids: string[]; toggle: (id: string) => void; c: Copy; lang: Lang }) {
  return (
    <div className="cmp-empty">
      <p className="cmp-empty__title">
        {ids.length === 0 ? (
          // Phones break the line between the two phrases, never inside "สายพันธุ์" or "เปรียบเทียบ"
          <>
            {c.pickFirstA}
            <br className="cmp-phone-br" />
            {c.pickFirstB}
          </>
        ) : (
          c.pickMore
        )}
      </p>
      <p>
        {c.pickHintA} <span className="nowrap">{c.pickHintB}</span> {c.pickHintC}
      </p>
      <ul className="cmp-picks">
        {breeds.map((b, i) => {
          const on = ids.includes(b.id)
          return (
            <li key={b.id}>
              <button
                type="button"
                aria-pressed={on}
                data-pick={i}
                onClick={() => {
                  toggle(b.id)
                  // The grid may be replaced by the table; keep focus on something real.
                  focusSoon(`[data-pick="${i}"]`, '[data-cmp-add]', '#main h1')
                }}
              >
                <Picture src={b.image.srcSmall} alt="" sizes="40px" width={40} height={40} />
                <span>
                  <Words text={lang === 'en' ? localized(b, 'en').nameEn : b.nameTh} />
                </span>
                {on && <Check size={16} aria-hidden className="cmp-picks__check" />}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function ComparePage() {
  const { ids, toggle, remove, clear, isFull } = useCompare()
  const lang = useLang()
  const c = pick(COPY, lang)
  const L = labels(lang)
  const selected = ids
    .map(getBreed)
    .filter((b) => b != null)
    .map((b) => localized(b, lang))
  const nameOf = (b: Breed) => (lang === 'en' ? b.nameEn : b.nameTh)
  const BASIC_ROWS = basicRows(c, lang)
  const LIST_ROWS = listRows(c)
  const cols = selected.length

  const removeAt = (index: number, id: string) => {
    remove(id)
    focusSoon(
      () => document.querySelectorAll<HTMLElement>('.cmp-breed__remove')[index] ?? null,
      () => document.querySelectorAll<HTMLElement>('.cmp-breed__remove')[index - 1] ?? null,
      '[data-pick="0"]',
      '#main h1',
    )
  }

  const clearAll = () => {
    clear()
    focusSoonQuietly('[data-pick="0"]', '#main h1')
  }

  // A band that re-labels the columns, so long tables never lose track of which breed is which.
  // The phone-only label rows span the (zero-width on phones) label column too, so they reach the far edge.
  const band = (title: string) => (
    <>
      <tr className="cmp-rowlabel cmp-rowlabel--section" aria-hidden="true">
        <td colSpan={cols + 1}>{title}</td>
      </tr>
      <tr className="cmp-section">
        <th scope="rowgroup">{title}</th>
        {selected.map((b) => (
          <td key={b.id} aria-hidden="true">
            {nameOf(b)}
          </td>
        ))}
      </tr>
    </>
  )

  // On phones the row label sits on its own line above the values (CSS hides it on wider screens).
  const row = (label: string, cells: ReactNode[], phoneLabel = label) => (
    <Fragment key={label}>
      <tr className="cmp-rowlabel" aria-hidden="true">
        <td colSpan={cols + 1}>{phoneLabel}</td>
      </tr>
      <tr>
        <th scope="row">{label}</th>
        {cells}
      </tr>
    </Fragment>
  )

  // Free-text rows: wider screens keep the columns; phones swap them (CSS, so only one is ever exposed)
  // for a single cell spanning every column, a list of named blocks, one per breed. The stacked row
  // comes first so the column row stays its tbody's :last-child on desktop.
  const stackedRow = (r: Row) => (
    <Fragment key={r.label}>
      <tr className="cmp-rowlabel" aria-hidden="true">
        <td colSpan={cols + 1}>{r.phoneLabel ?? r.label}</td>
      </tr>
      <tr className="cmp-stackrow">
        <th scope="row">{r.label}</th>
        <td colSpan={cols}>
          <dl className="cmp-stack">
            {selected.map((b) => (
              <div key={b.id}>
                <dt>
                  <Picture src={b.image.srcSmall} alt="" sizes="28px" width={28} height={28} style={b.image.focus ? { objectPosition: b.image.focus } : undefined} />
                  <span>
                    <Words text={nameOf(b)} />
                  </span>
                </dt>
                <dd>{r.render(b)}</dd>
              </div>
            ))}
          </dl>
        </td>
      </tr>
      <tr className="cmp-colrow">
        <th scope="row">{r.label}</th>
        {selected.map((b) => (
          <td key={b.id}>{r.render(b)}</td>
        ))}
      </tr>
    </Fragment>
  )

  const specRow = (r: Row) =>
    r.stack
      ? stackedRow(r)
      : row(
          r.label,
          selected.map((b) => <td key={b.id}>{r.render(b)}</td>),
          r.phoneLabel,
        )

  return (
    <div className="compare">
      <header className="compare-head">
        <div className="container compare-head__inner">
          <div>
            <h1>
              {c.h1a}
              <br />
              <span className="tint">{c.h1b}</span>
            </h1>
          </div>
          <div className="compare-head__aside">
            <p className="compare-head__lede">{c.lede(COMPARE_LIMIT)}</p>
            {cols > 0 && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={clearAll}>
                <X size={14} aria-hidden />
                {c.clear}
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="container compare__body">
        {cols < 2 ? (
          <Picker ids={ids} toggle={toggle} c={c} lang={lang} />
        ) : (
          <>
            <AddBreed exclude={ids} onAdd={toggle} full={isFull} c={c} lang={lang} />
            <div className="cmp-scroll" role="region" aria-label={c.region} tabIndex={0}>
              <table className="cmp-table" style={{ ['--cols' as string]: cols }}>
                <caption className="visually-hidden">{c.caption(selected.map(nameOf).join(', '))}</caption>
                <thead>
                  <tr>
                    <td className="cmp-corner" />
                    {selected.map((b, i) => (
                      // aria-label keeps the column header to the breed name (not the remove button's text)
                      <th key={b.id} scope="col" aria-label={nameOf(b)}>
                        <div className="cmp-breed">
                          <Picture src={b.image.srcSmall} alt="" sizes="(max-width: 720px) 33vw, 240px" style={b.image.focus ? { objectPosition: b.image.focus } : undefined} />
                          <Link to={`/breeds/${b.id}`}>
                            <Words text={nameOf(b)} />
                          </Link>
                          <span lang={lang === 'en' ? 'th' : 'en'}>{lang === 'en' ? getBreed(b.id)?.nameTh : b.nameEn}</span>
                          <button
                            type="button"
                            className="cmp-breed__remove"
                            onClick={() => removeAt(i, b.id)}
                            aria-label={c.remove(nameOf(b))}
                          >
                            <X size={16} aria-hidden />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {band(c.basics)}
                  {BASIC_ROWS.map(specRow)}
                </tbody>
                {L.ratingGroups.map((g) => (
                  <tbody key={g.title}>
                    {band(g.title)}
                    {g.keys.map((k) =>
                      row(
                        L.rating[k],
                        selected.map((b) => (
                          <td key={b.id}>
                            <RatingMeter value={b.ratings[k]} label={`${nameOf(b)} ${L.rating[k]}`} showValue />
                          </td>
                        )),
                      ),
                    )}
                  </tbody>
                ))}
                <tbody>
                  {band(c.details)}
                  {LIST_ROWS.map(specRow)}
                </tbody>
              </table>
            </div>
            <p className="cmp-footnote">{c.footnote}</p>
          </>
        )}
      </div>
    </div>
  )
}

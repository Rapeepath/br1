import { Fragment, useEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router'
import { ArrowUpRight, HandHeart, PiggyBank, RotateCcw } from 'lucide-react'
import { PriceRangeChart } from '../components/PriceRangeChart'
import { breeds, en, market as thaiMarket } from '../data'
import { useLang } from '../i18n'
import { focusSoon } from '../lib/a11y'
import { formatNumber } from '../lib/format'
import { month, pick, textLang } from '../lib/locale'
import type { CostItem } from '../lib/types'
import './GuidePage.css'

const COPY = {
  th: {
    sections: {
      checklist: 'เช็กลิสต์จากฟาร์ม',
      vaccines: 'ตารางวัคซีน',
      costs: 'ค่าใช้จ่าย',
      prices: 'ราคาแต่ละสายพันธุ์',
      law: 'กฎหมายที่ควรรู้',
      adopt: 'รับเลี้ยงแทนการซื้อ',
    },
    h1a: 'คู่มือก่อนซื้อ',
    h1b: 'ลูกแมว',
    asOf: (d: string) => `ข้อมูล ณ ${d}`,
    toc: 'หัวข้อในหน้านี้',
    tocTitle: 'ในหน้านี้',
    checklistTitle: 'เช็กลิสต์จากฟาร์ม',
    checklistLede:
      'ถามและขอดูให้ครบก่อนโอนเงิน ฟาร์มที่ดีจะเตรียมเอกสารเหล่านี้ไว้ให้อยู่แล้ว ติ๊กเก็บไว้ได้ระหว่างคุยกับฟาร์ม',
    checked: (n: number, of: number) => `ตรวจแล้ว ${n} จาก ${of} ข้อ`,
    restart: 'เริ่มใหม่',
    vaccinesTitle: 'ตารางวัคซีนลูกแมว',
    vaccinesLede:
      'ตามแนวทาง WSAVA และโรงพยาบาลสัตว์ในไทย ตารางจริงอาจปรับตามสุขภาพและความเสี่ยงของแมวแต่ละตัว ควรให้สัตวแพทย์เป็นผู้กำหนด',
    costsTitle: 'ค่าใช้จ่ายโดยประมาณ',
    firstYearPre: 'ปีแรกประมาณ',
    unit: 'บาท',
    firstYearPost:
      '(ค่าใช้จ่ายครั้งแรก บวกค่าใช้จ่ายรายเดือน 12 เดือน) ไม่รวมค่าลูกแมว ค่ารักษาเมื่อเจ็บป่วย และเงินสำรองฉุกเฉิน',
    monthly: 'รายเดือน',
    monthlyTotal: 'รวมต่อเดือน',
    oneTime: 'ครั้งแรกและรายปี',
    oneTimeTotal: 'รวม',
    item: 'รายการ',
    baht: 'บาท',
    reserveTail: 'แยกไว้สำหรับค่ารักษากะทันหัน',
    groomingNote: 'แมวขนยาวอาจมีค่าอาบน้ำและตัดแต่งขนที่ร้านเพิ่มเติม หากไม่ได้แปรงขนเองเป็นประจำ',
    pricesTitle: 'ราคาลูกแมวแต่ละสายพันธุ์',
    pricesLede:
      'ช่วงราคาที่พบในตลาดไทย ปลายล่างมักเป็นลูกแมวไม่มีใบเพ็ดดีกรี ปลายบนคือลูกแมวเกรดเลี้ยงที่มีเอกสารจากฟาร์มจดทะเบียน ส่วนแมวเกรดประกวดหรือที่ให้สิทธิ์ทำพันธุ์อาจ',
    pricesLedeEnd: 'แพงกว่านี้มาก',
    factors: 'อะไรทำให้ราคาต่างกัน',
    lawTitle: 'กฎหมายที่ควรรู้',
    adoptTitle: 'รับเลี้ยงแทนการซื้อ',
    adoptLede: 'แมวจากมูลนิธิส่วนใหญ่ทำหมันและฉีดวัคซีนแล้ว เป็นทางเลือกที่ดีหากไม่ได้ต้องการสายพันธุ์เฉพาะ',
    newTab: '(เปิดในแท็บใหม่)',
  },
  en: {
    sections: {
      checklist: 'Cattery checklist',
      vaccines: 'Vaccine schedule',
      costs: 'Costs',
      prices: 'Price by breed',
      law: 'The law',
      adopt: 'Adopt instead',
    },
    h1a: 'Kitten',
    h1b: 'buyer’s guide',
    asOf: (d: string) => `Data as of ${d}`,
    toc: 'On this page',
    tocTitle: 'On this page',
    checklistTitle: 'Cattery checklist',
    checklistLede:
      'Ask for and check all of this before you transfer any money; a good cattery will have it ready. You can tick items off while you talk to the cattery.',
    checked: (n: number, of: number) => `Checked ${n} of ${of}`,
    restart: 'Start again',
    vaccinesTitle: 'Kitten vaccine schedule',
    vaccinesLede:
      'Based on WSAVA guidance and Thai animal hospitals. The actual schedule may be adjusted to each cat’s health and risk, so let your vet decide.',
    costsTitle: 'Estimated costs',
    firstYearPre: 'About',
    unit: 'baht',
    firstYearPost:
      'in the first year (one-off costs plus 12 months of monthly costs), not counting the kitten itself, vet bills when your cat is ill, or an emergency fund.',
    monthly: 'Monthly',
    monthlyTotal: 'Total per month',
    oneTime: 'One-off and yearly',
    oneTimeTotal: 'Total',
    item: 'Item',
    baht: 'Baht',
    reserveTail: 'set aside for unexpected vet bills.',
    groomingNote: 'Long-haired cats may need paid baths and grooming as well, if you don’t brush them regularly yourself.',
    pricesTitle: 'Kitten prices by breed',
    pricesLede:
      'Price ranges seen in the Thai market. The low end is usually kittens without pedigree papers; the high end is pet-quality kittens with papers from a registered cattery. Show-quality cats, or cats sold with breeding rights, can cost',
    pricesLedeEnd: 'much more.',
    factors: 'What makes prices differ',
    lawTitle: 'The law to know',
    adoptTitle: 'Adopt instead of buying',
    adoptLede:
      'Most cats from foundations are already neutered and vaccinated: a good choice if you don’t need a particular breed.',
    newTab: '(opens in a new tab)',
  },
}

const SECTION_IDS = ['checklist', 'vaccines', 'costs', 'prices', 'law', 'adopt'] as const

/** Pastel tones cycled through lists so neighbouring cards and bubbles differ. */
const TONES = ['peach', 'mint', 'sky', 'lavender', 'butter', 'rose'] as const
const tone = (i: number, offset = 0) => `tone-${TONES[(i + offset) % TONES.length]}`

const CHECK_KEY = 'maew.checklist'

/** "01", "02"… for the vaccine timeline's steps; always decorative. */
const nn = (i: number) => String(i + 1).padStart(2, '0')

/** Ticks are a per-visitor convenience (e.g. while at a cattery), kept in this browser only. */
function useChecklist(size: number) {
  const [done, setDone] = useState<boolean[]>(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(CHECK_KEY) ?? '[]')
      return Array.from({ length: size }, (_, i) => Boolean(Array.isArray(raw) && raw[i]))
    } catch {
      return Array(size).fill(false)
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(CHECK_KEY, JSON.stringify(done))
    } catch {
      // Not persisted; ticks still work for this visit.
    }
  }, [done])
  const toggle = (i: number) => setDone((d) => d.map((v, j) => (j === i ? !v : v)))
  const reset = () => setDone(Array(size).fill(false))
  return { done, toggle, reset, count: done.filter(Boolean).length }
}

/** Savings set aside, not money spent — kept out of the totals. Found in the Thai data (same order in English). */
const RESERVE_INDEX = thaiMarket.ownershipCost.oneTime.findIndex((c) => /สำรอง/.test(c.item))

const total = (xs: CostItem[]) =>
  xs.reduce((acc, x) => ({ min: acc.min + x.min, max: acc.max + x.max }), { min: 0, max: 0 })

const money = (min: number, max: number) =>
  min === max ? `${formatNumber(min)}` : `${formatNumber(min)}–${formatNumber(max)}`

/**
 * Compounds on this page that read as one word but that the browser's Thai line breaker splits on
 * phones ("ฉีด / วัคซีน", "แพง / กว่า"). "พิษสุนัขบ้า" (rabies) matters most: split, it leaves "บ้า"
 * ("crazy") starting a line. Longer entries come first so they win over the words inside them.
 */
const COMPOUNDS =
  /(พิษสุนัขบ้า|เข็มที่\s\d+|ลายลักษณ์อักษร|ฉีดวัคซีน|ไมโครชิป|เพ็ดดีกรี|จดทะเบียน|รับประกัน|ใบรับรอง|ค่าใช้จ่าย|ค่ารับเลี้ยง|ค่าลูกแมว|ค่ารักษา|ลูกแมว|สายพันธุ์|แพงกว่า|ต่ำกว่า|เจ็บป่วย|ตรวจโรค|เงินสำรอง)/

/**
 * Thai line breaking for the running text below: a number stays on the line with its unit
 * ("3–4 เดือน", "25,000 บาท"), a year with what it dates ("พ.ศ. 2535", "WSAVA 2024"), and the
 * compounds above stay whole. Only no-break spaces and nowrap spans are added, so the text reads
 * and announces exactly the same. English text is left to the browser.
 */
function tie(s: string): ReactNode {
  if (!/[฀-๿]/.test(s)) return s
  const glued = s.replace(/(\d)\s+(?=[ก-๙])/g, '$1\xA0').replace(/([.A-Za-z])\s+(?=\d)/g, '$1\xA0')
  const parts = glued.split(COMPOUNDS)
  return parts.length === 1
    ? glued
    : parts.map((p, i) =>
        i % 2 ? (
          <span key={i} className="nowrap">
            {p}
          </span>
        ) : (
          p
        ),
      )
}

/** "อุปกรณ์เริ่มต้น (กระบะทราย …)" → the name and its bracketed aside. */
function splitAside(s: string): [string, string | null] {
  const m = /^(.*\S)\s+(\([^()]+\))$/.exec(s)
  return m ? [m[1], m[2]] : [s, null]
}

/**
 * A name with its bracketed aside in a span of its own. It reads exactly like the original string;
 * phones use the span to break between the two (or set the aside on a quieter second line) instead
 * of mid-phrase. Wider screens show it inline as before. Asides are short lists ("กระบะทราย ชาม
 * ที่ลับเล็บ กระเป๋า"), so they only break at their spaces, never inside an item.
 */
function WithAside({ text, className }: { text: string; className: string }) {
  const [main, aside] = splitAside(text)
  if (!aside) return text
  return (
    <>
      {main}{' '}
      <span className={className}>
        {aside.split(' ').map((item, i) => (
          <Fragment key={i}>
            {i > 0 && ' '}
            <span className="nowrap">{item}</span>
          </Fragment>
        ))}
      </span>
    </>
  )
}



function CostTable({
  title,
  items,
  totalLabel,
  toneClass,
  head,
}: {
  title: string
  items: CostItem[]
  totalLabel: string
  toneClass: string
  head: { item: string; baht: string }
}) {
  // Tables are labelled by their caption; numbers are right-aligned so they line up.
  const t = total(items)
  return (
    <div className={`cost-panel ${toneClass}`}>
      <table className="cost-table">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">{head.item}</th>
            <th scope="col">{head.baht}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.item}>
              <th scope="row">
                <WithAside text={c.item} className="cost-table__aside" />
              </th>
              <td>{money(c.min, c.max)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">{totalLabel}</th>
            <td>{money(t.min, t.max)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export function GuidePage() {
  const lang = useLang()
  const c = pick(COPY, lang)
  // English pages read the whole guide from the English market data (same order and figures)
  const market = lang === 'en' ? en.market : thaiMarket
  const location = useLocation()
  const checklist = useChecklist(market.buyerChecklist.length)
  const checkTotal = market.buyerChecklist.length

  const spend = market.ownershipCost.oneTime.filter((_, i) => i !== RESERVE_INDEX)
  const reserve = RESERVE_INDEX >= 0 ? market.ownershipCost.oneTime[RESERVE_INDEX] : undefined
  const monthly = total(market.ownershipCost.monthly)
  const oneTime = total(spend)
  const firstYear = { min: oneTime.min + monthly.min * 12, max: oneTime.max + monthly.max * 12 }

  const jump = (id: string, smooth = true) => {
    const el = document.getElementById(id)
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: smooth && !reduce ? 'smooth' : 'auto' })
    el.focus({ preventScroll: true })
  }

  // Links from the home page say which section to open (hash URLs are taken by the router).
  useEffect(() => {
    const section = (location.state as { section?: string } | null)?.section
    if (section) requestAnimationFrame(() => jump(section, false))
  }, [location.key, location.state])

  // "You are here" in the pinned index: the last section whose top has passed into the band
  // between the floating bar and the upper half of the viewport.
  const [current, setCurrent] = useState<string | null>(null)
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const visible = new Set<string>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id)
          else visible.delete(e.target.id)
        }
        const last = SECTION_IDS.filter((s) => visible.has(s)).pop()
        setCurrent(last ?? null)
      },
      { rootMargin: '-137px 0px -55% 0px' },
    )
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    }
    return () => io.disconnect()
  }, [])

  return (
    <>
      <header className="guide-head">
        <div className="container guide-head__inner">
          <div>
            <h1>
              {c.h1a}
              <br />
              <span className="tint">{c.h1b}</span>
            </h1>
          </div>
          <div className="guide-head__aside">
            {lang === 'en' ? (
              <p className="guide-head__lede">
                What a good cattery should give you, the vaccines due at each age, the likely costs in Thailand and the
                law cat owners should know. It applies to every breed.
              </p>
            ) : (
              <p className="guide-head__lede">
                สิ่งที่ควรได้รับจากฟาร์ม วัคซีนตาม<span className="nowrap">ช่วงอายุ</span>{' '}
                <span className="nowrap">ค่าใช้จ่าย</span>โดยประมาณในไทย และกฎหมายที่เจ้าของแมวต้องรู้
                ใช้ได้กับทุก<span className="nowrap">สายพันธุ์</span>
              </p>
            )}
            <p className="guide-head__meta">{c.asOf(month(market.asOf, lang))}</p>
          </div>
        </div>
      </header>

      {/* In-page index: a floating pill bar that stays under the site header while reading */}
      <nav className="toc" aria-label={c.toc}>
        <div className="container">
          <div className="toc__pill">
            <p className="toc__title">{c.tocTitle}</p>
            <ul>
              {SECTION_IDS.map((id) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => jump(id)}
                    aria-current={current === id ? 'location' : undefined}
                  >
                    {c.sections[id]}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      <section
        id="checklist"
        tabIndex={-1}
        aria-labelledby="checklist-title"
        className="guide-sec guide-sec--sheet section section--band"
      >
        <div className="container">
          <div className="section-head">
            <div>
              <h2 id="checklist-title">{c.checklistTitle}</h2>
            </div>
            <p>{tie(c.checklistLede)}</p>
          </div>

          <div className="checklist__bar">
            <div className="checklist__progress">
              <p aria-live="polite">{c.checked(checklist.count, checkTotal)}</p>
              <span className="checklist__meter" aria-hidden="true">
                <span style={{ width: `${(checklist.count / checkTotal) * 100}%` }} />
              </span>
            </div>
            {checklist.count > 0 && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  checklist.reset()
                  focusSoon('.checklist input')
                }}
              >
                <RotateCcw size={14} aria-hidden />
                <span className="checklist__reset-label">{c.restart}</span>
              </button>
            )}
          </div>
          <ul className="checklist">
            {market.buyerChecklist.map((item, i) => (
              <li key={item.title}>
                <label>
                  <input
                    type="checkbox"
                    checked={checklist.done[i]}
                    onChange={() => checklist.toggle(i)}
                    aria-describedby={`check-${i}-detail`}
                  />
                  <span className="checklist__title">{tie(item.title)}</span>
                </label>
                <p id={`check-${i}-detail`}>{tie(item.detail)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="vaccines" tabIndex={-1} aria-labelledby="vaccines-title" className="guide-sec section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2 id="vaccines-title">{c.vaccinesTitle}</h2>
            </div>
            <p>{tie(c.vaccinesLede)}</p>
          </div>
          <ol className="vax">
            {market.vaccineSchedule.map((v, i) => (
              <li key={v.age} className={tone(i)}>
                <span className="vax__step" aria-hidden="true">
                  {nn(i)}
                </span>
                <div className="vax__card">
                  {/* One span: the pill is a grid, which would stack loose text and the aside */}
                  <p className="vax__age">
                    <span>
                      <WithAside text={v.age} className="vax__age-aside" />
                    </span>
                  </p>
                  <div className="vax__body">
                    <p className="vax__what">{tie(v.vaccines)}</p>
                    {v.note && <p className="vax__note">{tie(v.note)}</p>}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        id="costs"
        tabIndex={-1}
        aria-labelledby="costs-title"
        className="guide-sec guide-sec--sheet section section--band"
      >
        <div className="container">
          <div className="section-head">
            <div>
              <h2 id="costs-title">{c.costsTitle}</h2>
            </div>
            <p className="costs__intro">
              {c.firstYearPre}{' '}
              <strong>
                <span className="nowrap">
                  {money(firstYear.min, firstYear.max)} {c.unit}
                </span>
              </strong>{' '}
              {tie(c.firstYearPost)}
            </p>
          </div>
          <div className="cost-grid">
            <CostTable
              title={c.monthly}
              items={market.ownershipCost.monthly}
              totalLabel={c.monthlyTotal}
              toneClass="tone-peach"
              head={{ item: c.item, baht: c.baht }}
            />
            <CostTable
              title={c.oneTime}
              items={spend}
              totalLabel={c.oneTimeTotal}
              toneClass="tone-butter"
              head={{ item: c.item, baht: c.baht }}
            />
          </div>
          <div className="costs__notes">
            {reserve && (
              <div className="costs__reserve tone-mint">
                <span className="costs__reserve-icon" aria-hidden="true">
                  <PiggyBank size={22} />
                </span>
                {lang === 'en' ? (
                  <p>
                    Keep an emergency fund of{' '}
                    <strong>
                      <span className="nowrap">{money(reserve.min, reserve.max)} baht</span>
                    </strong>{' '}
                    {c.reserveTail}
                  </p>
                ) : (
                  <p>
                    ควรมี{reserve.item.replace(/ที่แนะนำ$/, '')}{' '}
                    <strong>
                      <span className="nowrap">{money(reserve.min, reserve.max)} บาท</span>
                    </strong>{' '}
                    {/* One phrase in one span: it is kept whole where it fits (see the CSS), since
                        "ค่ารักษา" would otherwise split */}
                    <span className="costs__reserve-tail">{c.reserveTail}</span>
                  </p>
                )}
              </div>
            )}
            <p className="costs__foot">{c.groomingNote}</p>
          </div>
        </div>
      </section>

      <section id="prices" tabIndex={-1} aria-labelledby="prices-title" className="guide-sec section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2 id="prices-title">{c.pricesTitle}</h2>
            </div>
            <p>
              {tie(c.pricesLede)}
              {lang === 'en' ? ' ' : ''}
              {/* The closing phrase stays whole, never leaving "นี้มาก" alone on the last line */}
              <span className="nowrap">{c.pricesLedeEnd}</span>
            </p>
          </div>
          <PriceRangeChart breeds={breeds} />
          <div className="factors">
            <h3 className="factors__title">{c.factors}</h3>
            <ul className="factors__list">
              {market.priceFactors.map((f) => (
                <li key={f}>
                  <p>{tie(f)}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section
        id="law"
        tabIndex={-1}
        aria-labelledby="law-title"
        className="guide-sec guide-sec--sheet section section--band"
      >
        <div className="container">
          <div className="section-head">
            <div>
              <h2 id="law-title">{c.lawTitle}</h2>
            </div>
          </div>
          <ul className="law-list">
            {market.legalNotes.map((n) => (
              <li key={n}>
                <p>{tie(n)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Last section runs straight into the footer (Layout drops main's bottom padding for .guide-band) */}
      <section id="adopt" tabIndex={-1} aria-labelledby="adopt-title" className="guide-sec section guide-band">
        <div className="container">
          <div className="section-head">
            <div>
              <h2 id="adopt-title">{c.adoptTitle}</h2>
            </div>
            <p>{tie(c.adoptLede)}</p>
          </div>
          <ul className="adopt-list">
            {market.adoption.map((a, i) => {
              // Bilingual names: each half gets its own language, and phones set the bracketed
              // half on its own line rather than breaking inside it
              const [name, aside] = splitAside(a.name)
              return (
                <li key={a.url} className={tone(i, 3)}>
                  <span className="adopt-list__badge" aria-hidden="true">
                    <HandHeart size={22} />
                  </span>
                  <a href={a.url} target="_blank" rel="noreferrer">
                    <span lang={textLang(name, lang)}>{name}</span>
                    {aside && (
                      <>
                        {' '}
                        <span className="adopt-list__aside" lang={textLang(aside, lang)}>
                          {aside}
                        </span>
                      </>
                    )}
                    <span className="visually-hidden">{c.newTab}</span>
                  </a>
                  <p>{tie(a.detail)}</p>
                  <span className="adopt-list__arrow" aria-hidden="true">
                    <ArrowUpRight size={18} />
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      </section>
    </>
  )
}

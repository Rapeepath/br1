import { Link } from 'react-router'
import { useLang } from '../i18n'
import { localized } from '../i18n/content'
import { formatNumber } from '../lib/format'
import { labels, pick, price as formatPrice } from '../lib/locale'
import type { Breed } from '../lib/types'
import './PriceRangeChart.css'

const TICK_STEP = 25_000

const COPY = {
  th: {
    range: 'ช่วงราคาต่ำสุด–สูงสุด',
    confidence: 'ความเชื่อมั่นของข้อมูล',
    k: 'k = พันบาท',
    sort: 'เรียงจากราคากลางต่ำไปสูง',
    caption: 'ช่วงราคาลูกแมวโดยประมาณในไทย เรียงจากราคากลางต่ำไปสูง',
    breed: 'สายพันธุ์',
    axis: 'ช่วงราคาบนแกนเดียวกัน',
    price: 'ช่วงราคา (บาท)',
    unit: ' บาท',
  },
  en: {
    range: 'Lowest–highest price',
    confidence: 'Data confidence',
    k: 'k = thousand baht',
    sort: 'Sorted by mid-price, low to high',
    caption: 'Approximate kitten prices in Thailand, sorted by mid-price from low to high',
    breed: 'Breed',
    axis: 'Price range on a shared axis',
    price: 'Price range (baht)',
    unit: ' baht',
  },
}

/**
 * Floating range bars (min–max THB) on one shared linear axis.
 * Built as a real table so every value is readable without hovering;
 * the bar column is a visual aid on top of the numbers.
 */
export function PriceRangeChart({ breeds }: { breeds: Breed[] }) {
  const lang = useLang()
  const c = pick(COPY, lang)
  const L = labels(lang)
  const rows = breeds
    .filter((b) => b.price?.min != null && b.price?.max != null)
    .sort((a, b) => a.price!.min! + a.price!.max! - (b.price!.min! + b.price!.max!))
    .map((b) => localized(b, lang))

  const top = Math.max(...rows.map((b) => b.price!.max!))
  const axisMax = Math.ceil(top / TICK_STEP) * TICK_STEP
  const ticks = Array.from({ length: axisMax / TICK_STEP + 1 }, (_, i) => i * TICK_STEP)
  const pct = (v: number) => `${(v / axisMax) * 100}%`
  const tickLabel = (t: number) => (t === 0 ? '0' : `${formatNumber(t / 1000)}k`)
  const nameOf = (b: Breed) => (lang === 'en' ? b.nameEn : b.nameTh)

  return (
    <div className="prc">
      {/* Key to the drawing; the table itself carries every value for screen readers */}
      <div className="prc__legend" aria-hidden="true">
        <span className="prc__key">
          <span className="prc__swatch" />
          {c.range}
        </span>
        <span className="prc__key">
          <span className="prc__badge prc__badge--high" />
          {c.confidence}
        </span>
        <span className="prc__key">{c.k}</span>
        <span className="prc__key prc__key--sort">{c.sort}</span>
      </div>

      {/* Phones hide the table head, so the axis is repeated once above the rows */}
      <div className="prc__scale" aria-hidden="true">
        {ticks.map((t) => (
          <span key={t} style={{ left: pct(t) }}>
            {tickLabel(t)}
          </span>
        ))}
      </div>

      <div className="prc__scroll">
        <table className="prc__table">
          <caption className="visually-hidden">{c.caption}</caption>
          <thead>
            <tr>
              <th scope="col">{c.breed}</th>
              <th scope="col" className="prc__axis-head">
                <span className="visually-hidden">{c.axis}</span>
                <div className="prc__ticks" aria-hidden="true">
                  {ticks.map((t) => (
                    <span key={t} style={{ left: pct(t) }}>
                      {tickLabel(t)}
                    </span>
                  ))}
                </div>
              </th>
              <th scope="col" className="prc__num">
                {c.price}
              </th>
              <th scope="col" className="prc__conf">
                {c.confidence}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => {
              const { min, max, confidence } = b.price!
              const text = formatPrice(min, max, lang)
              return (
                <tr key={b.id}>
                  <th scope="row">
                    <Link to={`/breeds/${b.id}`}>{nameOf(b)}</Link>
                  </th>
                  <td className="prc__track">
                    <div className="prc__plot" aria-hidden="true">
                      <span
                        className="prc__bar"
                        style={{ left: pct(min!), width: `max(8px, ${pct(max! - min!)})` }}
                        title={`${nameOf(b)} ${text}`}
                      />
                    </div>
                  </td>
                  <td className="prc__num">{text?.replace(c.unit, '')}</td>
                  <td className="prc__conf">
                    <span className={`prc__badge prc__badge--${confidence}`}>{L.confidenceShort[confidence]}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

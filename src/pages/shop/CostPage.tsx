import { useId, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { CreditCard, PiggyBank, Table2, BarChart3 } from 'lucide-react'
import { getBreed, market } from '../../data'
import { useLang, type Lang } from '../../i18n'
import { localized, localizedMarket } from '../../i18n/content'
import { ShopHead } from '../../components/shop/ShopHead'
import { useLiveCatalog } from '../../lib/live'
import { costTotals, INSTALMENT_MONTHS, instalments, isReserve, midpoint, money, moneyRange, sliderStep, type CostItem } from '../../lib/shop'
import { formatMonthTh } from '../../lib/format'
import './shop-pages.css'
import './cost.css'

const COPY = {
  th: {
    title: 'คำนวณค่าเลี้ยงแมว',
    tint: 'และการผ่อนชำระ',
    lede: (d: string) => `ปรับแต่ละรายการให้ตรงกับการเลี้ยงของคุณ ค่าเริ่มต้นเป็นค่ากลางของช่วงราคาในไทย ข้อมูล ณ ${d} ตัวเลขทั้งหมดเป็นการประมาณ`,
    kittenTitle: 'ค่าตัวลูกแมว',
    pick: 'เลือกจากราคาที่ร้าน',
    pickNone: 'ใส่ราคาเอง',
    price: 'ราคาลูกแมว (บาท)',
    priceHint: 'ราคารวม VAT แล้ว',
    instTitle: 'ผ่อนบัตร 0%',
    instLede: 'สำหรับบัตรเครดิตของธนาคารที่ร่วมรายการ ไม่มีดอกเบี้ยและค่าธรรมเนียม',
    months: (n: number) => `${n} เดือน`,
    perMonth: 'ต่อเดือน',
    lastMonth: (v: string) => `เดือนสุดท้าย ${v}`,
    monthlyTitle: 'ค่าใช้จ่ายรายเดือน',
    oneTitle: 'ค่าใช้จ่ายครั้งแรก',
    reserveTitle: 'เงินสำรองที่ควรมี',
    reserveBody: 'ไม่ใช่ค่าใช้จ่าย แต่ควรกันไว้สำหรับเหตุฉุกเฉิน ไม่ได้รวมในยอดด้านล่าง',
    range: (r: string) => `ช่วงในไทย ${r}`,
    sumTitle: 'สรุปค่าใช้จ่าย',
    sumMonthly: 'รายเดือน',
    sumYearly: 'ค่าเลี้ยงต่อปี',
    sumOne: 'ครั้งแรก',
    sumFirst: 'ปีแรก (ไม่รวมตัวลูกแมว)',
    sumWithKitten: 'ปีแรก รวมค่าตัวลูกแมว',
    chartTitle: 'ค่าใช้จ่ายปีแรกแยกตามรายการ',
    asChart: 'ดูเป็นกราฟ',
    asTable: 'ดูเป็นตาราง',
    item: 'รายการ',
    amount: 'ปีแรก',
    kitten: 'ค่าตัวลูกแมว',
    note: 'ตัวเลขเป็นการประมาณเพื่อวางแผน ค่าใช้จ่ายจริงขึ้นกับสุขภาพ ยี่ห้ออาหาร และคลินิกที่ใช้',
    guide: 'ดูที่มาของตัวเลขในคู่มือก่อนซื้อ',
    kittens: 'ดูลูกแมวพร้อมรับ',
  },
  en: {
    title: 'Cost of keeping a cat',
    tint: 'and paying in instalments',
    lede: (d: string) => `Adjust each item to how you’ll keep your cat. Starting values are the middle of Thai price ranges as of ${d}. Every figure is an estimate.`,
    kittenTitle: 'The kitten',
    pick: 'Choose a shop price',
    pickNone: 'Enter a price',
    price: 'Kitten price (THB)',
    priceHint: 'VAT included',
    instTitle: '0% card instalments',
    instLede: 'With credit cards from participating banks; no interest or fees.',
    months: (n: number) => `${n} months`,
    perMonth: 'a month',
    lastMonth: (v: string) => `last month ${v}`,
    monthlyTitle: 'Monthly costs',
    oneTitle: 'One-off costs',
    reserveTitle: 'Money to keep aside',
    reserveBody: 'Not a cost, but worth setting aside for emergencies. It isn’t included in the totals below.',
    range: (r: string) => `Thai range ${r}`,
    sumTitle: 'Your estimate',
    sumMonthly: 'Monthly',
    sumYearly: 'Running cost a year',
    sumOne: 'One-off',
    sumFirst: 'First year (kitten not included)',
    sumWithKitten: 'First year, including the kitten',
    chartTitle: 'First-year cost by item',
    asChart: 'Show as chart',
    asTable: 'Show as table',
    item: 'Item',
    amount: 'First year',
    kitten: 'The kitten',
    note: 'Estimates for planning. Real costs depend on health, food brands and the clinic you use.',
    guide: 'Where the figures come from (buyer’s guide)',
    kittens: 'See kittens ready for a home',
  },
}

const monthEn = (yyyyMm: string) =>
  new Date(`${yyyyMm}-01T00:00:00Z`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })

function Slider({ id, item, value, onChange, lang, suffix }: { id: string; item: CostItem; value: number; onChange: (v: number) => void; lang: Lang; suffix: string }) {
  const c = COPY[lang]
  return (
    <div className="cost-slider">
      <div className="cost-slider__top">
        <label htmlFor={id}>{item.item}</label>
        <output htmlFor={id} className="cost-slider__value">
          {money(value, lang)}
          {suffix}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={item.min}
        max={item.max}
        step={sliderStep(item)}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={`${money(value, lang)}${suffix}`}
        aria-describedby={`${id}-range`}
      />
      <p id={`${id}-range`} className="cost-slider__range">
        {c.range(moneyRange(item.min, item.max, lang))}
      </p>
    </div>
  )
}

export function CostPage() {
  const lang = useLang()
  const c = COPY[lang]
  const base = useId().replace(/:/g, '')
  const m = localizedMarket(market, lang)
  const [params] = useSearchParams()
  const live = useLiveCatalog()
  const kittenSkus = (live.items ?? []).filter((i) => i.categoryId === 'kitten')
  const initialPrice = Number(params.get('price')) > 0 ? Math.round(Number(params.get('price'))) : 15000

  const monthlyItems = m.ownershipCost.monthly
  const allOneTime = m.ownershipCost.oneTime
  const oneTimeItems = allOneTime.filter((i) => !isReserve(market.ownershipCost.oneTime[allOneTime.indexOf(i)] ?? i))
  const reserve = allOneTime.find((i) => isReserve(market.ownershipCost.oneTime[allOneTime.indexOf(i)] ?? i))

  const [price, setPrice] = useState(initialPrice)
  const [sku, setSku] = useState('')
  const [monthly, setMonthly] = useState(() => monthlyItems.map((i) => midpoint(i, 10)))
  const [oneTime, setOneTime] = useState(() => oneTimeItems.map((i) => midpoint(i, 100)))
  const [view, setView] = useState<'chart' | 'table'>('chart')
  const totals = costTotals(monthly, oneTime, price)

  const rows = useMemo(
    () =>
      [
        { item: c.kitten, value: price },
        ...oneTimeItems.map((i, k) => ({ item: i.item, value: oneTime[k] })),
        ...monthlyItems.map((i, k) => ({ item: i.item, value: monthly[k] * 12 })),
      ].filter((r) => r.value > 0),
    [c.kitten, price, oneTime, monthly, oneTimeItems, monthlyItems],
  )
  const max = Math.max(1, ...rows.map((r) => r.value))

  const skuLabel = (s: (typeof kittenSkus)[number]) => {
    if (lang === 'th') return s.name
    const breed = s.refId ? getBreed(s.refId) : undefined
    const grade = s.variant === 'เกรดประกวด' ? 'show quality' : 'pet quality'
    return breed ? `${localized(breed, 'en').nameEn} kitten, ${grade}` : s.name
  }

  return (
    <>
      <ShopHead title={c.title} tint={c.tint} lede={c.lede(lang === 'en' ? monthEn(market.asOf) : formatMonthTh(market.asOf))} />
      <section className="shop-band">
        <div className="container cost-layout">
          <div className="shop-stack">
            <section className="shop-sheet" aria-labelledby={`${base}-kitten`}>
              <h2 id={`${base}-kitten`}>{c.kittenTitle}</h2>
              <div className="form-grid cost-kitten">
                {kittenSkus.length > 0 && (
                  <div className="field">
                    <label className="field__label" htmlFor={`${base}-sku`}>
                      {c.pick}
                    </label>
                    <select
                      id={`${base}-sku`}
                      className="input input--select"
                      value={sku}
                      onChange={(e) => {
                        setSku(e.target.value)
                        const found = kittenSkus.find((s) => s.id === e.target.value)
                        if (found) setPrice(found.price)
                      }}
                    >
                      <option value="">{c.pickNone}</option>
                      {kittenSkus.map((s) => (
                        <option key={s.id} value={s.id}>
                          {skuLabel(s)} ({money(s.price, lang)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="field">
                  <label className="field__label" htmlFor={`${base}-price`}>
                    {c.price}
                  </label>
                  <p id={`${base}-price-hint`} className="field__hint">
                    {c.priceHint}
                  </p>
                  <input
                    id={`${base}-price`}
                    className="input"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={500}
                    value={price}
                    aria-describedby={`${base}-price-hint`}
                    onChange={(e) => {
                      setSku('')
                      setPrice(Math.max(0, Math.round(Number(e.target.value) || 0)))
                    }}
                  />
                </div>
              </div>

              <h3 className="cost-sub">
                <CreditCard size={18} aria-hidden />
                {c.instTitle}
              </h3>
              <p className="cost-sub__lede">{c.instLede}</p>
              <ul className="cost-inst">
                {INSTALMENT_MONTHS.map((n) => {
                  const p = instalments(price, n)
                  return (
                    <li key={n}>
                      <p className="cost-inst__months">{c.months(n)}</p>
                      <p className="cost-inst__amount">{money(p.monthly, lang)}</p>
                      <p className="cost-inst__per">
                        {c.perMonth}
                        {p.last !== p.monthly && price > 0 && <span> {c.lastMonth(money(p.last, lang))}</span>}
                      </p>
                    </li>
                  )
                })}
              </ul>
            </section>

            <section className="shop-sheet" aria-labelledby={`${base}-monthly`}>
              <h2 id={`${base}-monthly`}>{c.monthlyTitle}</h2>
              <div className="cost-sliders">
                {monthlyItems.map((i, k) => (
                  <Slider
                    key={i.item}
                    id={`${base}-m${k}`}
                    item={i}
                    value={monthly[k]}
                    lang={lang}
                    suffix={lang === 'th' ? '/เดือน' : '/month'}
                    onChange={(v) => setMonthly((xs) => xs.map((x, j) => (j === k ? v : x)))}
                  />
                ))}
              </div>
            </section>

            <section className="shop-sheet" aria-labelledby={`${base}-once`}>
              <h2 id={`${base}-once`}>{c.oneTitle}</h2>
              <div className="cost-sliders">
                {oneTimeItems.map((i, k) => (
                  <Slider
                    key={i.item}
                    id={`${base}-o${k}`}
                    item={i}
                    value={oneTime[k]}
                    lang={lang}
                    suffix=""
                    onChange={(v) => setOneTime((xs) => xs.map((x, j) => (j === k ? v : x)))}
                  />
                ))}
              </div>
              {reserve && (
                <div className="cost-reserve">
                  <PiggyBank size={22} aria-hidden />
                  <div>
                    <p className="cost-reserve__title">
                      {c.reserveTitle}: {moneyRange(reserve.min, reserve.max, lang)}
                    </p>
                    <p>{c.reserveBody}</p>
                  </div>
                </div>
              )}
            </section>
          </div>

          <aside className="cost-summary" aria-labelledby={`${base}-sum`}>
            <div className="shop-sheet">
              <h2 id={`${base}-sum`}>{c.sumTitle}</h2>
              <dl className="cost-totals" aria-live="polite">
                <div>
                  <dt>{c.sumMonthly}</dt>
                  <dd>{money(totals.monthly, lang)}</dd>
                </div>
                <div>
                  <dt>{c.sumYearly}</dt>
                  <dd>{money(totals.yearlyRunning, lang)}</dd>
                </div>
                <div>
                  <dt>{c.sumOne}</dt>
                  <dd>{money(totals.oneTime, lang)}</dd>
                </div>
                <div className="cost-totals__big">
                  <dt>{c.sumFirst}</dt>
                  <dd>{money(totals.firstYear, lang)}</dd>
                </div>
                <div className="cost-totals__big cost-totals__all">
                  <dt>{c.sumWithKitten}</dt>
                  <dd>{money(totals.firstYearWithKitten, lang)}</dd>
                </div>
              </dl>

              <div className="cost-chart-head">
                <h3>{c.chartTitle}</h3>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setView(view === 'chart' ? 'table' : 'chart')} aria-pressed={view === 'table'}>
                  {view === 'chart' ? <Table2 size={16} aria-hidden /> : <BarChart3 size={16} aria-hidden />}
                  {view === 'chart' ? c.asTable : c.asChart}
                </button>
              </div>
              {view === 'chart' ? (
                <ul className="cost-bars" aria-label={c.chartTitle}>
                  {rows.map((r) => (
                    <li key={r.item}>
                      <span className="cost-bars__label">{r.item}</span>
                      <span className="cost-bars__track" aria-hidden="true">
                        <span className="cost-bars__bar" style={{ width: `${(r.value / max) * 100}%` }} />
                      </span>
                      <span className="cost-bars__value">{money(r.value, lang)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <table className="cost-table">
                  <caption className="visually-hidden">{c.chartTitle}</caption>
                  <thead>
                    <tr>
                      <th scope="col">{c.item}</th>
                      <th scope="col">{c.amount}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.item}>
                        <th scope="row">{r.item}</th>
                        <td>{money(r.value, lang)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <p className="cost-note">{c.note}</p>
              <div className="btn-row">
                <Link to="/kittens" className="btn btn-primary btn-sm">
                  {c.kittens}
                </Link>
                <Link to="/guide" className="link-arrow">
                  {c.guide}
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}

import { useId, useState } from 'react'
import { Link } from 'react-router'
import { Download } from 'lucide-react'
import { BarList, ColumnChart } from '../charts'
import { download, useApi, type SalesReport } from '../api'
import { useSession, useToast } from '../context'
import { PAYMENT_LABEL, addDays, baht, bkkDay, dayLabel, num, percent } from '../format'
import { ErrorNote, Loading, Money, PageHead, Segmented, Stat, TableWrap, Words } from '../ui'

type Preset = '7' | '30' | '60' | 'custom'

export function Reports() {
  const { meta } = useSession()
  const toast = useToast()
  const today = bkkDay()
  const [preset, setPreset] = useState<Preset>('30')
  const [from, setFrom] = useState(addDays(today, -29))
  const [to, setTo] = useState(today)
  const [exporting, setExporting] = useState(false)
  const range = preset === 'custom' ? { from, to } : { from: addDays(today, -(Number(preset) - 1)), to: today }
  const { data, error, loading, reload } = useApi<SalesReport>(`/reports/sales?from=${range.from}&to=${range.to}`)
  const fId = useId()
  const tId = useId()
  const catLabel = (id: string) => meta.categories.find((c) => c.id === id)?.label ?? id

  const exportCsv = async () => {
    setExporting(true)
    try {
      await download(`/export/orders.csv?from=${range.from}&to=${range.to}`, `orders-${range.from}-to-${range.to}.csv`)
      toast('ดาวน์โหลดไฟล์ CSV แล้ว เปิดด้วย Excel หรือ Google Sheets ได้')
    } catch (err) {
      toast((err as Error).message, 'error')
    } finally {
      setExporting(false)
    }
  }

  return (
    <section className="page">
      <PageHead
        title="รายงานยอดขาย"
        lead="สรุปยอดขาย กำไร และสัดส่วนตามสินค้า หมวด ช่องทางชำระ พนักงาน และช่วงเวลา"
        actions={
          <button type="button" className="btn btn-ghost btn-sm" onClick={exportCsv} disabled={exporting}>
            <Download size={16} aria-hidden /> ส่งออกบิลเป็น CSV
          </button>
        }
      />
      <div className="filters" role="search" aria-label="ช่วงวันที่ของรายงาน">
        <Segmented
          label="ช่วงวันที่"
          value={preset}
          onChange={setPreset}
          options={[
            { value: '7', label: '7 วัน' },
            { value: '30', label: '30 วัน' },
            { value: '60', label: '60 วัน' },
            { value: 'custom', label: 'กำหนดเอง' },
          ]}
        />
        {preset === 'custom' && (
          <div className="filters__dates">
            <div className="mini-field">
              <label htmlFor={fId}>ตั้งแต่</label>
              <input id={fId} className="input input--sm" type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="mini-field">
              <label htmlFor={tId}>ถึง</label>
              <input id={tId} className="input input--sm" type="date" value={to} min={from} max={today} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
        )}
      </div>
      {error && <ErrorNote message={error} onRetry={reload} />}
      {!data && !error && <Loading />}
      {data && (
        <div className={`page-body ${loading ? 'is-reloading' : ''}`}>
          <p className="result-line">
            {dayLabel(data.from, 'long')} ถึง {dayLabel(data.to, 'long')}
          </p>
          <div className="stats stats--4">
            <Stat label="ยอดขายสุทธิ" value={<Money value={data.summary.revenue} />} note="รวม VAT ไม่รวมบิลที่คืนเงิน" />
            <Stat label="จำนวนบิล" value={`${num(data.summary.orders)} บิล`} note={`${num(data.summary.items)} ชิ้น`} />
            <Stat label="เฉลี่ยต่อบิล" value={<Money value={data.summary.avgTicket} />} />
            <Stat label="ส่วนลดที่ให้" value={<Money value={data.summary.discounts} />} />
            <Stat label="VAT ในยอดขาย" value={<Money value={data.summary.vat} />} note={`อัตรา ${meta.settings.vatRate}%`} />
            <Stat label="ต้นทุนสินค้า" value={<Money value={data.summary.cost} />} />
            <Stat
              label="กำไรขั้นต้น"
              value={<Money value={data.summary.grossProfit} />}
              note={data.summary.revenue ? `${percent((data.summary.grossProfit / (data.summary.revenue - data.summary.vat)) * 100)} ของยอดก่อน VAT` : undefined}
            />
            <Stat label="คืนเงิน" value={`${num(data.summary.refunds)} บิล`} note={`${baht(data.summary.refundAmount)} บาท`} />
          </div>

          <div className="panel chart-panel">
            <ColumnChart
              title="ยอดขายรายวัน (บาท)"
              valueLabel="ยอดขาย (บาท)"
              extraLabel="จำนวนบิล"
              format={(n) => `${baht(n)} บาท`}
              points={data.byDay.map((p) => ({ key: p.day, tick: dayLabel(p.day), label: dayLabel(p.day, 'long'), value: p.revenue, extra: `${num(p.orders)} บิล` }))}
            />
          </div>

          <div className="grid-2 grid-2--wide-left">
            <div className="panel chart-panel">
              <ColumnChart
                title="ยอดขายตามช่วงเวลาของวัน (บาท)"
                valueLabel="ยอดขาย (บาท)"
                extraLabel="จำนวนบิล"
                format={(n) => `${baht(n)} บาท`}
                points={data.byHour
                  .filter((h) => h.hour >= 8 && h.hour <= 21)
                  .map((h) => ({ key: String(h.hour), tick: `${h.hour}`, label: `${h.hour}:00–${h.hour}:59 น.`, value: h.revenue, extra: `${num(h.orders)} บิล` }))}
                tickEvery={1}
              />
            </div>
            <div className="panel pad">
              <BarList
                title="ตามช่องทางชำระ"
                rows={[...data.byPayment]
                  .sort((a, b) => b.revenue - a.revenue)
                  .map((p) => ({ key: p.method, label: PAYMENT_LABEL[p.method], value: p.revenue, display: `${baht(p.revenue)} บาท`, sub: `${num(p.orders)} บิล` }))}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="panel pad">
              <BarList
                title="ตามหมวดสินค้า"
                rows={[...data.byCategory]
                  .sort((a, b) => b.revenue - a.revenue)
                  .map((c) => ({ key: c.categoryId, label: catLabel(c.categoryId), value: c.revenue, display: `${baht(c.revenue)} บาท`, sub: `${num(c.qty)} ชิ้น` }))}
              />
            </div>
            <div className="panel pad">
              <BarList
                title="ตามพนักงานขาย"
                rows={[...data.byStaff]
                  .sort((a, b) => b.revenue - a.revenue)
                  .map((s) => ({ key: s.staffId, label: s.name, value: s.revenue, display: `${baht(s.revenue)} บาท`, sub: `${num(s.orders)} บิล` }))}
              />
            </div>
          </div>

          <section className="block" aria-labelledby="by-product">
            <h2 id="by-product" className="h3">
              ยอดขายรายสินค้า ({num(data.byProduct.length)} รายการ)
            </h2>
            <TableWrap label="ยอดขายรายสินค้า">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">สินค้า</th>
                    <th scope="col">หมวด</th>
                    <th scope="col" className="num">
                      จำนวน
                    </th>
                    <th scope="col" className="num">
                      ยอดขาย (บาท)
                    </th>
                    <th scope="col" className="num">
                      ต้นทุน (บาท)
                    </th>
                    <th scope="col" className="num">
                      กำไรขั้นต้น (บาท)
                    </th>
                    <th scope="col" className="num">
                      อัตรากำไร
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.byProduct.map((r) => {
                    const net = r.revenue - (r.revenue * meta.settings.vatRate) / (100 + meta.settings.vatRate)
                    return (
                      <tr key={r.productId}>
                        <td>
                          <Link to={`/products/${r.productId}`}>
                            <Words text={r.name} />
                          </Link>
                          <span className="cell-sub">{r.sku}</span>
                        </td>
                        <td>{catLabel(r.categoryId)}</td>
                        <td className="num">{num(r.qty)}</td>
                        <td className="num">{baht(r.revenue)}</td>
                        <td className="num">{baht(r.cost)}</td>
                        <td className="num">{baht(r.profit)}</td>
                        <td className="num">{net > 0 ? percent((r.profit / net) * 100) : '–'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </TableWrap>
          </section>
        </div>
      )}
    </section>
  )
}

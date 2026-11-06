import { Link } from 'react-router'
import { ArrowDownRight, ArrowUpRight, RefreshCw } from 'lucide-react'
import { BarList, ColumnChart } from '../charts'
import { useApi, type Dashboard as DashboardData, type ShiftView } from '../api'
import { PAYMENT_LABEL, STATUS_LABEL, baht, bahtText, change, dateTime, dayLabel, num, percent, shortDateTime, timeOnly } from '../format'
import { Badge, Empty, ErrorNote, Loading, Money, PageHead, Stat, TableWrap, Words } from '../ui'
import '../crm.css'

function Delta({ now, before, label }: { now: number; before: number; label: string }) {
  const c = change(now, before)
  if (!c) return <span className="delta delta--flat">{before === 0 && now > 0 ? `${label}ยังไม่มียอด` : `ยังไม่มียอดให้เทียบกับ${label}`}</span>
  const Icon = c.dir === 'down' ? ArrowDownRight : ArrowUpRight
  const word = c.dir === 'flat' ? 'เท่ากับ' : c.dir === 'up' ? 'สูงกว่า' : 'ต่ำกว่า'
  return (
    <span className={`delta delta--${c.dir}`}>
      {c.dir !== 'flat' && <Icon size={16} aria-hidden />}
      {word}
      {label}
      {c.dir !== 'flat' && ` ${percent(Math.abs(c.pct))}`}
    </span>
  )
}

export function Dashboard() {
  const { data, error, loading, reload } = useApi<DashboardData>('/dashboard')

  return (
    <section className="page">
      <PageHead
        title="ภาพรวมร้าน"
        lead={data ? `ข้อมูล ณ ${dateTime(data.now)}` : 'ยอดขายวันนี้ สต็อก และกะที่เปิดอยู่'}
        actions={
          <button type="button" className="btn btn-ghost btn-sm" onClick={reload} disabled={loading}>
            <RefreshCw size={16} aria-hidden /> โหลดข้อมูลล่าสุด
          </button>
        }
      />
      {error && <ErrorNote message={error} onRetry={reload} />}
      {!data && !error && <Loading />}
      {data && <DashboardBody d={data} />}
    </section>
  )
}

function DashboardBody({ d }: { d: DashboardData }) {
  const t = d.today
  const y = d.yesterdaySoFar
  const shift = d.shift as ShiftView | null
  const catLabel = (id: string) => d.byCategory.find((c) => c.categoryId === id)?.label ?? id

  return (
    <>
      <div className="today">
        <div className="today__hero">
          <p className="today__label">ยอดขายวันนี้</p>
          <p className="hero-figure">
            {baht(t.revenue)}
            <span className="hero-figure__unit"> บาท</span>
          </p>
          <Delta now={t.revenue} before={y.revenue} label="เมื่อวานช่วงเวลาเดียวกัน" />
        </div>
        <dl className="today__facts">
          <div>
            <dt>บิลวันนี้</dt>
            <dd>{num(t.orders)}</dd>
            <dd className="today__was">เมื่อวานถึงเวลานี้ {num(y.orders)} บิล</dd>
          </div>
          <div>
            <dt>เฉลี่ยต่อบิล</dt>
            <dd>{baht(t.avgTicket)}</dd>
            <dd className="today__was">เมื่อวาน {baht(y.avgTicket)} บาท</dd>
          </div>
          <div>
            <dt>ขายไป</dt>
            <dd>{num(t.items)} ชิ้น</dd>
            <dd className="today__was">ส่วนลดรวม {baht(t.discounts)} บาท</dd>
          </div>
          <div>
            <dt>คืนเงินวันนี้</dt>
            <dd>{num(t.refunds)} บิล</dd>
            <dd className="today__was">{bahtText(t.refundAmount)}</dd>
          </div>
        </dl>
        <ShiftCard shift={shift} />
      </div>

      {d.crm && <CrmTiles crm={d.crm} />}

      <section className="block" aria-labelledby="d30">
        <div className="block__head">
          <h2 id="d30">30 วันล่าสุด</h2>
          <Link to="/reports">ดูรายงานละเอียด</Link>
        </div>
        <div className="stats">
          <Stat label="ยอดขาย" value={<Money value={d.last30.revenue} />} note={`${num(d.last30.orders)} บิล เฉลี่ย ${baht(d.last30.avgTicket)} บาท`} />
          <Stat
            label="กำไรขั้นต้น"
            value={<Money value={d.last30.grossProfit} />}
            note={`หลังหัก VAT ${baht(d.last30.vat)} และต้นทุน ${baht(d.last30.cost)} บาท`}
          />
          <Stat label="ส่วนลดที่ให้" value={<Money value={d.last30.discounts} />} note={`${num(d.last30.items)} ชิ้นที่ขาย`} />
          <Stat label="คืนเงิน" value={`${num(d.last30.refunds)} บิล`} note={bahtText(d.last30.refundAmount)} />
        </div>
        <div className="panel chart-panel">
          <ColumnChart
            title="ยอดขายรายวัน (บาท)"
            valueLabel="ยอดขาย (บาท)"
            extraLabel="จำนวนบิล"
            format={(n) => `${baht(n)} บาท`}
            points={d.days.map((p) => ({
              key: p.day,
              tick: dayLabel(p.day).split(' ')[0],
              label: dayLabel(p.day, 'long'),
              value: p.revenue,
              extra: `${num(p.orders)} บิล`,
            }))}
            tickEvery={3}
          />
        </div>
        <div className="grid-3">
          <div className="panel pad">
            <BarList
              title="สินค้าขายดี (ตามยอดขาย)"
              rows={d.topProducts.map((p) => ({
                key: p.productId,
                label: <Words text={p.name} />,
                value: p.revenue,
                display: `${baht(p.revenue)} บาท`,
                sub: `${num(p.qty)} ชิ้น`,
                to: `/products/${p.productId}`,
              }))}
            />
          </div>
          <div className="panel pad">
            <BarList
              title="ช่องทางชำระเงิน"
              rows={[...d.byPayment]
                .sort((a, b) => b.revenue - a.revenue)
                .map((p) => ({ key: p.method, label: PAYMENT_LABEL[p.method], value: p.revenue, display: `${baht(p.revenue)} บาท`, sub: `${num(p.orders)} บิล` }))}
            />
          </div>
          <div className="panel pad">
            <BarList
              title="ยอดขายตามหมวด"
              rows={[...d.byCategory]
                .sort((a, b) => b.revenue - a.revenue)
                .map((c) => ({ key: c.categoryId, label: catLabel(c.categoryId), value: c.revenue, display: `${baht(c.revenue)} บาท`, sub: `${num(c.qty)} ชิ้น` }))}
            />
          </div>
        </div>
      </section>

      <div className="grid-2 grid-2--wide-right">
        <section className="panel pad" aria-labelledby="low">
          <div className="block__head">
            <h2 id="low" className="h3">
              สินค้าใกล้หมด
            </h2>
            <Link to="/products?stock=low">ดูทั้งหมด</Link>
          </div>
          {d.lowStock.length === 0 ? (
            <Empty title="สต็อกพอทุกรายการ">ยังไม่มีสินค้าที่ต่ำกว่าจุดสั่งซื้อ</Empty>
          ) : (
            <ul className="low-list">
              {d.lowStock.map((p) => (
                <li key={p.id}>
                  <Link to={`/products/${p.id}`}>
                    <Words text={p.name} />
                  </Link>
                  <span className="low-list__sku">{p.sku}</span>
                  {p.stock === 0 ? <Badge tone="rose">หมด</Badge> : <Badge tone="butter">เหลือ {p.stock}</Badge>}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel pad" aria-labelledby="recent">
          <div className="block__head">
            <h2 id="recent" className="h3">
              บิลล่าสุด
            </h2>
            <Link to="/orders">ดูรายการขาย</Link>
          </div>
          <TableWrap label="บิลล่าสุด">
            <table className="table table--compact">
              <thead>
                <tr>
                  <th scope="col">เลขที่</th>
                  <th scope="col">เวลา</th>
                  <th scope="col">ลูกค้า</th>
                  <th scope="col" className="num">
                    ยอด (บาท)
                  </th>
                  <th scope="col">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {d.recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link to={`/orders/${o.id}`}>{o.no}</Link>
                    </td>
                    <td className="nowrap">{shortDateTime(o.createdAt)}</td>
                    <td>
                      <Words text={o.customerName ?? 'ลูกค้าทั่วไป'} />
                    </td>
                    <td className="num">{baht(o.total)}</td>
                    <td>{o.status === 'paid' ? <Badge tone="mint">{STATUS_LABEL.paid}</Badge> : <Badge tone="rose">{STATUS_LABEL.refunded}</Badge>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        </section>
      </div>

      <section className="block" aria-labelledby="counts">
        <h2 id="counts" className="h3">
          ข้อมูลในระบบ
        </h2>
        <dl className="counts">
          <div>
            <dt>สินค้าที่เปิดขาย</dt>
            <dd>{num(d.counts.products)} รายการ</dd>
          </div>
          <div>
            <dt>ลูกค้า</dt>
            <dd>{num(d.counts.customers)} ราย</dd>
          </div>
          <div>
            <dt>บิลทั้งหมด</dt>
            <dd>{num(d.counts.orders)} บิล</dd>
          </div>
          <div>
            <dt>สต็อกคงเหลือ</dt>
            <dd>{num(d.counts.stockUnits)} ชิ้น</dd>
          </div>
          <div>
            <dt>มูลค่าสต็อกตามทุน</dt>
            <dd>{bahtText(d.counts.stockValue)}</dd>
          </div>
        </dl>
      </section>
    </>
  )
}

function ShiftCard({ shift }: { shift: ShiftView | null }) {
  if (!shift) {
    return (
      <div className="today__shift today__shift--closed">
        <p className="today__label">ลิ้นชักเงินสด</p>
        <p className="today__shift-main">ยังไม่เปิดกะ</p>
        <Link className="btn btn-primary btn-sm" to="/shifts">
          เปิดกะเพื่อเริ่มขาย
        </Link>
      </div>
    )
  }
  return (
    <div className="today__shift">
      <p className="today__label">
        กะ #{shift.no} เปิดโดย {shift.openedBy} เวลา {timeOnly(shift.openedAt)}
      </p>
      <p className="today__shift-main">
        <Money value={shift.expectedNow} />
      </p>
      <p className="today__was">เงินที่ควรมีในลิ้นชัก (ตั้งต้น {baht(shift.openingCash)} + ขายเงินสด {baht(shift.cashSales)})</p>
      <Link to="/shifts">ดูรายละเอียดกะ</Link>
    </div>
  )
}

/** What is waiting for someone in customer relations, each tile opening its screen. */
function CrmTiles({ crm }: { crm: NonNullable<DashboardData['crm']> }) {
  const tiles = [
    { to: '/leads?status=new', label: 'ลูกค้าที่สนใจรายใหม่', value: `${num(crm.newLeads)} ราย`, note: `ยังติดตามอยู่ทั้งหมด ${num(crm.openLeads)} ราย`, tone: 'peach' },
    { to: '/bookings', label: 'นัดชมวันนี้', value: `${num(crm.bookingsToday)} นัด`, note: `นัดถัดจากวันนี้ ${num(crm.bookingsUpcoming)} นัด`, tone: 'sky' },
    { to: '/reservations', label: 'การจองที่ยังเปิดอยู่', value: `${num(crm.reservationsHeld)} ตัว`, note: 'รอชำระมัดจำหรือรอมารับ', tone: 'mint' },
    { to: '/reviews', label: 'รีวิวรอตรวจ', value: `${num(crm.pendingReviews)} รีวิว`, note: 'แสดงบนเว็บหลังผู้จัดการอนุมัติ', tone: 'lavender' },
  ]
  return (
    <section className="block" aria-labelledby="crm-t">
      <div className="block__head">
        <h2 id="crm-t">ลูกค้าสัมพันธ์</h2>
        <Link to="/leads">ดูลูกค้าที่สนใจทั้งหมด</Link>
      </div>
      <ul className="crm-tiles">
        {tiles.map((t) => (
          <li key={t.to}>
            <Link to={t.to} className={`crm-tile tone-${t.tone}`}>
              <span className="crm-tile__label">{t.label}</span>
              <span className="crm-tile__value">{t.value}</span>
              <span className="crm-tile__note">{t.note}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
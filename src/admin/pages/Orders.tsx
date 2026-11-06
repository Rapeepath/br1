import { Fragment, useId, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { Printer, Undo2 } from 'lucide-react'
import { api, useApi, type Customer, type KittenRow, type Order, type OrderList, type Settings } from '../api'
import { useSession, useToast } from '../context'
import { PAYMENT_LABEL, STATUS_LABEL, addDays, baht, bahtText, bkkDay, dateTime, dateTimeLong, dayLabel, num } from '../format'
import { printReceipt, Receipt, type UnitNames } from '../Receipt'
import { Badge, Dialog, ErrorNote, Field, Loading, Money, PageHead, Pager, Segmented, Stat, TableWrap, Words, useDebounced } from '../ui'

const PAGE = 25

type Preset = 'today' | '7' | '30' | 'custom'

export function rangeOf(preset: Preset, from: string, to: string) {
  const today = bkkDay()
  if (preset === 'today') return { from: today, to: today }
  if (preset === '7') return { from: addDays(today, -6), to: today }
  if (preset === '30') return { from: addDays(today, -29), to: today }
  return { from: from || addDays(today, -29), to: to || today }
}

/** "ลูกแมวโคราช เกรดเลี้ยง ×1, ทรายแมวเต้าหู้ ×2" with names kept whole */
export function Items({ lines }: { lines: Order['lines'] }) {
  return (
    <span className="words">
      {lines.map((l, i) => (
        <Fragment key={`${l.productId}-${i}`}>
          {i > 0 && ', '}
          <Words text={`${l.name} ×${l.qty}`} />
        </Fragment>
      ))}
    </span>
  )
}

export function StatusBadge({ status }: { status: Order['status'] }) {
  return status === 'paid' ? <Badge tone="mint">{STATUS_LABEL.paid}</Badge> : <Badge tone="rose">{STATUS_LABEL.refunded}</Badge>
}

export function Orders() {
  const { meta } = useSession()
  const [params, setParams] = useSearchParams()
  const preset = (params.get('range') as Preset) || '7'
  const [from, setFrom] = useState(params.get('from') ?? addDays(bkkDay(), -6))
  const [to, setTo] = useState(params.get('to') ?? bkkDay())
  const [q, setQ] = useState(params.get('q') ?? '')
  const term = useDebounced(q, 250)
  const status = params.get('status') ?? ''
  const payment = params.get('payment') ?? ''
  const staffId = params.get('staff') ?? ''
  const page = Number(params.get('page') ?? 1) || 1
  const range = rangeOf(preset, from, to)

  const set = (k: string, v: string) => {
    const next = new URLSearchParams(params)
    if (v) next.set(k, v)
    else next.delete(k)
    if (k !== 'page') next.delete('page')
    setParams(next, { replace: true })
  }

  const qs = new URLSearchParams({ from: range.from, to: range.to, limit: String(PAGE), offset: String((page - 1) * PAGE) })
  if (status) qs.set('status', status)
  if (payment) qs.set('payment', payment)
  if (staffId) qs.set('staffId', staffId)
  if (term.trim()) qs.set('q', term.trim())
  const { data, error, loading, reload } = useApi<OrderList>(`/orders?${qs}`)
  const pages = data ? Math.max(1, Math.ceil(data.total / PAGE)) : 1
  const fromId = useId()
  const toId = useId()
  const qId = useId()

  return (
    <section className="page">
      <PageHead title="รายการขาย" lead="ทุกบิลที่ขายผ่านหน้าร้าน ค้นหา กรอง พิมพ์ใบเสร็จซ้ำ และคืนเงิน" />
      <div className="filters" role="search" aria-label="กรองรายการขาย">
        <Segmented
          label="ช่วงวันที่"
          value={preset}
          onChange={(v) => set('range', v)}
          options={[
            { value: 'today', label: 'วันนี้' },
            { value: '7', label: '7 วัน' },
            { value: '30', label: '30 วัน' },
            { value: 'custom', label: 'กำหนดเอง' },
          ]}
        />
        {preset === 'custom' && (
          <div className="filters__dates">
            <div className="mini-field">
              <label htmlFor={fromId}>ตั้งแต่</label>
              <input id={fromId} className="input input--sm" type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="mini-field">
              <label htmlFor={toId}>ถึง</label>
              <input id={toId} className="input input--sm" type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
        )}
        <div className="mini-field">
          <label htmlFor={`${qId}-s`}>สถานะ</label>
          <select id={`${qId}-s`} className="input input--sm" value={status} onChange={(e) => set('status', e.target.value)}>
            <option value="">ทุกสถานะ</option>
            <option value="paid">{STATUS_LABEL.paid}</option>
            <option value="refunded">{STATUS_LABEL.refunded}</option>
          </select>
        </div>
        <div className="mini-field">
          <label htmlFor={`${qId}-p`}>ชำระด้วย</label>
          <select id={`${qId}-p`} className="input input--sm" value={payment} onChange={(e) => set('payment', e.target.value)}>
            <option value="">ทุกช่องทาง</option>
            {meta.paymentMethods.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div className="mini-field">
          <label htmlFor={`${qId}-t`}>พนักงาน</label>
          <select id={`${qId}-t`} className="input input--sm" value={staffId} onChange={(e) => set('staff', e.target.value)}>
            <option value="">ทุกคน</option>
            {meta.staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mini-field mini-field--grow">
          <label htmlFor={qId}>ค้นหา</label>
          <input id={qId} className="input input--sm" type="search" placeholder="เลขที่บิล ชื่อลูกค้า หรือสินค้า" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      {error && <ErrorNote message={error} onRetry={reload} />}
      {!data && !error && <Loading />}
      {data && (
        <div className={`page-body ${loading ? 'is-reloading' : ''}`}>
          <p className="result-line" aria-live="polite">
            พบ {num(data.total)} บิล ระหว่าง {dayLabel(data.from, 'medium')} ถึง {dayLabel(data.to, 'medium')} ยอดชำระ (ไม่รวมบิลที่คืนเงิน) {bahtText(data.revenue)}
          </p>
          {data.rows.length === 0 ? (
            <p className="empty-line">ไม่มีบิลที่ตรงกับตัวกรองนี้ ลองขยายช่วงวันที่หรือล้างคำค้นหา</p>
          ) : (
            <TableWrap label="ตารางรายการขาย">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">เลขที่บิล</th>
                    <th scope="col">วันเวลา</th>
                    <th scope="col">ลูกค้า</th>
                    <th scope="col">รายการ</th>
                    <th scope="col" className="num">
                      ยอด (บาท)
                    </th>
                    <th scope="col">ชำระด้วย</th>
                    <th scope="col">สถานะ</th>
                    <th scope="col">พนักงาน</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((o) => (
                    <tr key={o.id}>
                      <td>
                        <Link to={`/orders/${o.id}`}>{o.no}</Link>
                      </td>
                      <td className="nowrap">{dateTime(o.createdAt)}</td>
                      <td>
                        <Words text={o.customerName ?? 'ลูกค้าทั่วไป'} />
                      </td>
                      <td className="cell-items">
                        <Items lines={o.lines} />
                      </td>
                      <td className="num">{baht(o.total)}</td>
                      <td>{PAYMENT_LABEL[o.payment.method]}</td>
                      <td>
                        <StatusBadge status={o.status} />
                      </td>
                      <td>{o.staffName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          )}
          <Pager page={page} pages={pages} onPage={(p) => set('page', String(p))} />
        </div>
      )}
    </section>
  )
}

export function OrderPage() {
  const { id = '' } = useParams()
  const { meta, staff, isManager, refreshShift } = useSession()
  const { data, error, reload } = useApi<{ order: Order; customer: Customer | null; settings: Settings }>(`/orders/${encodeURIComponent(id)}`)
  // Kitten codes for a bill that sold kittens (lines carry the kittens' ids)
  const kittens = useApi<{ rows: KittenRow[] }>(data?.order.lines.some((l) => l.unitIds?.length) ? '/kittens' : null)
  const [printing, setPrinting] = useState(false)
  const [refunding, setRefunding] = useState(false)
  const navigate = useNavigate()

  if (error) {
    return (
      <section className="page">
        <PageHead title="ไม่พบบิล" />
        <ErrorNote message={error} onRetry={reload} />
        <Link to="/orders">กลับไปรายการขาย</Link>
      </section>
    )
  }
  if (!data) {
    return (
      <section className="page">
        <Loading />
      </section>
    )
  }
  const o = data.order
  const cost = o.lines.reduce((s, l) => s + l.unitCost * l.qty, 0)
  const units: UnitNames = Object.fromEntries((kittens.data?.rows ?? []).map((k) => [k.id, { code: k.code, name: k.name }]))
  return (
    <section className="page">
      <p className="crumbs">
        <Link to="/orders">รายการขาย</Link>
      </p>
      <PageHead
        title={`บิล ${o.no}`}
        lead={
          <>
            {dateTimeLong(o.createdAt)} <StatusBadge status={o.status} />
          </>
        }
        actions={
          <>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPrinting(true)}>
              <Printer size={16} aria-hidden /> ดูและพิมพ์ใบเสร็จ
            </button>
            {o.status === 'paid' && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setRefunding(true)}>
                <Undo2 size={16} aria-hidden /> คืนเงินบิลนี้
              </button>
            )}
          </>
        }
      />

      <div className="stats">
        <Stat label="ยอดชำระ" value={<Money value={o.total} />} note={`VAT ${baht(o.vat)} บาท รวมในราคาแล้ว`} />
        <Stat label="ส่วนลดรวม" value={<Money value={o.lineDiscount + o.billDiscount} />} note={`รายการ ${baht(o.lineDiscount)} ท้ายบิล ${baht(o.billDiscount)}`} />
        <Stat label="ต้นทุนสินค้า" value={<Money value={cost} />} note={`กำไรขั้นต้น ${baht(o.total - o.vat - cost)} บาท`} />
        <Stat label="จำนวน" value={`${num(o.lines.reduce((s, l) => s + l.qty, 0))} ชิ้น`} note={`${o.lines.length} รายการ`} />
      </div>

      <div className="grid-2 grid-2--wide-left">
        <section className="panel pad" aria-labelledby="lines">
          <h2 id="lines" className="h3">
            รายการในบิล
          </h2>
          <TableWrap label="รายการในบิล">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">สินค้า</th>
                  <th scope="col" className="num">
                    จำนวน
                  </th>
                  <th scope="col" className="num">
                    ราคาต่อหน่วย
                  </th>
                  <th scope="col" className="num">
                    ส่วนลด
                  </th>
                  <th scope="col" className="num">
                    รวม (บาท)
                  </th>
                </tr>
              </thead>
              <tbody>
                {o.lines.map((l, i) => (
                  <tr key={`${l.productId}-${i}`}>
                    <td>
                      <Link to={`/products/${l.productId}`}>
                        <Words text={l.name} />
                      </Link>
                      <span className="cell-sub">{l.sku}</span>
                      {l.unitIds?.map((u) => (
                        <span key={u} className="cell-sub">
                          <Link to={`/kittens/${u}`}>{units[u] ? `ลูกแมว ${units[u].code} น้อง${units[u].name}` : `ลูกแมว ${u}`}</Link>
                        </span>
                      ))}
                    </td>
                    <td className="num">{num(l.qty)}</td>
                    <td className="num">{baht(l.unitPrice)}</td>
                    <td className="num">{l.discount ? baht(l.discount) : '–'}</td>
                    <td className="num">{baht(l.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row" colSpan={4}>
                    รวมก่อนส่วนลดท้ายบิล
                  </th>
                  <td className="num">{baht(o.subtotal - o.lineDiscount)}</td>
                </tr>
                {o.billDiscount > 0 && (
                  <tr>
                    <th scope="row" colSpan={4}>
                      ส่วนลดท้ายบิล
                    </th>
                    <td className="num">−{baht(o.billDiscount)}</td>
                  </tr>
                )}
                <tr>
                  <th scope="row" colSpan={4}>
                    ยอดชำระ (มูลค่าก่อน VAT {baht(o.beforeVat)} + VAT {o.vatRate}% {baht(o.vat)})
                  </th>
                  <td className="num">
                    <strong>{baht(o.total)}</strong>
                  </td>
                </tr>
                {o.depositApplied ? (
                  <>
                    <tr>
                      <th scope="row" colSpan={4}>
                        หักเงินมัดจำที่ชำระแล้ว{o.reservationNo ? ` (การจอง ${o.reservationNo})` : ''}
                      </th>
                      <td className="num">−{baht(o.depositApplied)}</td>
                    </tr>
                    <tr>
                      <th scope="row" colSpan={4}>
                        ชำระในบิลนี้
                      </th>
                      <td className="num">{baht(o.payment.amount)}</td>
                    </tr>
                  </>
                ) : null}
              </tfoot>
            </table>
          </TableWrap>
          {o.note && <p className="note-line">หมายเหตุ: {o.note}</p>}
        </section>

        <section className="panel pad" aria-labelledby="pay">
          <h2 id="pay" className="h3">
            การชำระเงินและลูกค้า
          </h2>
          <dl className="facts">
            <div>
              <dt>วิธีชำระ</dt>
              <dd>{PAYMENT_LABEL[o.payment.method]}</dd>
            </div>
            {o.payment.tendered !== null && (
              <div>
                <dt>รับเงิน / เงินทอน</dt>
                <dd>
                  {baht(o.payment.tendered)} / {baht(o.payment.change ?? 0)} บาท
                </dd>
              </div>
            )}
            {o.payment.cardLast4 && (
              <div>
                <dt>บัตร</dt>
                <dd>**** {o.payment.cardLast4}</dd>
              </div>
            )}
            {o.payment.reference && (
              <div>
                <dt>{o.payment.method === 'card' ? 'รหัสอนุมัติ' : 'เลขอ้างอิง'}</dt>
                <dd>{o.payment.reference}</dd>
              </div>
            )}
            <div>
              <dt>ลูกค้า</dt>
              <dd>{data.customer ? <Link to={`/customers/${data.customer.id}`}>{data.customer.name}</Link> : 'ลูกค้าทั่วไป'}</dd>
            </div>
            {data.customer && (
              <div>
                <dt>ติดต่อ</dt>
                <dd>
                  {data.customer.phone}
                  {data.customer.email && `, ${data.customer.email}`}
                </dd>
              </div>
            )}
            {o.reservationNo && (
              <div>
                <dt>การจองลูกแมว</dt>
                <dd>
                  <Link to={`/reservations/${o.reservationNo}`}>{o.reservationNo}</Link>
                  {o.depositApplied ? ` หักมัดจำ ${baht(o.depositApplied)} บาท` : ''}
                </dd>
              </div>
            )}
            <div>
              <dt>พนักงานขาย</dt>
              <dd>{o.staffName}</dd>
            </div>
            <div>
              <dt>กะ</dt>
              <dd>{o.shiftId ? <Link to="/shifts">{o.shiftId}</Link> : 'ไม่ระบุ'}</dd>
            </div>
            <div>
              <dt>รหัสบิลในระบบ</dt>
              <dd>{o.id}</dd>
            </div>
          </dl>
          {o.refund && (
            <div className="refund-box">
              <p className="refund-box__title">คืนเงินแล้ว</p>
              <p>
                {dateTimeLong(o.refund.at)} โดย {o.refund.staffName} อนุมัติโดย {o.refund.approvedBy}
              </p>
              <p>เหตุผล: {o.refund.reason}</p>
            </div>
          )}
        </section>
      </div>

      <Dialog open={printing} onClose={() => setPrinting(false)} title={`ใบเสร็จ ${o.no}`} className="dialog--receipt">
        <div className="print-target">
          <Receipt order={o} settings={meta.settings} customer={data.customer} units={units} />
        </div>
        <div className="form__actions">
          <button type="button" className="btn btn-primary" onClick={printReceipt}>
            <Printer size={18} aria-hidden /> พิมพ์ใบเสร็จ
          </button>
        </div>
      </Dialog>

      {refunding && (
        <RefundDialog
          order={o}
          needsPin={!isManager}
          staffName={staff.name}
          onClose={() => setRefunding(false)}
          onDone={() => {
            setRefunding(false)
            reload()
            void refreshShift()
            navigate(`/orders/${o.id}`, { replace: true })
          }}
        />
      )}
    </section>
  )
}

function RefundDialog({ order, needsPin, staffName, onClose, onDone }: { order: Order; needsPin: boolean; staffName: string; onClose: () => void; onDone: () => void }) {
  const [reason, setReason] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const toast = useToast()
  const rId = useId()
  const pId = useId()

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await api<Order>(`/orders/${order.id}/refund`, { method: 'POST', body: { reason, managerPin: needsPin ? pin : undefined } })
      toast(`คืนเงินบิล ${order.no} แล้ว สินค้ากลับเข้าสต็อก`)
      onDone()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open onClose={onClose} title={`คืนเงินบิล ${order.no}`}>
      <form className="form" onSubmit={submit}>
        <p>
          คืนเงิน {bahtText(order.total)} ด้วย{PAYMENT_LABEL[order.payment.method]} สินค้าที่นับสต็อกจะกลับเข้าคลัง ทำรายการโดย {staffName}
        </p>
        <Field label="เหตุผลการคืนเงิน" htmlFor={rId}>
          <textarea id={rId} className="input" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} required />
        </Field>
        {needsPin && (
          <Field label="รหัส PIN ผู้จัดการ" htmlFor={pId} hint="พนักงานต้องให้ผู้จัดการอนุมัติการคืนเงิน (รหัสทดลอง 1111)">
            <input id={pId} className="input" type="password" inputMode="numeric" autoComplete="off" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} required />
          </Field>
        )}
        {error && (
          <p className="form__error" role="alert">
            {error}
          </p>
        )}
        <div className="form__actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            ยกเลิก
          </button>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            ยืนยันคืนเงิน
          </button>
        </div>
      </form>
    </Dialog>
  )
}

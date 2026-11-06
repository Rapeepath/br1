// การจอง: kittens held against a deposit from the brochure. Staff confirm a transfer, extend a hold, cancel,
// or open a paid reservation at the till, where the deposit comes off the bill.
import { useId, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { ExternalLink, ShoppingBasket } from 'lucide-react'
import { api, useApi, type ReservationCart, type ReservationDetail, type ReservationRow } from '../api'
import type { Reservation, ReservationStatus } from '../../../server/types.ts'
import { useCart, useToast } from '../context'
import { PICKUP_LABEL, RESERVATION_STATUS_LABEL, SEX_LABEL } from '../crm'
import { ContactLinks, Countdown, ReservationStatusBadge, useNow } from '../crmUi'
import { PAYMENT_LABEL, baht, bahtText, dateTime, num } from '../format'
import { Dialog, ErrorNote, Field, Loading, Money, PageHead, Segmented, Stat, TableWrap, Words } from '../ui'
import { CrmSubNav } from './Kittens'
import '../crm.css'

const STATUSES = Object.keys(RESERVATION_STATUS_LABEL) as ReservationStatus[]
const OPEN: ReservationStatus[] = ['pending-payment', 'held']

function Deposit({ r }: { r: Reservation }) {
  return (
    <span className="deposit-state">
      <span>{bahtText(r.deposit.amount)}</span>
      {r.deposit.paidAt ? (
        <span className="deposit-state__paid">ชำระแล้ว{r.deposit.method ? ` (${PAYMENT_LABEL[r.deposit.method]})` : ''}</span>
      ) : r.status === 'pending-payment' ? (
        <span className="deposit-state__due">ยังไม่ชำระ</span>
      ) : (
        <span className="cell-sub">ไม่ได้ชำระ</span>
      )}
    </span>
  )
}

export function Reservations() {
  const [params, setParams] = useSearchParams()
  const status = (params.get('status') ?? 'open') as ReservationStatus | 'open' | 'all'
  const { data, error, loading, reload } = useApi<{ rows: ReservationRow[] }>('/reservations')
  const now = useNow()
  const rows = (data?.rows ?? []).filter((r) => (status === 'all' ? true : status === 'open' ? OPEN.includes(r.status) : r.status === status))
  const count = (s: ReservationStatus) => (data?.rows ?? []).filter((r) => r.status === s).length

  return (
    <section className="page">
      <PageHead title="การจองลูกแมว" lead="ลูกแมวที่ลูกค้าจองจากหน้าเว็บพร้อมเงินมัดจำ ยังไม่ชำระมัดจำถือคิวได้ 2 ชั่วโมง ชำระแล้วถือไว้ให้ 48 ชั่วโมง" />
      <CrmSubNav />
      <div className="filters" role="search" aria-label="กรองการจอง">
        <Segmented
          label="สถานะ"
          className="status-tabs"
          value={status}
          onChange={(v) => {
            const next = new URLSearchParams(params)
            next.set('status', v)
            setParams(next, { replace: true })
          }}
          options={[
            { value: 'open', label: `กำลังดำเนินการ${data ? ` ${num(count('pending-payment') + count('held'))}` : ''}` },
            ...STATUSES.map((s) => ({ value: s, label: `${RESERVATION_STATUS_LABEL[s]}${data ? ` ${num(count(s))}` : ''}` })),
            { value: 'all', label: 'ทั้งหมด' },
          ]}
        />
      </div>
      {error && <ErrorNote message={error} onRetry={reload} />}
      {!data && !error && <Loading />}
      {data && (
        <div className={`page-body ${loading ? 'is-reloading' : ''}`}>
          {rows.length === 0 ? (
            <p className="empty-line">ไม่มีการจองในสถานะนี้ การจองใหม่จากหน้าเว็บจะขึ้นที่นี่ทันที</p>
          ) : (
            <TableWrap label="ตารางการจอง">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">การจอง</th>
                    <th scope="col">ลูกแมว</th>
                    <th scope="col">ผู้จอง</th>
                    <th scope="col">มัดจำ</th>
                    <th scope="col">ถือคิวถึง</th>
                    <th scope="col">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <Link to={`/reservations/${r.id}`}>{r.no}</Link>
                        <span className="cell-sub">{dateTime(r.createdAt)}</span>
                      </td>
                      <td>
                        {r.kitten ? (
                          <>
                            <Link to={`/kittens/${r.kitten.id}`}>น้อง{r.kitten.name}</Link>
                            <span className="cell-sub">{r.kitten.code}</span>
                          </>
                        ) : (
                          '–'
                        )}
                      </td>
                      <td>
                        <Words text={r.customer.name} />
                        <span className="cell-sub">{PICKUP_LABEL[r.pickup]}</span>
                      </td>
                      <td>
                        <Deposit r={r} />
                      </td>
                      <td>{OPEN.includes(r.status) ? <Countdown until={r.holdUntil} now={now} /> : <span className="cell-sub">{dateTime(r.updatedAt)}</span>}</td>
                      <td>
                        <ReservationStatusBadge status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          )}
        </div>
      )}
    </section>
  )
}

export function ReservationPage() {
  const { id = '' } = useParams()
  const { data, error, reload } = useApi<ReservationDetail>(`/reservations/${encodeURIComponent(id)}`)
  const toast = useToast()
  const { dispatch } = useCart()
  const navigate = useNavigate()
  const now = useNow()
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [paying, setPaying] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  if (error)
    return (
      <section className="page">
        <PageHead title="ไม่พบการจอง" />
        <ErrorNote message={error} onRetry={reload} />
        <Link to="/reservations">กลับไปการจอง</Link>
      </section>
    )
  if (!data)
    return (
      <section className="page">
        <Loading />
      </section>
    )

  const r = data.reservation
  const k = data.kitten
  const open = OPEN.includes(r.status)

  const act = async (body: Record<string, unknown>, done: string) => {
    setBusy(true)
    setActionError(null)
    try {
      await api(`/reservations/${r.id}`, { method: 'PATCH', body })
      toast(done)
      reload()
      return true
    } catch (err) {
      setActionError((err as Error).message)
      return false
    } finally {
      setBusy(false)
    }
  }

  const toTill = async () => {
    setBusy(true)
    setActionError(null)
    try {
      const c = await api<ReservationCart>(`/reservations/${r.id}/to-cart`, { method: 'POST' })
      const line = c.lines[0]
      dispatch({
        type: 'reservation',
        reservation: { no: c.reservationNo, deposit: c.depositApplied, unitId: line.unitId },
        line: { productId: line.productId, unitId: line.unitId, unitCode: k?.code ?? '', unitName: k?.name ?? '', unitPrice: k?.price ?? undefined },
        customerId: c.customer?.id ?? null,
      })
      toast(`เปิดบิลรับน้อง${k?.name ?? ''}ตามการจอง ${c.reservationNo} แล้ว`)
      navigate('/pos')
    } catch (err) {
      setActionError((err as Error).message)
      setBusy(false)
    }
  }

  return (
    <section className="page">
      <p className="crumbs">
        <Link to="/reservations">การจอง</Link>
      </p>
      <PageHead
        title={`การจอง ${r.no}`}
        lead={
          <>
            จองเมื่อ {dateTime(r.createdAt)} <ReservationStatusBadge status={r.status} />
          </>
        }
        actions={
          <a className="btn btn-ghost btn-sm" href={data.publicPath} target="_blank" rel="noreferrer">
            <ExternalLink size={16} aria-hidden /> หน้าสถานะที่ลูกค้าเห็น<span className="visually-hidden"> (เปิดในแท็บใหม่)</span>
          </a>
        }
      />

      <div className="stats">
        <Stat label="เงินมัดจำ" value={<Money value={r.deposit.amount} />} note={r.deposit.paidAt ? `ชำระเมื่อ ${dateTime(r.deposit.paidAt)}` : 'ยังไม่ได้ชำระ'} />
        <Stat
          label="ถือคิวถึง"
          value={open ? <Countdown until={r.holdUntil} now={now} /> : RESERVATION_STATUS_LABEL[r.status]}
          note={open ? dateTime(r.holdUntil) : r.cancelReason ?? (r.orderNo ? `ออกบิล ${r.orderNo}` : undefined)}
        />
        <Stat label="รับลูกแมว" value={PICKUP_LABEL[r.pickup]} note={r.customer.address ?? undefined} />
      </div>

      {open && (
        <section className="panel pad" aria-labelledby="res-act">
          <h2 id="res-act" className="h3">
            ขั้นต่อไป
          </h2>
          <div className="step-buttons">
            {r.status === 'pending-payment' && (
              <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={() => setPaying(true)}>
                ยืนยันรับเงินมัดจำ
              </button>
            )}
            {r.status === 'held' && (
              <>
                <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={toTill}>
                  <ShoppingBasket size={16} aria-hidden /> เปิดในหน้าขาย
                </button>
                <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => act({ action: 'extend' }, `ขยายเวลาจอง ${r.no} อีก 24 ชั่วโมงแล้ว`)}>
                  ขยายเวลาอีก 24 ชั่วโมง
                </button>
              </>
            )}
            <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => setCancelling(true)}>
              ยกเลิกการจอง
            </button>
          </div>
          {r.status === 'held' && <p className="field__hint">เปิดในหน้าขายเมื่อลูกค้ามารับ บิลจะหักเงินมัดจำ {bahtText(r.deposit.amount)} ให้อัตโนมัติ</p>}
          {actionError && (
            <p className="form__error" role="alert">
              {actionError}
            </p>
          )}
        </section>
      )}

      <div className="grid-2">
        <section className="panel pad" aria-labelledby="res-k">
          <h2 id="res-k" className="h3">
            ลูกแมวที่จอง
          </h2>
          {k ? (
            <dl className="facts">
              <div>
                <dt>ชื่อ</dt>
                <dd>
                  <Link to={`/kittens/${k.id}`}>น้อง{k.name}</Link> ({k.code})
                </dd>
              </div>
              <div>
                <dt>เพศและสี</dt>
                <dd>
                  {SEX_LABEL[k.sex]} {k.color}
                </dd>
              </div>
              <div>
                <dt>ราคา</dt>
                <dd>{k.price != null ? `${baht(k.price)} บาท (ราคาพิเศษ)` : 'ตามราคาของ SKU'}</dd>
              </div>
            </dl>
          ) : (
            <p className="empty-line">ไม่พบข้อมูลลูกแมวตัวนี้</p>
          )}
        </section>
        <section className="panel pad" aria-labelledby="res-c">
          <h2 id="res-c" className="h3">
            ผู้จอง
          </h2>
          <dl className="facts">
            <div>
              <dt>ชื่อ</dt>
              <dd>
                <Words text={r.customer.name} />
              </dd>
            </div>
            <div>
              <dt>เบอร์โทร</dt>
              <dd>{r.customer.phone || '–'}</dd>
            </div>
            {r.customer.address && (
              <div>
                <dt>ที่อยู่จัดส่ง</dt>
                <dd>{r.customer.address}</dd>
              </div>
            )}
            {r.note && (
              <div>
                <dt>หมายเหตุ</dt>
                <dd className="prewrap">{r.note}</dd>
              </div>
            )}
            {r.deposit.reference && (
              <div>
                <dt>อ้างอิงการชำระ</dt>
                <dd>{r.deposit.reference}</dd>
              </div>
            )}
            {data.lead && (
              <div>
                <dt>ลูกค้าที่สนใจ</dt>
                <dd>
                  <Link to={`/leads/${data.lead.id}`}>{data.lead.no}</Link>
                </dd>
              </div>
            )}
          </dl>
          <ContactLinks phone={r.customer.phone} email={r.customer.email} lineId={r.customer.lineId} name={r.customer.name} />
        </section>
      </div>

      {paying && (
        <MarkPaidDialog
          r={r}
          onClose={() => setPaying(false)}
          onPay={async (method) => {
            if (await act({ action: 'mark-paid', method }, `บันทึกรับมัดจำ ${r.no} แล้ว`)) setPaying(false)
          }}
          busy={busy}
          error={actionError}
        />
      )}
      {cancelling && (
        <CancelDialog
          r={r}
          busy={busy}
          error={actionError}
          onClose={() => setCancelling(false)}
          onCancel={async (reason) => {
            if (await act({ action: 'cancel', reason }, `ยกเลิกการจอง ${r.no} แล้ว`)) setCancelling(false)
          }}
        />
      )}
    </section>
  )
}

function MarkPaidDialog({ r, busy, error, onClose, onPay }: { r: Reservation; busy: boolean; error: string | null; onClose: () => void; onPay: (method: 'promptpay' | 'transfer') => void }) {
  const [method, setMethod] = useState<'promptpay' | 'transfer'>('transfer')
  return (
    <Dialog open onClose={onClose} title={`รับมัดจำ ${r.no}`}>
      <p>ตรวจยอดเงิน {bahtText(r.deposit.amount)} ในแอปธนาคารของร้านก่อน แล้วเลือกช่องทางที่ลูกค้าโอนมา ระบบจะถือคิวลูกแมวไว้ให้อีก 48 ชั่วโมง</p>
      <Segmented
        label="ช่องทางที่ลูกค้าชำระ"
        hideLabel={false}
        value={method}
        onChange={setMethod}
        options={[
          { value: 'transfer', label: PAYMENT_LABEL.transfer },
          { value: 'promptpay', label: PAYMENT_LABEL.promptpay },
        ]}
      />
      {error && (
        <p className="form__error" role="alert">
          {error}
        </p>
      )}
      <div className="form__actions">
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          ยกเลิก
        </button>
        <button type="button" className="btn btn-primary" disabled={busy} onClick={() => onPay(method)}>
          ยืนยันรับเงินมัดจำ
        </button>
      </div>
    </Dialog>
  )
}

function CancelDialog({ r, busy, error, onClose, onCancel }: { r: Reservation; busy: boolean; error: string | null; onClose: () => void; onCancel: (reason: string) => void }) {
  const [reason, setReason] = useState('')
  const [local, setLocal] = useState<string | null>(null)
  const id = useId()
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) {
      setLocal('ระบุเหตุผลที่ยกเลิก')
      return
    }
    setLocal(null)
    onCancel(reason.trim())
  }
  return (
    <Dialog open onClose={onClose} title={`ยกเลิกการจอง ${r.no}`}>
      <form className="form" onSubmit={submit}>
        <p>{r.deposit.paidAt ? `ลูกค้าชำระมัดจำแล้ว ${bahtText(r.deposit.amount)} คืนเงินให้ลูกค้าตามนโยบายของร้านหลังยกเลิก` : 'ยังไม่มีการชำระมัดจำ'} ลูกแมวจะกลับมาพร้อมขายทันที</p>
        <Field label="เหตุผลที่ยกเลิก" htmlFor={`${id}-r`} error={local}>
          <input id={`${id}-r`} className="input" value={reason} maxLength={200} onChange={(e) => setReason(e.target.value)} />
        </Field>
        {error && (
          <p className="form__error" role="alert">
            {error}
          </p>
        )}
        <div className="form__actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            ไม่ยกเลิก
          </button>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            ยืนยันยกเลิกการจอง
          </button>
        </div>
      </form>
    </Dialog>
  )
}

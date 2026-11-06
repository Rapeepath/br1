import { useId, useState, type FormEvent } from 'react'
import { api, useApi, type Shift, type ShiftView } from '../api'
import { useSession, useToast } from '../context'
import { PAYMENT_LABEL, baht, bahtText, dateTime, num, shortDateTime, signedBaht, timeOnly } from '../format'
import { OpenShiftForm } from '../ShiftForms'
import { Badge, ErrorNote, Field, Loading, Money, PageHead, Pager, Segmented, Stat, TableWrap, parseAmount } from '../ui'

const PAGE = 15

function DiffBadge({ diff }: { diff: number | null }) {
  if (diff === null) return <span>–</span>
  if (diff === 0) return <Badge tone="mint">ตรงยอด</Badge>
  return diff > 0 ? <Badge tone="sky">เกิน {baht(diff)}</Badge> : <Badge tone="rose">ขาด {baht(Math.abs(diff))}</Badge>
}

export function Shifts() {
  const { shift, refreshShift, meta } = useSession()
  const list = useApi<ShiftView[]>('/shifts')
  const [page, setPage] = useState(1)
  const staffName = (id: string) => meta.staff.find((s) => s.id === id)?.name ?? id

  const refresh = async () => {
    await refreshShift()
    list.reload()
  }

  const closed = (list.data ?? []).filter((s) => s.status === 'closed')
  const pages = Math.max(1, Math.ceil(closed.length / PAGE))

  return (
    <section className="page">
      <PageHead title="กะและเงินสด" lead="เปิดปิดกะ นำเงินเข้าออกลิ้นชัก และตรวจยอดเงินสดที่ควรมีกับที่นับได้จริง" />
      {!shift && <OpenShiftForm />}
      {shift && (
        <>
          <div className="shift-now">
            <div>
              <p className="today__label">
                กะ #{shift.no} เปิดโดย {shift.openedBy} เมื่อ {dateTime(shift.openedAt)}
              </p>
              <p className="hero-figure">
                {baht(shift.expectedNow)}
                <span className="hero-figure__unit"> บาท</span>
              </p>
              <p className="today__was">เงินสดที่ควรอยู่ในลิ้นชักตอนนี้</p>
            </div>
            <dl className="shift-now__calc">
              <div>
                <dt>เงินทอนตั้งต้น</dt>
                <dd>{baht(shift.openingCash)}</dd>
              </div>
              <div>
                <dt>ขายด้วยเงินสด</dt>
                <dd>+{baht(shift.cashSales)}</dd>
              </div>
              <div>
                <dt>คืนเงินสด</dt>
                <dd>−{baht(shift.cashRefunds)}</dd>
              </div>
              <div>
                <dt>นำเงินเข้าลิ้นชัก</dt>
                <dd>+{baht(shift.cashMoves.filter((m) => m.type === 'in').reduce((s, m) => s + m.amount, 0))}</dd>
              </div>
              <div>
                <dt>นำเงินออกจากลิ้นชัก</dt>
                <dd>−{baht(shift.cashMoves.filter((m) => m.type === 'out').reduce((s, m) => s + m.amount, 0))}</dd>
              </div>
              <div className="shift-now__sum">
                <dt>ควรมีในลิ้นชัก</dt>
                <dd>{bahtText(shift.expectedNow)}</dd>
              </div>
            </dl>
          </div>

          <div className="stats">
            <Stat label="ยอดขายของกะนี้" value={<Money value={shift.summary.revenue} />} note={`${num(shift.summary.orders)} บิล ${num(shift.summary.items)} ชิ้น`} />
            {shift.byPayment.map((p) => (
              <Stat key={p.method} label={PAYMENT_LABEL[p.method]} value={<Money value={p.revenue} />} note={`${num(p.orders)} บิล`} />
            ))}
          </div>

          <div className="grid-2">
            <CashMoveForm onDone={refresh} />
            <CloseShiftForm expected={shift.expectedNow} onDone={refresh} />
          </div>

          <section className="block" aria-labelledby="moves">
            <h2 id="moves" className="h3">
              เงินเข้าออกลิ้นชักในกะนี้
            </h2>
            {shift.cashMoves.length === 0 ? (
              <p className="empty-line">ยังไม่มีการนำเงินเข้าหรือออก</p>
            ) : (
              <TableWrap label="เงินเข้าออกลิ้นชัก">
                <table className="table table--compact">
                  <thead>
                    <tr>
                      <th scope="col">เวลา</th>
                      <th scope="col">รายการ</th>
                      <th scope="col" className="num">
                        จำนวน (บาท)
                      </th>
                      <th scope="col">เหตุผล</th>
                      <th scope="col">ผู้ทำรายการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shift.cashMoves.map((m, i) => (
                      <tr key={`${m.at}-${i}`}>
                        <td className="nowrap">{timeOnly(m.at)}</td>
                        <td>{m.type === 'in' ? 'นำเงินเข้า' : 'นำเงินออก'}</td>
                        <td className={`num ${m.type === 'in' ? 'is-in' : 'is-out'}`}>
                          {m.type === 'in' ? '+' : '−'}
                          {baht(m.amount)}
                        </td>
                        <td>{m.reason}</td>
                        <td>{staffName(m.staffId)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            )}
          </section>
        </>
      )}

      <section className="block" aria-labelledby="history">
        <h2 id="history" className="h3">
          ประวัติกะที่ปิดแล้ว
        </h2>
        {list.error && <ErrorNote message={list.error} onRetry={list.reload} />}
        {!list.data && !list.error && <Loading />}
        {list.data && (
          <>
            <TableWrap label="ประวัติกะ">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">กะ</th>
                    <th scope="col">เปิด</th>
                    <th scope="col">ปิด</th>
                    <th scope="col" className="num">
                      ตั้งต้น
                    </th>
                    <th scope="col" className="num">
                      ยอดขาย
                    </th>
                    <th scope="col" className="num">
                      เงินสดที่ควรมี
                    </th>
                    <th scope="col" className="num">
                      นับได้
                    </th>
                    <th scope="col">ส่วนต่าง</th>
                    <th scope="col">หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody>
                  {closed.slice((page - 1) * PAGE, page * PAGE).map((s) => (
                    <tr key={s.id}>
                      <td>#{s.no}</td>
                      <td className="nowrap">
                        {shortDateTime(s.openedAt)}
                        <span className="cell-sub">{s.openedBy}</span>
                      </td>
                      <td className="nowrap">
                        {s.closedAt ? shortDateTime(s.closedAt) : '–'}
                        <span className="cell-sub">{s.closedBy}</span>
                      </td>
                      <td className="num">{baht(s.openingCash)}</td>
                      <td className="num">
                        {baht(s.summary.revenue)}
                        <span className="cell-sub">{num(s.summary.orders)} บิล</span>
                      </td>
                      <td className="num">{baht(s.expectedCash ?? 0)}</td>
                      <td className="num">{baht(s.countedCash ?? 0)}</td>
                      <td>
                        <DiffBadge diff={s.difference} />
                      </td>
                      <td>{s.note ?? (s.cashMoves.length ? s.cashMoves.map((m) => `${m.type === 'in' ? 'เข้า' : 'ออก'} ${baht(m.amount)} ${m.reason}`).join(', ') : '–')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
            <Pager page={page} pages={pages} onPage={setPage} />
          </>
        )}
      </section>
    </section>
  )
}

function CashMoveForm({ onDone }: { onDone: () => Promise<void> }) {
  const toast = useToast()
  const [type, setType] = useState<'in' | 'out'>('out')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const id = useId()
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await api<Shift>('/shifts/cash', { method: 'POST', body: { type, amount: parseAmount(amount), reason } })
      toast(`${type === 'in' ? 'นำเงินเข้า' : 'นำเงินออก'} ${amount} บาท แล้ว`)
      setAmount('')
      setReason('')
      await onDone()
    } catch (err) {
      setError((err as Error).message)
    }
  }
  return (
    <form className="panel pad form" onSubmit={submit} aria-labelledby={`${id}-t`}>
      <h2 id={`${id}-t`} className="h3">
        นำเงินเข้าหรือออกลิ้นชัก
      </h2>
      <Segmented
        label="รายการ"
        hideLabel={false}
        value={type}
        onChange={setType}
        options={[
          { value: 'out', label: 'นำเงินออก' },
          { value: 'in', label: 'นำเงินเข้า' },
        ]}
      />
      <div className="form__row">
        <Field label="จำนวนเงิน (บาท)" htmlFor={`${id}-a`}>
          <input id={`${id}-a`} className="input" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </Field>
        <Field label="เหตุผล" htmlFor={`${id}-r`}>
          <input id={`${id}-r`} className="input" value={reason} onChange={(e) => setReason(e.target.value)} required placeholder={type === 'out' ? 'เช่น ซื้อของใช้ในร้าน' : 'เช่น แลกเหรียญเพิ่ม'} />
        </Field>
      </div>
      {error && (
        <p className="form__error" role="alert">
          {error}
        </p>
      )}
      <div className="form__actions">
        <button type="submit" className="btn btn-primary btn-sm">
          บันทึกรายการเงินสด
        </button>
      </div>
    </form>
  )
}

function CloseShiftForm({ expected, onDone }: { expected: number; onDone: () => Promise<void> }) {
  const toast = useToast()
  const [counted, setCounted] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const id = useId()
  const value = parseAmount(counted)
  const diff = Number.isFinite(value) ? Math.round((value - expected) * 100) / 100 : null

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const s = await api<Shift>('/shifts/close', { method: 'POST', body: { countedCash: value, note } })
      toast(`ปิดกะ #${s.no} แล้ว ${s.difference === 0 ? 'เงินตรงยอด' : `ส่วนต่าง ${signedBaht(s.difference ?? 0)} บาท`}`)
      await onDone()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <form className="panel pad form" onSubmit={submit} aria-labelledby={`${id}-t`}>
      <h2 id={`${id}-t`} className="h3">
        ปิดกะ
      </h2>
      <p className="form__lead">นับเงินสดทั้งหมดในลิ้นชัก (รวมเงินทอนตั้งต้น) แล้วใส่ยอดที่นับได้ ระบบควรมี {bahtText(expected)}</p>
      <div className="form__row">
        <Field label="เงินสดที่นับได้ (บาท)" htmlFor={`${id}-c`}>
          <input id={`${id}-c`} className="input" inputMode="decimal" value={counted} onChange={(e) => setCounted(e.target.value)} required />
        </Field>
        <Field label="หมายเหตุ (ไม่บังคับ)" htmlFor={`${id}-n`}>
          <input id={`${id}-n`} className="input" value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
      </div>
      <p className={`close-diff ${diff === null ? '' : diff === 0 ? 'is-even' : diff > 0 ? 'is-over' : 'is-short'}`} aria-live="polite" data-testid="close-diff">
        {diff === null ? 'ใส่ยอดที่นับได้เพื่อดูส่วนต่าง' : diff === 0 ? 'ตรงยอดพอดี' : diff > 0 ? `เงินเกิน ${bahtText(diff)}` : `เงินขาด ${bahtText(Math.abs(diff))}`}
      </p>
      {error && (
        <p className="form__error" role="alert">
          {error}
        </p>
      )}
      <div className="form__actions">
        <button type="submit" className="btn btn-ghost btn-sm">
          ปิดกะและสรุปยอด
        </button>
      </div>
    </form>
  )
}

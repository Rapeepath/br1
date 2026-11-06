// นัดหมาย: visits booked from the brochure ("นัดชมลูกแมว"), as a week agenda or a list, with confirm / done /
// no-show / cancel, rescheduling into a free slot and a note.
import { useEffect, useId, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { api, useApi, type Booking } from '../api'
import type { BookingStatus } from '../../../server/types.ts'
import { useSession, useToast } from '../context'
import { BOOKING_ACTION_LABEL, BOOKING_STATUS_LABEL, BOOKING_STATUS_TONE, bookingActions, weekDays, weekStart } from '../crm'
import { BookingStatusBadge, ContactLinks } from '../crmUi'
import { addDays, bkkDay, dateTime, dayLabel, num } from '../format'
import { Dialog, ErrorNote, Field, Loading, PageHead, Segmented, TableWrap, Words } from '../ui'
import { useBreedNames } from './Leads'
import '../crm.css'

interface SlotDay {
  date: string
  open: boolean
  hours: { open: string; close: string } | null
  durationMin: number
  slots: { time: string; available: boolean }[]
}

const STATUSES = Object.keys(BOOKING_STATUS_LABEL) as BookingStatus[]

/** "ศ. 6 พ.ย.": short enough for a column a day */
const weekdayDate = (day: string) =>
  new Date(`${day}T12:00:00+07:00`).toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok', weekday: 'short', day: 'numeric', month: 'short' })

export function Bookings() {
  const [params, setParams] = useSearchParams()
  const view = params.get('view') === 'list' ? 'list' : 'week'
  const today = bkkDay()
  const start = weekStart(params.get('week') ?? today)
  const days = weekDays(start)
  const [open, setOpen] = useState<Booking | null>(null)
  const set = (k: string, v: string | null) => {
    const next = new URLSearchParams(params)
    if (v) next.set(k, v)
    else next.delete(k)
    setParams(next, { replace: true })
  }

  return (
    <section className="page">
      <PageHead title="นัดหมาย" lead="นัดชมลูกแมวที่ร้านจากหน้าเว็บไซต์ ยืนยันนัด เลื่อนเวลา และบันทึกผลหลังลูกค้ามา" />
      <div className="filters">
        <Segmented
          label="มุมมอง"
          value={view}
          onChange={(v) => set('view', v === 'list' ? 'list' : null)}
          options={[
            { value: 'week', label: 'ตารางสัปดาห์' },
            { value: 'list', label: 'รายการ' },
          ]}
        />
      </div>
      {view === 'week' ? (
        <Week days={days} today={today} onPrev={() => set('week', addDays(start, -7))} onNext={() => set('week', addDays(start, 7))} onToday={() => set('week', null)} onOpen={setOpen} />
      ) : (
        <List onOpen={setOpen} />
      )}
      {open && <BookingDialog booking={open} onClose={() => setOpen(null)} onSaved={(b) => setOpen(b)} />}
    </section>
  )
}

function Week({
  days,
  today,
  onPrev,
  onNext,
  onToday,
  onOpen,
}: {
  days: string[]
  today: string
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onOpen: (b: Booking) => void
}) {
  const { meta } = useSession()
  const { data, error, loading, reload } = useApi<{ rows: Booking[] }>(`/bookings?from=${days[0]}&to=${days[6]}`)
  const breed = useBreedNames()
  const hoursOf = (day: string) => meta.settings.hours?.find((h) => h.day === new Date(`${day}T00:00:00Z`).getUTCDay()) ?? null
  const active = (data?.rows ?? []).filter((b) => b.status === 'pending' || b.status === 'confirmed').length

  // The dialog edits a booking; reopening the week reloads it
  useEffect(() => {
    const on = () => reload()
    window.addEventListener('booking-saved', on)
    return () => window.removeEventListener('booking-saved', on)
  }, [reload])

  return (
    <div className="block">
      <div className="week-nav">
        <button type="button" className="btn btn-ghost btn-sm" onClick={onPrev}>
          <ChevronLeft size={16} aria-hidden /> สัปดาห์ก่อน
        </button>
        <p className="week-nav__label" aria-live="polite">
          {dayLabel(days[0])} ถึง {dayLabel(days[6], 'medium')}
        </p>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onNext}>
          สัปดาห์ถัดไป <ChevronRight size={16} aria-hidden />
        </button>
        {!days.includes(today) && (
          <button type="button" className="text-btn" onClick={onToday}>
            กลับไปสัปดาห์นี้
          </button>
        )}
      </div>
      {error && <ErrorNote message={error} onRetry={reload} />}
      {!data && !error && <Loading />}
      {data && (
        <>
          <p className="result-line">นัดที่ยังรออยู่ในสัปดาห์นี้ {num(active)} นัด</p>
          <ol className={`agenda ${loading ? 'is-reloading' : ''}`} aria-label="นัดหมายรายวัน">
            {days.map((day) => {
              const h = hoursOf(day)
              const rows = data.rows.filter((b) => b.date === day)
              return (
                <li key={day} className={`agenda__day ${day === today ? 'is-today' : ''} ${h ? '' : 'is-closed'}`}>
                  <div className="agenda__head">
                    <h2 className="agenda__date">
                      {weekdayDate(day)}
                      {day === today && ' (วันนี้)'}
                    </h2>
                    <span className="agenda__hours">{h ? `${h.open}–${h.close}` : 'ร้านปิด'}</span>
                  </div>
                  {rows.length === 0 ? (
                    <p className="agenda__none">ไม่มีนัด</p>
                  ) : (
                    <ul className="agenda__list">
                      {rows.map((b) => (
                        <li key={b.id}>
                          <button
                            type="button"
                            className={`agenda__item tone-${BOOKING_STATUS_TONE[b.status]} ${b.status === 'cancelled' ? 'is-faded' : ''}`}
                            onClick={() => onOpen(b)}
                            aria-haspopup="dialog"
                          >
                            <span className="agenda__time">{b.time} น.</span>
                            <span className="agenda__who">
                              <Words text={b.name} />
                            </span>
                            {b.refId && <span>{breed(b.refId)}</span>}
                            <span className="agenda__state">{BOOKING_STATUS_LABEL[b.status]}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ol>
        </>
      )}
    </div>
  )
}

function List({ onOpen }: { onOpen: (b: Booking) => void }) {
  const [range, setRange] = useState<'upcoming' | 'past'>('upcoming')
  const [status, setStatus] = useState<BookingStatus | ''>('')
  const today = bkkDay()
  const from = range === 'upcoming' ? today : addDays(today, -30)
  const to = range === 'upcoming' ? addDays(today, 30) : addDays(today, -1)
  const qs = new URLSearchParams({ from, to })
  if (status) qs.set('status', status)
  const { data, error, loading, reload } = useApi<{ rows: Booking[] }>(`/bookings?${qs}`)
  const breed = useBreedNames()
  const fid = useId()
  useEffect(() => {
    const on = () => reload()
    window.addEventListener('booking-saved', on)
    return () => window.removeEventListener('booking-saved', on)
  }, [reload])
  const rows = range === 'past' ? [...(data?.rows ?? [])].reverse() : (data?.rows ?? [])

  return (
    <div className="block">
      <div className="filters" role="search" aria-label="กรองนัดหมาย">
        <Segmented
          label="ช่วงเวลา"
          value={range}
          onChange={setRange}
          options={[
            { value: 'upcoming', label: '30 วันข้างหน้า' },
            { value: 'past', label: '30 วันที่ผ่านมา' },
          ]}
        />
        <div className="mini-field">
          <label htmlFor={fid}>สถานะ</label>
          <select id={fid} className="input input--sm" value={status} onChange={(e) => setStatus(e.target.value as BookingStatus | '')}>
            <option value="">ทุกสถานะ</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {BOOKING_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error && <ErrorNote message={error} onRetry={reload} />}
      {!data && !error && <Loading />}
      {data &&
        (rows.length === 0 ? (
          <p className="empty-line">ไม่มีนัดในช่วงนี้ ลูกค้าจองเวลาได้จากหน้าเว็บไซต์ หรือเปลี่ยนช่วงเวลาที่ดู</p>
        ) : (
          <div className={loading ? 'is-reloading' : undefined}>
            <TableWrap label="ตารางนัดหมาย">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">วันและเวลา</th>
                    <th scope="col">ผู้นัด</th>
                    <th scope="col">สนใจ</th>
                    <th scope="col">เบอร์โทร</th>
                    <th scope="col">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <button type="button" className="text-btn text-btn--link" onClick={() => onOpen(b)} aria-haspopup="dialog">
                          {dayLabel(b.date, 'medium')} {b.time} น.
                        </button>
                        <span className="cell-sub">{b.no}</span>
                      </td>
                      <td>
                        <Words text={b.name} />
                      </td>
                      <td>{b.refId ? breed(b.refId) : 'ยังไม่ระบุ'}</td>
                      <td className="nowrap">{b.phone || '–'}</td>
                      <td>
                        <BookingStatusBadge status={b.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          </div>
        ))}
    </div>
  )
}

function BookingDialog({ booking, onClose, onSaved }: { booking: Booking; onClose: () => void; onSaved: (b: Booking) => void }) {
  const toast = useToast()
  const breed = useBreedNames()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [moving, setMoving] = useState(false)
  const [note, setNote] = useState(booking.note ?? '')
  const id = useId()
  const b = booking
  const ended = b.status === 'done' || b.status === 'no-show' || b.status === 'cancelled'

  const patch = async (body: Record<string, unknown>, done: string) => {
    setBusy(true)
    setError(null)
    try {
      const next = await api<Booking>(`/bookings/${b.id}`, { method: 'PATCH', body })
      onSaved(next)
      window.dispatchEvent(new Event('booking-saved'))
      toast(done)
      setMoving(false)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open onClose={onClose} title={`นัด ${b.no}`}>
      <p>
        <BookingStatusBadge status={b.status} />
      </p>
      <dl className="facts">
        <div>
          <dt>วันและเวลา</dt>
          <dd>
            {dayLabel(b.date, 'long')} เวลา {b.time} น. ({num(b.durationMin)} นาที)
          </dd>
        </div>
        <div>
          <dt>ผู้นัด</dt>
          <dd>
            <Words text={b.name} />
          </dd>
        </div>
        <div>
          <dt>สนใจ</dt>
          <dd>{b.refId ? breed(b.refId) : 'ยังไม่ระบุสายพันธุ์'}</dd>
        </div>
        {b.note && (
          <div>
            <dt>หมายเหตุ</dt>
            <dd className="prewrap">{b.note}</dd>
          </div>
        )}
        <div>
          <dt>จองเมื่อ</dt>
          <dd>{dateTime(b.createdAt)}</dd>
        </div>
        {b.leadId && (
          <div>
            <dt>ลูกค้าที่สนใจ</dt>
            <dd>
              <Link to={`/leads/${b.leadId}`} onClick={onClose}>
                ดูประวัติการติดต่อ
              </Link>
            </dd>
          </div>
        )}
      </dl>
      <ContactLinks phone={b.phone} email={b.email} name={b.name} />

      {bookingActions(b.status).length > 0 && (
        <div className="step-buttons" role="group" aria-label="อัปเดตนัด">
          {bookingActions(b.status).map((s) => (
            <button key={s} type="button" className={s === 'confirmed' || s === 'done' ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'} disabled={busy} onClick={() => patch({ status: s }, `${BOOKING_ACTION_LABEL[s]}แล้ว`)}>
              {BOOKING_ACTION_LABEL[s]}
            </button>
          ))}
          {!ended && (
            <button type="button" className="btn btn-ghost btn-sm" aria-expanded={moving} onClick={() => setMoving((m) => !m)}>
              เลื่อนนัด
            </button>
          )}
        </div>
      )}

      {moving && <Reschedule booking={b} busy={busy} onSave={(date, time) => patch({ date, time }, `เลื่อนนัดเป็น ${dayLabel(date)} ${time} น. แล้ว`)} />}

      {!ended && (
        <div className="form">
          <Field label="หมายเหตุสำหรับทีม" htmlFor={`${id}-n`}>
            <textarea id={`${id}-n`} className="input" rows={2} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
          <div className="form__actions">
            <button type="button" className="btn btn-ghost btn-sm" disabled={busy || note === (b.note ?? '')} onClick={() => patch({ note }, 'บันทึกหมายเหตุแล้ว')}>
              บันทึกหมายเหตุ
            </button>
          </div>
        </div>
      )}
      {error && (
        <p className="form__error" role="alert">
          {error}
        </p>
      )}
    </Dialog>
  )
}

function Reschedule({ booking, busy, onSave }: { booking: Booking; busy: boolean; onSave: (date: string, time: string) => void }) {
  const [date, setDate] = useState(booking.date)
  const [time, setTime] = useState('')
  const slots = useApi<SlotDay>(`/bookings/slots?date=${date}`)
  const id = useId()
  const free = (slots.data?.slots ?? []).filter((s) => s.available || (date === booking.date && s.time === booking.time))
  return (
    <fieldset className="form__group">
      <legend>เลื่อนนัด</legend>
      <div className="form__row">
        <Field label="วันใหม่" htmlFor={`${id}-d`}>
          <input
            id={`${id}-d`}
            className="input"
            type="date"
            value={date}
            min={bkkDay()}
            onChange={(e) => {
              setDate(e.target.value)
              setTime('')
            }}
          />
        </Field>
        <Field label="เวลา" htmlFor={`${id}-t`} hint={slots.data && !slots.data.open ? 'ร้านปิดวันนี้ เลือกวันอื่น' : undefined} error={slots.error}>
          <select id={`${id}-t`} className="input" value={time} onChange={(e) => setTime(e.target.value)} disabled={!slots.data?.open}>
            <option value="">เลือกเวลา</option>
            {free.map((s) => (
              <option key={s.time} value={s.time}>
                {s.time} น.
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="form__actions">
        <button type="button" className="btn btn-primary btn-sm" disabled={busy || !time} onClick={() => onSave(date, time)}>
          ย้ายไปเวลานี้
        </button>
      </div>
    </fieldset>
  )
}

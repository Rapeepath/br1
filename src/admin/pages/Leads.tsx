// ลูกค้าที่สนใจ: everyone who got in touch from the brochure (inquiries, visit bookings, kitten reservations,
// PDPA requests), with the follow-up workflow, notes and the PDPA erasure.
import { useId, useMemo, useState, type FormEvent } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { ShieldAlert } from 'lucide-react'
import { api, useApi, type LeadDetail, type LeadList, type LeadView, type ListedProduct } from '../api'
import type { LeadKind, LeadStatus } from '../../../server/types.ts'
import { useSession, useToast } from '../context'
import { LEAD_KIND_LABEL, LEAD_STATUSES, LEAD_STATUS_LABEL, PICKUP_LABEL, PRIVACY_REQUEST_LABEL, nextLeadSteps } from '../crm'
import { BookingStatusBadge, ContactLinks, LeadStatusBadge, ReservationStatusBadge } from '../crmUi'
import { dateTime, dayLabel, num, shortDateTime } from '../format'
import { Badge, Dialog, ErrorNote, Field, Loading, PageHead, Pager, Segmented, TableWrap, Words, useDebounced } from '../ui'
import '../crm.css'

const PAGE = 25

/** "สนใจ" breed names from the catalogue ids a lead mentions */
export function useBreedNames(): (refId: string) => string {
  const products = useApi<ListedProduct[]>('/products')
  const names = useMemo(() => {
    const m = new Map<string, string>()
    for (const p of products.data ?? []) {
      if (p.refId && !m.has(p.refId)) m.set(p.refId, p.name.replace(/^ลูกแมว/, '').replace(/\s*เกรด\S+$/, ''))
    }
    return m
  }, [products.data])
  return (id) => names.get(id) ?? id
}

export function Leads() {
  const [params, setParams] = useSearchParams()
  const status = (params.get('status') ?? '') as LeadStatus | ''
  const kind = (params.get('kind') ?? '') as LeadKind | ''
  const [q, setQ] = useState(params.get('q') ?? '')
  const term = useDebounced(q, 250)
  const page = Number(params.get('page') ?? 1) || 1
  const fid = useId()

  const set = (k: string, v: string) => {
    const next = new URLSearchParams(params)
    if (v) next.set(k, v)
    else next.delete(k)
    if (k !== 'page') next.delete('page')
    setParams(next, { replace: true })
  }

  const qs = new URLSearchParams({ limit: String(PAGE), offset: String((page - 1) * PAGE) })
  if (status) qs.set('status', status)
  if (kind) qs.set('kind', kind)
  if (term.trim()) qs.set('q', term.trim())
  const { data, error, loading, reload } = useApi<LeadList>(`/leads?${qs}`)
  const breed = useBreedNames()
  const { meta } = useSession()
  const pages = data ? Math.max(1, Math.ceil(data.total / PAGE)) : 1
  const all = data ? LEAD_STATUSES.reduce((s, k) => s + (data.counts[k] ?? 0), 0) : 0

  return (
    <section className="page">
      <PageHead title="ลูกค้าที่สนใจ" lead="ทุกคนที่ติดต่อมาจากหน้าเว็บไซต์ ทั้งสอบถาม นัดชมลูกแมว จองลูกแมว และคำขอเรื่องข้อมูลส่วนบุคคล" />
      <div className="filters" role="search" aria-label="กรองลูกค้าที่สนใจ">
        <Segmented
          label="สถานะ"
          className="status-tabs"
          value={status || 'all'}
          onChange={(v) => set('status', v === 'all' ? '' : v)}
          options={[
            { value: 'all', label: `ทั้งหมด${data ? ` ${num(all)}` : ''}` },
            ...LEAD_STATUSES.map((s) => ({ value: s, label: `${LEAD_STATUS_LABEL[s]}${data ? ` ${num(data.counts[s] ?? 0)}` : ''}` })),
          ]}
        />
        <div className="mini-field">
          <label htmlFor={`${fid}-k`}>เรื่อง</label>
          <select id={`${fid}-k`} className="input input--sm" value={kind} onChange={(e) => set('kind', e.target.value)}>
            <option value="">ทุกเรื่อง</option>
            {(Object.keys(LEAD_KIND_LABEL) as LeadKind[])
              .filter((k) => k !== 'quote')
              .map((k) => (
                <option key={k} value={k}>
                  {LEAD_KIND_LABEL[k]}
                </option>
              ))}
          </select>
        </div>
        <div className="mini-field mini-field--grow">
          <label htmlFor={`${fid}-q`}>ค้นหา</label>
          <input id={`${fid}-q`} className="input input--sm" type="search" placeholder="ชื่อ เบอร์โทร อีเมล หรือเลขที่" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      {error && <ErrorNote message={error} onRetry={reload} />}
      {!data && !error && <Loading />}
      {data && (
        <div className={`page-body ${loading ? 'is-reloading' : ''}`}>
          <p className="result-line" aria-live="polite">
            พบ {num(data.total)} รายการ{status ? ` สถานะ${LEAD_STATUS_LABEL[status]}` : ''}
          </p>
          {data.rows.length === 0 ? (
            <p className="empty-line">ไม่มีรายการที่ตรงกับตัวกรองนี้ ลองเลือกสถานะทั้งหมดหรือล้างคำค้นหา</p>
          ) : (
            <TableWrap label="ตารางลูกค้าที่สนใจ">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">ผู้ติดต่อ</th>
                    <th scope="col">เรื่อง</th>
                    <th scope="col">ช่องทางติดต่อ</th>
                    <th scope="col">ติดต่อมาเมื่อ</th>
                    <th scope="col">ผู้ดูแล</th>
                    <th scope="col">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((l) => (
                    <tr key={l.id} className={l.kind === 'privacy' ? 'is-privacy' : undefined}>
                      <td>
                        <Link to={`/leads/${l.id}`}>
                          <Words text={l.name} />
                        </Link>
                        <span className="cell-sub">{l.no}</span>
                      </td>
                      <td>
                        <span className="lead-subject">
                          {l.kind === 'privacy' ? <Badge tone="lavender">PDPA {l.request ? PRIVACY_REQUEST_LABEL[l.request] : ''}</Badge> : <Badge tone="sky">{LEAD_KIND_LABEL[l.kind]}</Badge>}
                          {l.refIds.length > 0 && <span className="cell-sub">สนใจ {l.refIds.map(breed).join(', ')}</span>}
                          {l.message && <span className="lead-subject__msg">{l.message}</span>}
                        </span>
                      </td>
                      <td>
                        <span className="cell-phone">{l.phone || '–'}</span>
                        {l.lineId && <span className="cell-sub">LINE {l.lineId}</span>}
                      </td>
                      <td className="nowrap">{shortDateTime(l.createdAt)}</td>
                      <td>{l.assignee?.name ?? <span className="cell-sub">ยังไม่มอบหมาย</span>}</td>
                      <td>
                        <LeadStatusBadge status={l.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          )}
          <Pager page={page} pages={pages} onPage={(p) => set('page', String(p))} />
          <p className="field__hint">ข้อมูลทุกรายการได้รับความยินยอมตาม PDPA ตอนส่งแบบฟอร์ม {meta.settings.storeName} ใช้ข้อมูลเพื่อติดต่อกลับเท่านั้น</p>
        </div>
      )}
    </section>
  )
}

export function LeadPage() {
  const { id = '' } = useParams()
  const { data, error, reload, setData } = useApi<LeadDetail>(`/leads/${encodeURIComponent(id)}`)
  const breed = useBreedNames()

  if (error)
    return (
      <section className="page">
        <PageHead title="ไม่พบรายการนี้" />
        <ErrorNote message={error} onRetry={reload} />
        <Link to="/leads">กลับไปลูกค้าที่สนใจ</Link>
      </section>
    )
  if (!data)
    return (
      <section className="page">
        <Loading />
      </section>
    )

  const l = data.lead
  const update = (lead: LeadView) => setData({ ...data, lead })

  return (
    <section className="page">
      <p className="crumbs">
        <Link to="/leads">ลูกค้าที่สนใจ</Link>
      </p>
      <PageHead
        title={l.name}
        heading={<Words text={l.name} />}
        lead={
          <>
            {l.no} {LEAD_KIND_LABEL[l.kind]} เมื่อ {dateTime(l.createdAt)} <LeadStatusBadge status={l.status} />
          </>
        }
      />
      {l.anonymisedAt ? (
        <p className="wiped">ลบข้อมูลส่วนบุคคลตามคำขอแล้วเมื่อ {dateTime(l.anonymisedAt)} เหลือไว้เฉพาะวันที่และสถานะเพื่อการตรวจสอบ</p>
      ) : (
        <ContactLinks phone={l.phone} email={l.email} lineId={l.lineId} name={l.name} />
      )}

      <div className="grid-2 grid-2--wide-left">
        <div className="stack">
          <section className="panel pad" aria-labelledby="lead-facts">
            <h2 id="lead-facts" className="h3">
              รายละเอียด
            </h2>
            <dl className="facts">
              <div>
                <dt>เรื่อง</dt>
                <dd>
                  {LEAD_KIND_LABEL[l.kind]}
                  {l.request && ` (${PRIVACY_REQUEST_LABEL[l.request]})`}
                </dd>
              </div>
              {l.message && (
                <div>
                  <dt>ข้อความ</dt>
                  <dd className="prewrap">{l.message}</dd>
                </div>
              )}
              {l.refIds.length > 0 && (
                <div>
                  <dt>สนใจสายพันธุ์</dt>
                  <dd>{l.refIds.map(breed).join(', ')}</dd>
                </div>
              )}
              <div>
                <dt>เบอร์โทร</dt>
                <dd>{l.phone || '–'}</dd>
              </div>
              <div>
                <dt>อีเมล</dt>
                <dd>{l.email ?? '–'}</dd>
              </div>
              <div>
                <dt>LINE</dt>
                <dd>{l.lineId ?? '–'}</dd>
              </div>
              <div>
                <dt>ส่งจากหน้า</dt>
                <dd className="break">{l.page ?? '–'}</dd>
              </div>
              <div>
                <dt>ภาษาที่ใช้</dt>
                <dd>{l.lang === 'en' ? 'อังกฤษ' : 'ไทย'}</dd>
              </div>
              <div>
                <dt>ยินยอมให้ติดต่อ</dt>
                <dd>{dateTime(l.consentAt)}</dd>
              </div>
              <div>
                <dt>อัปเดตล่าสุด</dt>
                <dd>{dateTime(l.updatedAt)}</dd>
              </div>
            </dl>
          </section>

          {(data.booking || data.reservation) && (
            <section className="panel pad" aria-labelledby="lead-linked">
              <h2 id="lead-linked" className="h3">
                รายการที่เกี่ยวข้อง
              </h2>
              <dl className="facts">
                {data.booking && (
                  <div>
                    <dt>นัดหมาย {data.booking.no}</dt>
                    <dd>
                      <Link to={`/bookings?week=${data.booking.date}`}>
                        {dayLabel(data.booking.date, 'long')} เวลา {data.booking.time} น.
                      </Link>{' '}
                      <BookingStatusBadge status={data.booking.status} />
                    </dd>
                  </div>
                )}
                {data.reservation && (
                  <div>
                    <dt>การจอง {data.reservation.no}</dt>
                    <dd>
                      <Link to={`/reservations/${data.reservation.id}`}>ดูการจอง</Link> {PICKUP_LABEL[data.reservation.pickup]}{' '}
                      <ReservationStatusBadge status={data.reservation.status} />
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          )}

          <Notes lead={l} onSaved={update} />
        </div>

        <div className="stack">
          <Workflow lead={l} onSaved={update} />
          {l.kind === 'privacy' && <PrivacyPanel lead={l} onSaved={update} />}
          {l.kind !== 'privacy' && !l.anonymisedAt && <EraseLink lead={l} onSaved={update} />}
        </div>
      </div>
    </section>
  )
}

function Workflow({ lead, onSaved }: { lead: LeadView; onSaved: (l: LeadView) => void }) {
  const { meta } = useSession()
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const id = useId()
  const locked = !!lead.anonymisedAt

  const patch = async (body: Record<string, unknown>, done: string) => {
    setBusy(true)
    setError(null)
    try {
      onSaved(await api<LeadView>(`/leads/${lead.id}`, { method: 'PATCH', body }))
      toast(done)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const steps = nextLeadSteps(lead.status, lead.kind)
  return (
    <section className="panel pad workflow" aria-labelledby={`${id}-t`}>
      <h2 id={`${id}-t`} className="h3">
        การติดตาม
      </h2>
      <p>
        สถานะตอนนี้ <LeadStatusBadge status={lead.status} />
      </p>
      {!locked && steps.length > 0 && (
        <div className="step-buttons" role="group" aria-label="เปลี่ยนสถานะเป็น">
          {steps.map((s) => (
            <button key={s} type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => patch({ status: s }, `เปลี่ยนสถานะเป็น${LEAD_STATUS_LABEL[s]}แล้ว`)}>
              เป็น{LEAD_STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      )}
      <div className="form">
        <Field label="สถานะทั้งหมด" htmlFor={`${id}-s`}>
          <select id={`${id}-s`} className="input" value={lead.status} disabled={busy || locked} onChange={(e) => patch({ status: e.target.value }, `เปลี่ยนสถานะเป็น${LEAD_STATUS_LABEL[e.target.value as LeadStatus]}แล้ว`)}>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {LEAD_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="ผู้ดูแล" htmlFor={`${id}-a`}>
          <select
            id={`${id}-a`}
            className="input"
            value={lead.assignedTo ?? ''}
            disabled={busy || locked}
            onChange={(e) => patch({ assignedTo: e.target.value || null }, e.target.value ? `มอบหมายให้ ${meta.staff.find((s) => s.id === e.target.value)?.name ?? ''} แล้ว` : 'ยกเลิกการมอบหมายแล้ว')}
          >
            <option value="">ยังไม่มอบหมาย</option>
            {meta.staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.title})
              </option>
            ))}
          </select>
        </Field>
      </div>
      {error && (
        <p className="form__error" role="alert">
          {error}
        </p>
      )}
    </section>
  )
}

function Notes({ lead, onSaved }: { lead: LeadView; onSaved: (l: LeadView) => void }) {
  const toast = useToast()
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const id = useId()
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim()) {
      setError('พิมพ์บันทึกก่อนกดบันทึก')
      return
    }
    setBusy(true)
    setError(null)
    try {
      onSaved(await api<LeadView>(`/leads/${lead.id}`, { method: 'PATCH', body: { note: text } }))
      setText('')
      toast('บันทึกการติดตามแล้ว')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }
  const notes = [...lead.notes].reverse()
  return (
    <section className="panel pad" aria-labelledby={`${id}-t`}>
      <h2 id={`${id}-t`} className="h3">
        บันทึกการติดตาม ({num(lead.notes.length)})
      </h2>
      {!lead.anonymisedAt && (
        <form className="form" onSubmit={submit}>
          <Field label="บันทึกใหม่" htmlFor={`${id}-n`} hint="เช่น โทรแล้ว ลูกค้าขอดูลูกแมวเพศเมียวันเสาร์" error={error}>
            <textarea id={`${id}-n`} className="input" rows={3} maxLength={1000} value={text} onChange={(e) => setText(e.target.value)} />
          </Field>
          <div className="form__actions">
            <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>
              บันทึก
            </button>
          </div>
        </form>
      )}
      {notes.length === 0 ? (
        <p className="empty-line">ยังไม่มีบันทึก บันทึกทุกครั้งที่ติดต่อลูกค้า ทีมจะได้รู้ว่าคุยถึงไหนแล้ว</p>
      ) : (
        <ol className="timeline">
          {notes.map((n, i) => (
            <li key={`${n.at}-${i}`}>
              <span className="timeline__meta">
                {dateTime(n.at)} โดย {n.staffName}
              </span>
              <span className="timeline__text">{n.text}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

function EraseDialog({ lead, onClose, onSaved }: { lead: LeadView; onClose: () => void; onSaved: (l: LeadView) => void }) {
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const erase = async () => {
    setBusy(true)
    setError(null)
    try {
      onSaved(await api<LeadView>(`/leads/${lead.id}/anonymise`, { method: 'POST' }))
      toast(`ลบข้อมูลส่วนบุคคลของ ${lead.no} แล้ว`)
      onClose()
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }
  return (
    <Dialog open onClose={onClose} title="ลบข้อมูลส่วนบุคคล">
      <p>
        ชื่อ เบอร์โทร อีเมล LINE ข้อความ และบันทึกของ {lead.no} จะถูกแทนที่ด้วยข้อความ “ลบข้อมูลตามคำขอ” รวมถึงนัดหมายและการจองที่ผูกกับรายการนี้
        กู้คืนไม่ได้ วันที่และสถานะจะเหลือไว้เป็นหลักฐาน
      </p>
      {error && (
        <p className="form__error" role="alert">
          {error}
        </p>
      )}
      <div className="form__actions">
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          ยกเลิก
        </button>
        <button type="button" className="btn btn-primary" onClick={erase} disabled={busy}>
          ลบข้อมูลถาวร
        </button>
      </div>
    </Dialog>
  )
}

function PrivacyPanel({ lead, onSaved }: { lead: LeadView; onSaved: (l: LeadView) => void }) {
  const { isManager } = useSession()
  const [confirm, setConfirm] = useState(false)
  return (
    <section className="pdpa-box" aria-labelledby="pdpa-t">
      <p id="pdpa-t" className="pdpa-box__title">
        <ShieldAlert size={18} aria-hidden /> คำขอตาม พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล
      </p>
      <p>{lead.request ? PRIVACY_REQUEST_LABEL[lead.request] : 'คำขอเกี่ยวกับข้อมูลส่วนบุคคล'} ต้องตอบภายใน 30 วันนับจากวันที่ได้รับ ({dateTime(lead.createdAt)})</p>
      {lead.anonymisedAt ? (
        <p>ดำเนินการลบข้อมูลแล้ว</p>
      ) : isManager ? (
        <>
          <p>ถ้าเป็นคำขอให้ลบข้อมูล ตรวจตัวตนผู้ขอก่อน แล้วลบข้อมูลของรายการนี้ด้วยปุ่มด้านล่าง</p>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirm(true)}>
            ลบข้อมูลส่วนบุคคล
          </button>
        </>
      ) : (
        <p>ผู้จัดการเท่านั้นที่ลบข้อมูลส่วนบุคคลได้ ส่งต่อให้ผู้จัดการพร้อมบันทึกสิ่งที่ตรวจสอบแล้ว</p>
      )}
      {confirm && <EraseDialog lead={lead} onClose={() => setConfirm(false)} onSaved={onSaved} />}
    </section>
  )
}

/** Any person can ask to be forgotten, not only through the PDPA form */
function EraseLink({ lead, onSaved }: { lead: LeadView; onSaved: (l: LeadView) => void }) {
  const { isManager } = useSession()
  const [confirm, setConfirm] = useState(false)
  if (!isManager) return null
  return (
    <section className="panel pad" aria-labelledby="erase-t">
      <h2 id="erase-t" className="h3">
        ข้อมูลส่วนบุคคล
      </h2>
      <p className="field__hint">ถ้าลูกค้าขอให้ลบข้อมูลทางโทรศัพท์หรือ LINE ลบได้จากที่นี่</p>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirm(true)}>
        ลบข้อมูลส่วนบุคคล
      </button>
      {confirm && <EraseDialog lead={lead} onClose={() => setConfirm(false)} onSaved={onSaved} />}
    </section>
  )
}

// ลูกแมว: every kitten in the shop as itself, with its health record (vaccines, vet check, genetic tests),
// parents and price. Managers add kittens, edit prices and take one off sale; staff keep the records up to date.
import { useId, useMemo, useState, type FormEvent } from 'react'
import { Link, NavLink, useParams, useSearchParams } from 'react-router'
import { ExternalLink, Plus, Trash2 } from 'lucide-react'
import { api, useApi, type KittenDetail, type KittenRow, type ListedProduct } from '../api'
import type { GeneticResult, KittenStatus, KittenUnit } from '../../../server/types.ts'
import { useSession, useToast } from '../context'
import { GENETIC_LABEL, KITTEN_STATUS_LABEL, PICKUP_LABEL, SEX_LABEL, ageText, kittenBody, kittenProblems, type KittenDraft } from '../crm'
import { KittenStatusBadge, ReservationStatusBadge } from '../crmUi'
import { baht, bkkDay, dateTime, dayLabel, num } from '../format'
import { Badge, Dialog, Empty, ErrorNote, Field, Loading, Money, PageHead, Segmented, Stat, TableWrap, Words } from '../ui'
import '../crm.css'

export function CrmSubNav() {
  return (
    <nav className="subnav" aria-label="ลูกแมวและการจอง">
      <NavLink to="/kittens" end>
        ลูกแมวรายตัว
      </NavLink>
      <NavLink to="/reservations">การจอง</NavLink>
    </nav>
  )
}

const STATUSES = Object.keys(KITTEN_STATUS_LABEL) as KittenStatus[]

/** Kitten products (breed + grade) for the form's picker and the breed filter. */
function useKittenProducts() {
  const { data } = useApi<ListedProduct[]>('/products')
  return useMemo(() => (data ?? []).filter((p) => p.unitTracked), [data])
}

export function Kittens() {
  const { isManager } = useSession()
  const [params, setParams] = useSearchParams()
  const status = (params.get('status') ?? 'available') as KittenStatus | 'all'
  const breed = params.get('breed') ?? ''
  const qs = new URLSearchParams()
  if (status !== 'all') qs.set('status', status)
  if (breed) qs.set('breed', breed)
  const { data, error, loading, reload } = useApi<{ rows: KittenRow[] }>(`/kittens?${qs}`)
  const products = useKittenProducts()
  const [adding, setAdding] = useState(false)
  const fid = useId()
  const breeds = useMemo(() => {
    const m = new Map<string, string>()
    for (const p of products) if (p.refId && !m.has(p.refId)) m.set(p.refId, p.subtitle)
    return [...m]
  }, [products])
  const set = (k: string, v: string) => {
    const next = new URLSearchParams(params)
    if (v) next.set(k, v)
    else next.delete(k)
    setParams(next, { replace: true })
  }

  return (
    <section className="page">
      <PageHead
        title="ลูกแมว"
        lead="ลูกแมวทุกตัวในร้าน ประวัติวัคซีน ผลตรวจสุขภาพและพันธุกรรม พ่อแม่พันธุ์ และราคา"
        actions={
          isManager ? (
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setAdding(true)}>
              <Plus size={16} aria-hidden /> เพิ่มลูกแมว
            </button>
          ) : undefined
        }
      />
      <CrmSubNav />
      <div className="filters" role="search" aria-label="กรองลูกแมว">
        <Segmented
          label="สถานะ"
          value={status}
          onChange={(v) => set('status', v)}
          options={[{ value: 'all', label: 'ทั้งหมด' }, ...STATUSES.map((s) => ({ value: s, label: KITTEN_STATUS_LABEL[s] }))]}
        />
        <div className="mini-field">
          <label htmlFor={fid}>สายพันธุ์</label>
          <select id={fid} className="input input--sm" value={breed} onChange={(e) => set('breed', e.target.value)}>
            <option value="">ทุกสายพันธุ์</option>
            {breeds.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error && <ErrorNote message={error} onRetry={reload} />}
      {!data && !error && <Loading />}
      {data && (
        <div className={`page-body ${loading ? 'is-reloading' : ''}`}>
          <p className="result-line" aria-live="polite">
            {num(data.rows.length)} ตัว{status !== 'all' ? ` ${KITTEN_STATUS_LABEL[status]}` : ''}
          </p>
          {data.rows.length === 0 ? (
            <p className="empty-line">ไม่มีลูกแมวที่ตรงกับตัวกรองนี้</p>
          ) : (
            <KittenTable rows={data.rows} />
          )}
        </div>
      )}
      {adding && (
        <KittenForm
          products={products}
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false)
            reload()
          }}
        />
      )}
    </section>
  )
}

export function KittenTable({ rows, withProduct = true }: { rows: KittenRow[]; withProduct?: boolean }) {
  return (
    <TableWrap label="ตารางลูกแมว">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">ลูกแมว</th>
            {withProduct && <th scope="col">สายพันธุ์และเกรด</th>}
            <th scope="col">เพศและสี</th>
            <th scope="col">อายุ</th>
            <th scope="col" className="num">
              ราคา (บาท)
            </th>
            <th scope="col">สถานะ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((k) => (
            <tr key={k.id}>
              <td>
                <Link to={`/kittens/${k.id}`}>น้อง{k.name}</Link>
                <span className="cell-sub">{k.code}</span>
              </td>
              {withProduct && (
                <td>
                  <Words text={k.productName} />
                </td>
              )}
              <td>
                {SEX_LABEL[k.sex]}
                <span className="cell-sub">{k.color}</span>
              </td>
              <td className="nowrap">{ageText(k.birthDate)}</td>
              <td className="num">{baht(k.effectivePrice)}</td>
              <td>
                <KittenStatusBadge status={k.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrap>
  )
}

export function KittenPage() {
  const { id = '' } = useParams()
  const { isManager } = useSession()
  const { data, error, reload } = useApi<KittenDetail>(`/kittens/${encodeURIComponent(id)}`)
  const products = useKittenProducts()
  const [editing, setEditing] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)

  if (error)
    return (
      <section className="page">
        <PageHead title="ไม่พบลูกแมว" />
        <ErrorNote message={error} onRetry={reload} />
        <Link to="/kittens">กลับไปรายการลูกแมว</Link>
      </section>
    )
  if (!data)
    return (
      <section className="page">
        <Loading />
      </section>
    )

  const k = data.kitten
  const product = products.find((p) => p.id === k.productId)
  const image = product?.image
  const editable = k.status !== 'sold'

  return (
    <section className="page">
      <p className="crumbs">
        <Link to="/kittens">ลูกแมว</Link>
      </p>
      <div className="kitten-head">
        {image && <img className="kitten-head__img" src={`/${image.replace('-sm.', '.')}`} alt={`ภาพตัวอย่างสายพันธุ์${k.productName}`} width={220} height={165} />}
        <div className="kitten-head__text">
          <PageHead
            title={`น้อง${k.name}`}
            lead={
              <>
                {k.code} <Words text={k.productName} />
              </>
            }
            actions={
              <>
                {editable && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>
                    แก้ไขประวัติ
                  </button>
                )}
                {isManager && (k.status === 'available' || k.status === 'withdrawn') && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setWithdrawing(true)}>
                    {k.status === 'withdrawn' ? 'กลับมาเปิดขาย' : 'งดขายตัวนี้'}
                  </button>
                )}
                {(k.status === 'available' || k.status === 'reserved') && (
                  <a className="btn btn-ghost btn-sm" href={`/kittens/${k.id}`} target="_blank" rel="noreferrer">
                    <ExternalLink size={16} aria-hidden /> ดูบนเว็บไซต์<span className="visually-hidden"> (เปิดในแท็บใหม่)</span>
                  </a>
                )}
              </>
            }
          />
          <p className="product-head__chips">
            <KittenStatusBadge status={k.status} />
            {k.grade && <Badge tone="peach">{k.grade}</Badge>}
            {k.microchip ? <Badge tone="mint">ฝังไมโครชิปแล้ว</Badge> : <Badge tone="butter">ยังไม่ฝังไมโครชิป</Badge>}
          </p>
        </div>
      </div>

      <div className="stats">
        <Stat label="ราคา (รวม VAT)" value={<Money value={k.effectivePrice} />} note={k.price !== null ? `ราคาพิเศษเฉพาะตัวนี้ (ราคาปกติตาม SKU ${baht(product?.price ?? k.effectivePrice)} บาท)` : 'ตามราคาของ SKU'} />
        <Stat label="อายุ" value={ageText(k.birthDate)} note={`เกิด ${dayLabel(k.birthDate, 'medium')}`} />
        <Stat label="เพศและสี" value={SEX_LABEL[k.sex]} note={k.color} />
        <Stat label="ตรวจสุขภาพล่าสุด" value={k.vetCheckAt ? dayLabel(k.vetCheckAt, 'medium') : 'ยังไม่ได้ตรวจ'} note={`วัคซีน ${num(k.vaccines.length)} เข็ม`} />
      </div>

      <div className="grid-2">
        <section className="panel pad" aria-labelledby="k-facts">
          <h2 id="k-facts" className="h3">
            ข้อมูลลูกแมว
          </h2>
          <dl className="facts">
            <div>
              <dt>สินค้า (SKU)</dt>
              <dd>
                <Link to={`/products/${k.productId}`}>
                  <Words text={k.productName} />
                </Link>
              </dd>
            </div>
            <div>
              <dt>พ่อพันธุ์</dt>
              <dd>{k.sire || 'ไม่ระบุ'}</dd>
            </div>
            <div>
              <dt>แม่พันธุ์</dt>
              <dd>{k.dam || 'ไม่ระบุ'}</dd>
            </div>
            <div>
              <dt>ไมโครชิป</dt>
              <dd>{k.microchip ? 'ฝังแล้ว' : 'ยังไม่ฝัง'}</dd>
            </div>
            {k.reservationNo && (
              <div>
                <dt>ติดจอง</dt>
                <dd>{k.reservationNo}</dd>
              </div>
            )}
            {k.orderNo && (
              <div>
                <dt>ขายในบิล</dt>
                <dd>
                  <Link to={`/orders?q=${k.orderNo}&range=30`}>{k.orderNo}</Link>
                </dd>
              </div>
            )}
            {k.note && (
              <div>
                <dt>หมายเหตุ</dt>
                <dd className="prewrap">{k.note}</dd>
              </div>
            )}
            <div>
              <dt>อัปเดตล่าสุด</dt>
              <dd>{dateTime(k.updatedAt)}</dd>
            </div>
          </dl>
        </section>

        <div className="stack">
          <section className="panel pad" aria-labelledby="k-vax">
            <h2 id="k-vax" className="h3">
              วัคซีน
            </h2>
            {k.vaccines.length === 0 ? (
              <p className="empty-line">ยังไม่มีประวัติวัคซีน</p>
            ) : (
              <ul className="health-list">
                {k.vaccines.map((v, i) => (
                  <li key={`${v.name}-${i}`}>
                    <span className="health-list__name">{v.name}</span>
                    <span className="nowrap">{dayLabel(v.date, 'medium')}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="panel pad" aria-labelledby="k-dna">
            <h2 id="k-dna" className="h3">
              ผลตรวจพันธุกรรม
            </h2>
            {k.geneticTests.length === 0 ? (
              <p className="empty-line">สายพันธุ์นี้ไม่มีโรคทางพันธุกรรมที่ต้องตรวจเป็นประจำ</p>
            ) : (
              <ul className="health-list">
                {k.geneticTests.map((t, i) => (
                  <li key={`${t.name}-${i}`}>
                    <span className="health-list__name">{t.name}</span>
                    <GeneticBadge result={t.result} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <section className="block" aria-labelledby="k-res">
        <h2 id="k-res" className="h3">
          ประวัติการจอง ({num(data.reservations.length)})
        </h2>
        {data.reservations.length === 0 ? (
          <p className="empty-line">ยังไม่มีใครจองตัวนี้</p>
        ) : (
          <TableWrap label="ประวัติการจองของลูกแมวตัวนี้">
            <table className="table table--compact">
              <thead>
                <tr>
                  <th scope="col">เลขที่การจอง</th>
                  <th scope="col">ผู้จอง</th>
                  <th scope="col">รับลูกแมว</th>
                  <th scope="col">จองเมื่อ</th>
                  <th scope="col">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {data.reservations.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <Link to={`/reservations/${r.id}`}>{r.no}</Link>
                    </td>
                    <td>
                      <Words text={r.customer.name} />
                    </td>
                    <td>{PICKUP_LABEL[r.pickup]}</td>
                    <td className="nowrap">{dateTime(r.createdAt)}</td>
                    <td>
                      <ReservationStatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </section>

      {editing && (
        <KittenForm
          kitten={k}
          products={products}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false)
            reload()
          }}
        />
      )}
      {withdrawing && (
        <WithdrawDialog
          kitten={k}
          onClose={() => setWithdrawing(false)}
          onSaved={() => {
            setWithdrawing(false)
            reload()
          }}
        />
      )}
    </section>
  )
}

export function GeneticBadge({ result }: { result: GeneticResult }) {
  return <Badge tone={result === 'negative' ? 'mint' : result === 'carrier' ? 'butter' : 'lavender'}>{GENETIC_LABEL[result]}</Badge>
}

function WithdrawDialog({ kitten, onClose, onSaved }: { kitten: KittenRow; onClose: () => void; onSaved: () => void }) {
  const toast = useToast()
  const back = kitten.status === 'withdrawn'
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const id = useId()
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await api(`/kittens/${kitten.id}`, { method: 'PATCH', body: { status: back ? 'available' : 'withdrawn', reason: reason || undefined } })
      toast(back ? `น้อง${kitten.name}กลับมาเปิดขายแล้ว` : `งดขายน้อง${kitten.name}แล้ว`)
      onSaved()
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }
  return (
    <Dialog open onClose={onClose} title={back ? `เปิดขายน้อง${kitten.name}อีกครั้ง` : `งดขายน้อง${kitten.name}`}>
      <form className="form" onSubmit={submit}>
        <p>{back ? 'ลูกแมวจะกลับมาแสดงบนเว็บไซต์และขายที่หน้าร้านได้' : 'ลูกแมวจะหายจากหน้าเว็บไซต์และขายที่หน้าร้านไม่ได้ จนกว่าจะเปิดขายอีกครั้ง'}</p>
        <Field label={back ? 'เหตุผล (ไม่บังคับ)' : 'เหตุผล'} htmlFor={`${id}-r`} hint={back ? undefined : 'เช่น ป่วย รอผลตรวจ หรือเจ้าของฟาร์มขอเก็บไว้'}>
          <input id={`${id}-r`} className="input" value={reason} maxLength={200} onChange={(e) => setReason(e.target.value)} />
        </Field>
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
            {back ? 'เปิดขายอีกครั้ง' : 'งดขายตัวนี้'}
          </button>
        </div>
      </form>
    </Dialog>
  )
}

function draftOf(k: KittenUnit | undefined, productId: string): KittenDraft {
  return {
    productId: k?.productId ?? productId,
    name: k?.name ?? '',
    sex: k?.sex ?? 'female',
    color: k?.color ?? '',
    birthDate: k?.birthDate ?? '',
    microchip: k?.microchip ?? false,
    vaccines: k?.vaccines.map((v) => ({ ...v })) ?? [],
    vetCheckAt: k?.vetCheckAt ?? '',
    geneticTests: k?.geneticTests.map((t) => ({ ...t })) ?? [],
    sire: k?.sire ?? '',
    dam: k?.dam ?? '',
    price: k?.price != null ? String(k.price) : '',
    note: k?.note ?? '',
  }
}

/** Add a kitten (manager) or edit one's record; price changes need a manager. */
export function KittenForm({
  kitten,
  products,
  productId = '',
  onClose,
  onSaved,
}: {
  kitten?: KittenRow
  products: ListedProduct[]
  productId?: string
  onClose: () => void
  onSaved: (k: KittenUnit) => void
}) {
  const { isManager } = useSession()
  const toast = useToast()
  const [d, setD] = useState<KittenDraft>(() => draftOf(kitten, productId))
  const [problems, setProblems] = useState<Partial<Record<keyof KittenDraft, string>>>({})
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const id = useId()
  const set = <K extends keyof KittenDraft>(k: K, v: KittenDraft[K]) => setD((x) => ({ ...x, [k]: v }))
  const today = bkkDay()

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const found = kittenProblems(d, today)
    setProblems(found)
    if (Object.keys(found).length) {
      setError('แก้ช่องที่มีข้อความเตือนก่อนบันทึก')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const body = kittenBody(d)
      const saved = kitten
        ? await api<KittenUnit>(`/kittens/${kitten.id}`, { method: 'PATCH', body: { ...body, productId: undefined } })
        : await api<KittenUnit>('/kittens', { method: 'POST', body })
      toast(kitten ? `บันทึกประวัติน้อง${saved.name}แล้ว` : `เพิ่มน้อง${saved.name} (${saved.code}) แล้ว`)
      onSaved(saved)
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  return (
    <Dialog open onClose={onClose} title={kitten ? `แก้ไขประวัติน้อง${kitten.name}` : 'เพิ่มลูกแมว'} wide>
      <form className="form" onSubmit={submit} noValidate>
        {!kitten && (
          <Field label="สายพันธุ์และเกรด" htmlFor={`${id}-p`} error={problems.productId}>
            <select id={`${id}-p`} className="input" value={d.productId} onChange={(e) => set('productId', e.target.value)}>
              <option value="">เลือกสายพันธุ์และเกรด</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({baht(p.price)} บาท)
                </option>
              ))}
            </select>
          </Field>
        )}
        <div className="form__row">
          <Field label="ชื่อเรียก" htmlFor={`${id}-n`} error={problems.name} hint="ไม่ต้องพิมพ์คำว่าน้อง">
            <input id={`${id}-n`} className="input" value={d.name} maxLength={40} onChange={(e) => set('name', e.target.value)} />
          </Field>
          <Field label="เพศ" htmlFor={`${id}-s`}>
            <select id={`${id}-s`} className="input" value={d.sex} onChange={(e) => set('sex', e.target.value as KittenDraft['sex'])}>
              <option value="female">{SEX_LABEL.female}</option>
              <option value="male">{SEX_LABEL.male}</option>
            </select>
          </Field>
        </div>
        <div className="form__row">
          <Field label="สีขน" htmlFor={`${id}-c`} error={problems.color}>
            <input id={`${id}-c`} className="input" value={d.color} maxLength={80} onChange={(e) => set('color', e.target.value)} />
          </Field>
          <Field label="วันเกิด" htmlFor={`${id}-b`} error={problems.birthDate}>
            <input id={`${id}-b`} className="input" type="date" max={today} value={d.birthDate} onChange={(e) => set('birthDate', e.target.value)} />
          </Field>
        </div>
        <div className="form__row">
          <Field label="พ่อพันธุ์" htmlFor={`${id}-si`}>
            <input id={`${id}-si`} className="input" value={d.sire} maxLength={80} onChange={(e) => set('sire', e.target.value)} />
          </Field>
          <Field label="แม่พันธุ์" htmlFor={`${id}-da`}>
            <input id={`${id}-da`} className="input" value={d.dam} maxLength={80} onChange={(e) => set('dam', e.target.value)} />
          </Field>
        </div>

        <fieldset className="form__group">
          <legend>สุขภาพ</legend>
          <div className="form__row">
            <Field label="ตรวจสุขภาพล่าสุด" htmlFor={`${id}-v`}>
              <input id={`${id}-v`} className="input" type="date" max={today} value={d.vetCheckAt} onChange={(e) => set('vetCheckAt', e.target.value)} />
            </Field>
            <label className="check">
              <input type="checkbox" checked={d.microchip} onChange={(e) => set('microchip', e.target.checked)} />
              ฝังไมโครชิปแล้ว
            </label>
          </div>
          <div className="repeat-rows" role="group" aria-label="ประวัติวัคซีน">
            <p className="field__label">วัคซีน</p>
            {d.vaccines.map((v, i) => (
              <div key={i} className="repeat-row">
                <div className="mini-field">
                  <label htmlFor={`${id}-vn${i}`}>ชื่อวัคซีนเข็มที่ {i + 1}</label>
                  <input id={`${id}-vn${i}`} className="input input--sm" value={v.name} onChange={(e) => set('vaccines', d.vaccines.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                </div>
                <div className="mini-field">
                  <label htmlFor={`${id}-vd${i}`}>วันที่ฉีดเข็มที่ {i + 1}</label>
                  <input id={`${id}-vd${i}`} className="input input--sm" type="date" max={today} value={v.date} onChange={(e) => set('vaccines', d.vaccines.map((x, j) => (j === i ? { ...x, date: e.target.value } : x)))} />
                </div>
                <button type="button" className="icon-btn icon-btn--sm" onClick={() => set('vaccines', d.vaccines.filter((_, j) => j !== i))} aria-label={`ลบวัคซีนเข็มที่ ${i + 1}`}>
                  <Trash2 size={17} aria-hidden />
                </button>
              </div>
            ))}
            {problems.vaccines && (
              <p className="field__error" role="alert">
                {problems.vaccines}
              </p>
            )}
            <button type="button" className="text-btn text-btn--link" onClick={() => set('vaccines', [...d.vaccines, { name: '', date: '' }])}>
              <Plus size={15} aria-hidden /> เพิ่มวัคซีน
            </button>
          </div>
          <div className="repeat-rows" role="group" aria-label="ผลตรวจพันธุกรรม">
            <p className="field__label">ผลตรวจพันธุกรรม</p>
            {d.geneticTests.map((t, i) => (
              <div key={i} className="repeat-row">
                <div className="mini-field">
                  <label htmlFor={`${id}-gn${i}`}>รายการตรวจที่ {i + 1}</label>
                  <input id={`${id}-gn${i}`} className="input input--sm" value={t.name} onChange={(e) => set('geneticTests', d.geneticTests.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                </div>
                <div className="mini-field">
                  <label htmlFor={`${id}-gr${i}`}>ผลตรวจที่ {i + 1}</label>
                  <select
                    id={`${id}-gr${i}`}
                    className="input input--sm"
                    value={t.result}
                    onChange={(e) => set('geneticTests', d.geneticTests.map((x, j) => (j === i ? { ...x, result: e.target.value as GeneticResult } : x)))}
                  >
                    {(Object.keys(GENETIC_LABEL) as GeneticResult[]).map((r) => (
                      <option key={r} value={r}>
                        {GENETIC_LABEL[r]}
                      </option>
                    ))}
                  </select>
                </div>
                <button type="button" className="icon-btn icon-btn--sm" onClick={() => set('geneticTests', d.geneticTests.filter((_, j) => j !== i))} aria-label={`ลบรายการตรวจที่ ${i + 1}`}>
                  <Trash2 size={17} aria-hidden />
                </button>
              </div>
            ))}
            <button type="button" className="text-btn text-btn--link" onClick={() => set('geneticTests', [...d.geneticTests, { name: '', result: 'not-tested' }])}>
              <Plus size={15} aria-hidden /> เพิ่มรายการตรวจ
            </button>
          </div>
        </fieldset>

        <div className="form__row">
          <Field
            label="ราคาพิเศษเฉพาะตัวนี้ (บาท)"
            htmlFor={`${id}-pr`}
            error={problems.price}
            hint={isManager ? 'เว้นว่างไว้เพื่อใช้ราคาของ SKU' : 'ผู้จัดการเท่านั้นที่เปลี่ยนราคาได้'}
          >
            <input id={`${id}-pr`} className="input" inputMode="decimal" value={d.price} disabled={!isManager} onChange={(e) => set('price', e.target.value)} />
          </Field>
          <Field label="หมายเหตุ" htmlFor={`${id}-no`}>
            <input id={`${id}-no`} className="input" value={d.note} maxLength={300} onChange={(e) => set('note', e.target.value)} />
          </Field>
        </div>
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
            {kitten ? 'บันทึกประวัติ' : 'เพิ่มลูกแมว'}
          </button>
        </div>
      </form>
    </Dialog>
  )
}

/** On a kitten SKU's product page: the kittens themselves, in place of bulk stock forms. */
export function ProductKittens({ product, onChanged }: { product: ListedProduct; onChanged?: () => void }) {
  const { isManager } = useSession()
  const { data, error, reload } = useApi<{ rows: KittenRow[] }>(`/kittens?breed=${encodeURIComponent(product.refId ?? '')}`)
  const products = useKittenProducts()
  const [adding, setAdding] = useState(false)
  const rows = (data?.rows ?? []).filter((k) => k.productId === product.id)
  const open = rows.filter((k) => k.status === 'available' || k.status === 'reserved')
  return (
    <section className="panel pad" aria-labelledby="pk-t">
      <h2 id="pk-t" className="h3">
        ลูกแมวของ SKU นี้
      </h2>
      <p className="field__hint">สต็อกนับจากลูกแมวที่พร้อมขายทีละตัว จึงรับเข้าหรือปรับยอดรวมไม่ได้ เพิ่มลูกแมวใหม่หรืองดขายตัวที่ไม่พร้อมแทน</p>
      {error && <ErrorNote message={error} onRetry={reload} />}
      {data && open.length === 0 && <Empty title="ไม่มีลูกแมวที่พร้อมขายหรือติดจอง">{isManager ? 'เพิ่มลูกแมวตัวใหม่เมื่อรับเข้าร้าน' : 'แจ้งผู้จัดการเมื่อมีลูกแมวตัวใหม่เข้าร้าน'}</Empty>}
      {open.length > 0 && (
        <ul className="kitten-mini" aria-label="ลูกแมวที่พร้อมขายและติดจอง">
          {open.map((k) => (
            <li key={k.id}>
              <span className="kitten-mini__who">
                <Link to={`/kittens/${k.id}`}>น้อง{k.name}</Link>
                <span className="kitten-mini__meta">
                  {k.code} {SEX_LABEL[k.sex]} {k.color} อายุ {ageText(k.birthDate)}
                </span>
              </span>
              <KittenStatusBadge status={k.status} />
            </li>
          ))}
        </ul>
      )}
      <div className="form__actions">
        <Link to={`/kittens?breed=${product.refId ?? ''}&status=all`} className="btn btn-ghost btn-sm">
          ดูทุกตัวรวมที่ขายแล้ว
        </Link>
        {isManager && (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setAdding(true)}>
            <Plus size={16} aria-hidden /> เพิ่มลูกแมว
          </button>
        )}
      </div>
      {adding && (
        <KittenForm
          products={products}
          productId={product.id}
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false)
            reload()
            onChanged?.()
          }}
        />
      )}
    </section>
  )
}

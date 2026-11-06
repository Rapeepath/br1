import { useId, useMemo, useState, type FormEvent } from 'react'
import { Link, NavLink, useParams, useSearchParams } from 'react-router'
import { api, useApi, type ListedProduct, type Paged, type Product, type ProductDetail, type StockMovement } from '../api'
import { useSession, useToast } from '../context'
import { MOVEMENT_LABEL, baht, bahtText, dateTime, num, percent } from '../format'
import { BreedRecord } from '../BreedRecord'
import { Badge, ErrorNote, Field, Loading, Money, PageHead, Pager, Segmented, Stat, TableWrap, Words, parseAmount } from '../ui'
import { ProductKittens } from './Kittens'
import { StatusBadge } from './Orders'

function SubNav() {
  return (
    <nav className="subnav" aria-label="สินค้าและสต็อก">
      <NavLink to="/products" end>
        รายการสินค้า
      </NavLink>
      <NavLink to="/stock">ความเคลื่อนไหวสต็อก</NavLink>
    </nav>
  )
}

export function StockBadge({ p }: { p: Pick<Product, 'trackStock' | 'stock' | 'reorderLevel'> }) {
  if (!p.trackStock) return <Badge tone="lavender">ไม่นับสต็อก</Badge>
  if (p.stock === 0) return <Badge tone="rose">หมด</Badge>
  if (p.stock <= p.reorderLevel) return <Badge tone="butter">ใกล้หมด เหลือ {num(p.stock)}</Badge>
  return <Badge tone="mint">มี {num(p.stock)}</Badge>
}

const margin = (p: Pick<Product, 'price' | 'cost'>, vatRate: number) => {
  const net = p.price / (1 + vatRate / 100)
  return net > 0 ? ((net - p.cost) / net) * 100 : 0
}

export function Products() {
  const { meta } = useSession()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const cat = params.get('category') ?? 'all'
  const stock = params.get('stock') ?? 'all'
  const { data, error, reload } = useApi<ListedProduct[]>('/products')
  const qId = useId()
  const set = (k: string, v: string) => {
    const next = new URLSearchParams(params)
    if (v === 'all') next.delete(k)
    else next.set(k, v)
    setParams(next, { replace: true })
  }

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase()
    return (data ?? [])
      .filter((p) => cat === 'all' || p.categoryId === cat)
      .filter((p) => stock === 'all' || (stock === 'low' ? p.trackStock && p.stock <= p.reorderLevel : p.trackStock && p.stock === 0))
      .filter((p) => !t || `${p.name} ${p.subtitle} ${p.sku}`.toLowerCase().includes(t))
  }, [data, q, cat, stock])

  const catLabel = (id: string) => meta.categories.find((c) => c.id === id)?.label ?? id
  const value = rows.filter((p) => p.trackStock).reduce((s, p) => s + p.stock * p.cost, 0)

  return (
    <section className="page">
      <PageHead title="สินค้าและสต็อก" lead="ราคา ต้นทุน สต็อกคงเหลือ และยอดขายของสินค้าทุกรายการ" />
      <SubNav />
      <div className="filters" role="search" aria-label="กรองสินค้า">
        <Segmented
          label="หมวด"
          value={cat}
          onChange={(v) => set('category', v)}
          options={[{ value: 'all', label: 'ทุกหมวด' }, ...meta.categories.map((c) => ({ value: c.id, label: c.label }))]}
        />
        <Segmented
          label="สต็อก"
          value={stock}
          onChange={(v) => set('stock', v)}
          options={[
            { value: 'all', label: 'ทั้งหมด' },
            { value: 'low', label: 'ใกล้หมด' },
            { value: 'out', label: 'หมดแล้ว' },
          ]}
        />
        <div className="mini-field mini-field--grow">
          <label htmlFor={qId}>ค้นหา</label>
          <input id={qId} className="input input--sm" type="search" placeholder="ชื่อ สายพันธุ์ หรือ SKU" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      {error && <ErrorNote message={error} onRetry={reload} />}
      {!data && !error && <Loading />}
      {data && (
        <>
          <p className="result-line">
            {num(rows.length)} รายการ มูลค่าสต็อกตามทุน {bahtText(value)}
          </p>
          <TableWrap label="ตารางสินค้า">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">สินค้า</th>
                  <th scope="col">SKU</th>
                  <th scope="col">หมวด</th>
                  <th scope="col" className="num">
                    ราคาขาย
                  </th>
                  <th scope="col" className="num">
                    ต้นทุน
                  </th>
                  <th scope="col" className="num">
                    กำไรต่อชิ้น
                  </th>
                  <th scope="col">สต็อก</th>
                  <th scope="col" className="num">
                    ขายแล้ว
                  </th>
                  <th scope="col" className="num">
                    ยอดขาย (บาท)
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className={p.active ? undefined : 'is-off'}>
                    <td>
                      <span className="cell-product">
                        {p.image ? <img src={`/${p.image}`} alt="" width={40} height={40} loading="lazy" /> : <span className="cell-product__ph" aria-hidden="true" />}
                        <span>
                          <Link to={`/products/${p.id}`}>
                            <Words text={p.name} />
                          </Link>
                          <span className="cell-sub">
                            <Words text={p.subtitle} />
                            {!p.active && ' (ปิดการขาย)'}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td className="nowrap">{p.sku}</td>
                    <td>{catLabel(p.categoryId)}</td>
                    <td className="num">{baht(p.price)}</td>
                    <td className="num">{baht(p.cost)}</td>
                    <td className="num">{percent(margin(p, meta.settings.vatRate))}</td>
                    <td>
                      <StockBadge p={p} />
                    </td>
                    <td className="num">{num(p.sold)}</td>
                    <td className="num">{baht(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        </>
      )}
    </section>
  )
}

export function ProductPage() {
  const { id = '' } = useParams()
  const { meta, isManager, staff } = useSession()
  const { data, error, reload } = useApi<ProductDetail>(`/products/${encodeURIComponent(id)}`)

  if (error)
    return (
      <section className="page">
        <PageHead title="ไม่พบสินค้า" />
        <ErrorNote message={error} onRetry={reload} />
        <Link to="/products">กลับไปรายการสินค้า</Link>
      </section>
    )
  if (!data)
    return (
      <section className="page">
        <Loading />
      </section>
    )

  const p = data.product
  const staffName = (sid: string | null) => meta.staff.find((s) => s.id === sid)?.name ?? '–'
  const cat = meta.categories.find((c) => c.id === p.categoryId)

  return (
    <section className="page">
      <p className="crumbs">
        <Link to="/products">สินค้าและสต็อก</Link>
      </p>
      <div className="product-head">
        {p.image && <img className="product-head__img" src={`/${p.image.replace('-sm.', '.')}`} alt={`ภาพตัวอย่าง${p.name}`} width={320} height={240} />}
        <div className="product-head__text">
          <PageHead title={p.name} heading={<Words text={p.name} />} lead={`${p.subtitle} รหัส ${p.sku} หมวด${cat?.label ?? ''}`} />
          <p className="product-head__chips">
            <StockBadge p={p} />
            {p.active ? <Badge tone="mint">เปิดขาย</Badge> : <Badge tone="rose">ปิดการขาย</Badge>}
            {p.variant && <Badge tone="peach">{p.variant}</Badge>}
          </p>
        </div>
      </div>

      <div className="stats">
        <Stat label="ราคาขาย (รวม VAT)" value={<Money value={p.price} />} note={`ต้นทุน ${baht(p.cost)} บาท กำไร ${percent(margin(p, meta.settings.vatRate))} ของราคาก่อน VAT`} />
        <Stat label="สต็อกคงเหลือ" value={p.trackStock ? `${num(p.stock)} ${p.unit}` : 'ไม่นับสต็อก'} note={p.unitTracked ? `ลูกแมวที่พร้อมขาย นับทีละตัว มูลค่าทุน ${baht(p.stock * p.cost)} บาท` : p.trackStock ? `จุดสั่งซื้อ ${num(p.reorderLevel)} ${p.unit} มูลค่าทุน ${baht(p.stock * p.cost)} บาท` : 'บริการขายได้ไม่จำกัด'} />
        <Stat label="ขายแล้วทั้งหมด" value={`${num(p.sold)} ${p.unit}`} note={p.lastSoldAt ? `ขายล่าสุด ${dateTime(p.lastSoldAt)}` : 'ยังไม่เคยขาย'} />
        <Stat label="ยอดขายสะสม" value={<Money value={p.revenue} />} note={`ปรับปรุงล่าสุด ${dateTime(p.updatedAt)}`} />
      </div>

      <div className="grid-2">
        <section className="panel pad" aria-labelledby="facts">
          <h2 id="facts" className="h3">
            ข้อมูลสินค้า
          </h2>
          <dl className="facts">
            {p.facts.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
            <div>
              <dt>หน่วยขาย</dt>
              <dd>{p.unit}</dd>
            </div>
            <div>
              <dt>รหัสในระบบ</dt>
              <dd>{p.id}</dd>
            </div>
            <div>
              <dt>เพิ่มเข้าระบบ</dt>
              <dd>{dateTime(p.createdAt)}</dd>
            </div>
          </dl>
        </section>
        <div className="stack">
          <EditProduct p={p} canEdit={isManager} onSaved={reload} />
          {p.trackStock && !p.unitTracked && <StockForms p={p} needsPin={!isManager} staffName={staff.name} onDone={reload} />}
          {p.unitTracked && <ProductKittens product={p} onChanged={reload} />}
        </div>
      </div>

      {p.trackStock && (
        <section className="block" aria-labelledby="card">
          <h2 id="card" className="h3">
            บัตรสต็อก ({num(data.movements.length)} รายการ)
          </h2>
          <MovementTable rows={data.movements} staffName={staffName} />
        </section>
      )}

      <section className="block" aria-labelledby="sales">
        <h2 id="sales" className="h3">
          การขายล่าสุด
        </h2>
        {data.sales.length === 0 ? (
          <p className="empty-line">ยังไม่มีบิลที่ขายสินค้านี้</p>
        ) : (
          <TableWrap label="การขายล่าสุดของสินค้านี้">
            <table className="table table--compact">
              <thead>
                <tr>
                  <th scope="col">เลขที่บิล</th>
                  <th scope="col">วันเวลา</th>
                  <th scope="col">ลูกค้า</th>
                  <th scope="col" className="num">
                    จำนวน
                  </th>
                  <th scope="col" className="num">
                    ยอดรายการ (บาท)
                  </th>
                  <th scope="col">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {data.sales.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <Link to={`/orders/${s.id}`}>{s.no}</Link>
                    </td>
                    <td className="nowrap">{dateTime(s.createdAt)}</td>
                    <td>
                      <Words text={s.customerName ?? 'ลูกค้าทั่วไป'} />
                    </td>
                    <td className="num">{num(s.line.qty)}</td>
                    <td className="num">{baht(s.line.total)}</td>
                    <td>
                      <StatusBadge status={s.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </section>

      {data.record && <BreedRecord record={data.record} />}
    </section>
  )
}

function EditProduct({ p, canEdit, onSaved }: { p: ListedProduct; canEdit: boolean; onSaved: () => void }) {
  const toast = useToast()
  const [price, setPrice] = useState(String(p.price))
  const [cost, setCost] = useState(String(p.cost))
  const [level, setLevel] = useState(String(p.reorderLevel))
  const [active, setActive] = useState(p.active)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const id = useId()

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await api<Product>(`/products/${p.id}`, {
        method: 'PATCH',
        body: { price: parseAmount(price), cost: parseAmount(cost), reorderLevel: parseAmount(level), active },
      })
      toast(`บันทึกข้อมูล ${p.name} แล้ว`)
      onSaved()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="panel pad form" onSubmit={submit} aria-labelledby={`${id}-t`}>
      <h2 id={`${id}-t`} className="h3">
        ราคาและการขาย
      </h2>
      {!canEdit && <p className="form__lock">ผู้จัดการเท่านั้นที่แก้ราคา ต้นทุน และเปิดปิดการขายได้</p>}
      <fieldset className="form__row" disabled={!canEdit}>
        <legend className="visually-hidden">ราคาและการขาย</legend>
        <Field label="ราคาขาย (บาท)" htmlFor={`${id}-p`}>
          <input id={`${id}-p`} className="input" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
        </Field>
        <Field label="ต้นทุน (บาท)" htmlFor={`${id}-c`}>
          <input id={`${id}-c`} className="input" inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value)} />
        </Field>
        {p.trackStock && (
          <Field label="จุดสั่งซื้อ" htmlFor={`${id}-l`} hint="เตือนใกล้หมดเมื่อสต็อกเหลือเท่านี้">
            <input id={`${id}-l`} className="input" inputMode="numeric" value={level} onChange={(e) => setLevel(e.target.value)} />
          </Field>
        )}
        <label className="check">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          เปิดขายที่หน้าร้าน
        </label>
      </fieldset>
      {error && (
        <p className="form__error" role="alert">
          {error}
        </p>
      )}
      {canEdit && (
        <div className="form__actions">
          <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>
            บันทึกราคา
          </button>
        </div>
      )}
    </form>
  )
}

function StockForms({ p, needsPin, staffName, onDone }: { p: ListedProduct; needsPin: boolean; staffName: string; onDone: () => void }) {
  const toast = useToast()
  const [qty, setQty] = useState('')
  const [note, setNote] = useState('')
  const [counted, setCounted] = useState('')
  const [reason, setReason] = useState('')
  const [pin, setPin] = useState('')
  const [err1, setErr1] = useState<string | null>(null)
  const [err2, setErr2] = useState<string | null>(null)
  const id = useId()

  const receive = async (e: FormEvent) => {
    e.preventDefault()
    setErr1(null)
    try {
      const r = await api<Product>(`/products/${p.id}/receive`, { method: 'POST', body: { qty: parseAmount(qty), note } })
      toast(`รับเข้า ${p.name} ${qty} ${p.unit} คงเหลือ ${r.stock}`)
      setQty('')
      setNote('')
      onDone()
    } catch (err) {
      setErr1((err as Error).message)
    }
  }

  const adjust = async (e: FormEvent) => {
    e.preventDefault()
    setErr2(null)
    try {
      const r = await api<Product>(`/products/${p.id}/adjust`, {
        method: 'POST',
        body: { counted: parseAmount(counted), note: reason, managerPin: needsPin ? pin : undefined },
      })
      toast(`ปรับสต็อก ${p.name} เป็น ${r.stock} ${p.unit} แล้ว`)
      setCounted('')
      setReason('')
      setPin('')
      onDone()
    } catch (err) {
      setErr2((err as Error).message)
    }
  }

  const diff = counted === '' ? null : parseAmount(counted) - p.stock

  return (
    <>
      <form className="panel pad form" onSubmit={receive} aria-labelledby={`${id}-r`}>
        <h2 id={`${id}-r`} className="h3">
          รับสินค้าเข้า
        </h2>
        <div className="form__row">
          <Field label={`จำนวนที่รับ (${p.unit})`} htmlFor={`${id}-q`}>
            <input id={`${id}-q`} className="input" inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value)} required />
          </Field>
          <Field label="หมายเหตุ (ไม่บังคับ)" htmlFor={`${id}-n`}>
            <input id={`${id}-n`} className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="เช่น ลูกแมวครอกใหม่จากฟาร์ม" />
          </Field>
        </div>
        {err1 && (
          <p className="form__error" role="alert">
            {err1}
          </p>
        )}
        <div className="form__actions">
          <button type="submit" className="btn btn-primary btn-sm">
            บันทึกรับเข้า
          </button>
        </div>
      </form>

      <form className="panel pad form" onSubmit={adjust} aria-labelledby={`${id}-a`}>
        <h2 id={`${id}-a`} className="h3">
          ตรวจนับสต็อก
        </h2>
        <p className="form__lead">
          ในระบบมี {num(p.stock)} {p.unit} ใส่จำนวนที่นับได้จริง ระบบจะบันทึกส่วนต่างพร้อมชื่อ {staffName}
        </p>
        <div className="form__row">
          <Field
            label={`นับได้ (${p.unit})`}
            htmlFor={`${id}-c`}
            hint={diff === null || !Number.isFinite(diff) ? undefined : diff === 0 ? 'ตรงกับในระบบ' : `ส่วนต่าง ${diff > 0 ? '+' : ''}${diff} ${p.unit}`}
          >
            <input id={`${id}-c`} className="input" inputMode="numeric" value={counted} onChange={(e) => setCounted(e.target.value)} required />
          </Field>
          <Field label="เหตุผล" htmlFor={`${id}-w`}>
            <input id={`${id}-w`} className="input" value={reason} onChange={(e) => setReason(e.target.value)} required placeholder="เช่น นับสต็อกประจำเดือน" />
          </Field>
          {needsPin && (
            <Field label="รหัส PIN ผู้จัดการ" htmlFor={`${id}-m`} hint="รหัสทดลอง 1111">
              <input id={`${id}-m`} className="input" type="password" inputMode="numeric" autoComplete="off" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} required />
            </Field>
          )}
        </div>
        {err2 && (
          <p className="form__error" role="alert">
            {err2}
          </p>
        )}
        <div className="form__actions">
          <button type="submit" className="btn btn-ghost btn-sm">
            บันทึกผลนับ
          </button>
        </div>
      </form>
    </>
  )
}

function MovementTable({ rows, staffName, withProduct }: { rows: (StockMovement & { productName?: string })[]; staffName: (id: string | null) => string; withProduct?: boolean }) {
  if (!rows.length) return <p className="empty-line">ยังไม่มีความเคลื่อนไหว</p>
  return (
    <TableWrap label="ความเคลื่อนไหวสต็อก">
      <table className="table table--compact">
        <thead>
          <tr>
            <th scope="col">วันเวลา</th>
            {withProduct && <th scope="col">สินค้า</th>}
            <th scope="col">ประเภท</th>
            <th scope="col" className="num">
              เข้า/ออก
            </th>
            <th scope="col" className="num">
              คงเหลือ
            </th>
            <th scope="col">อ้างอิง</th>
            <th scope="col">ผู้ทำรายการ</th>
            <th scope="col">หมายเหตุ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((m) => (
            <tr key={m.id}>
              <td className="nowrap">{dateTime(m.at)}</td>
              {withProduct && (
                <td>
                  <Link to={`/products/${m.productId}`}>
                    <Words text={m.productName ?? m.productId} />
                  </Link>
                </td>
              )}
              <td>{MOVEMENT_LABEL[m.type]}</td>
              <td className={`num ${m.qty > 0 ? 'is-in' : 'is-out'}`}>{m.qty > 0 ? `+${num(m.qty)}` : `−${num(Math.abs(m.qty))}`}</td>
              <td className="num">{num(m.balance)}</td>
              <td>{m.ref ? <Link to={`/orders/${m.ref}`}>{m.ref}</Link> : '–'}</td>
              <td>{staffName(m.staffId)}</td>
              <td>{m.note ?? '–'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrap>
  )
}

const PAGE = 50

export function StockMovements() {
  const { meta } = useSession()
  const [type, setType] = useState('all')
  const [page, setPage] = useState(1)
  const { data, error, reload } = useApi<Paged<StockMovement & { productName: string }>>(`/stock/movements?limit=1000${type === 'all' ? '' : `&type=${type}`}`)
  const staffName = (sid: string | null) => meta.staff.find((s) => s.id === sid)?.name ?? '–'
  const rows = data?.rows ?? []
  const pages = Math.max(1, Math.ceil(rows.length / PAGE))
  return (
    <section className="page">
      <PageHead title="ความเคลื่อนไหวสต็อก" lead="ทุกการขาย คืนสินค้า รับเข้า และตรวจนับ พร้อมยอดคงเหลือหลังแต่ละรายการ" />
      <SubNav />
      <div className="filters">
        <Segmented
          label="ประเภท"
          value={type}
          onChange={(v) => {
            setType(v)
            setPage(1)
          }}
          options={[{ value: 'all', label: 'ทั้งหมด' }, ...Object.entries(MOVEMENT_LABEL).map(([value, label]) => ({ value, label }))]}
        />
      </div>
      {error && <ErrorNote message={error} onRetry={reload} />}
      {!data && !error && <Loading />}
      {data && (
        <>
          <p className="result-line">
            {num(data.total)} รายการ{data.total > rows.length && ` (แสดงล่าสุด ${num(rows.length)} รายการ)`}
          </p>
          <MovementTable rows={rows.slice((page - 1) * PAGE, page * PAGE)} staffName={staffName} withProduct />
          <Pager page={page} pages={pages} onPage={setPage} />
        </>
      )}
    </section>
  )
}

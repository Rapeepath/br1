import { useId, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router'
import { Pencil, UserPlus } from 'lucide-react'
import { api, useApi, type Customer, type ListedCustomer, type Order } from '../api'
import { useToast } from '../context'
import { PAYMENT_LABEL, baht, dateTime, num } from '../format'
import { Badge, Dialog, Empty, ErrorNote, Field, Loading, Money, PageHead, Pager, Stat, TableWrap, Words, useDebounced } from '../ui'
import { Items, StatusBadge } from './Orders'

const PAGE = 25

export function Customers() {
  const [q, setQ] = useState('')
  const term = useDebounced(q, 250)
  const { data, error, reload } = useApi<ListedCustomer[]>(`/customers?q=${encodeURIComponent(term.trim())}`)
  const [adding, setAdding] = useState(false)
  const [page, setPage] = useState(1)
  const qId = useId()
  const rows = data ?? []
  const pages = Math.max(1, Math.ceil(rows.length / PAGE))

  return (
    <section className="page">
      <PageHead
        title="ลูกค้า"
        lead="ลูกค้าที่ลงทะเบียน ยอดซื้อสะสม และประวัติการซื้อ"
        actions={
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setAdding(true)}>
            <UserPlus size={17} aria-hidden /> เพิ่มลูกค้า
          </button>
        }
      />
      <div className="filters" role="search" aria-label="ค้นหาลูกค้า">
        <div className="mini-field mini-field--grow">
          <label htmlFor={qId}>ค้นหา</label>
          <input
            id={qId}
            className="input input--sm"
            type="search"
            placeholder="ชื่อ เบอร์โทร หรืออีเมล"
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setPage(1)
            }}
          />
        </div>
      </div>
      {error && <ErrorNote message={error} onRetry={reload} />}
      {!data && !error && <Loading />}
      {data && (
        <>
          <p className="result-line">{num(rows.length)} ราย เรียงตามยอดซื้อสะสม</p>
          {rows.length === 0 ? (
            <Empty title="ไม่พบลูกค้า">ลองค้นด้วยเบอร์โทร หรือกดเพิ่มลูกค้าใหม่</Empty>
          ) : (
            <TableWrap label="ตารางลูกค้า">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">ชื่อ</th>
                    <th scope="col">ประเภท</th>
                    <th scope="col">เบอร์โทร</th>
                    <th scope="col">อีเมล</th>
                    <th scope="col" className="num">
                      บิล
                    </th>
                    <th scope="col" className="num">
                      ยอดซื้อ (บาท)
                    </th>
                    <th scope="col">ซื้อล่าสุด</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice((page - 1) * PAGE, page * PAGE).map((c) => (
                    <tr key={c.id}>
                      <td>
                        <Link to={`/customers/${c.id}`}>
                          <Words text={c.name} />
                        </Link>
                      </td>
                      <td>{c.kind === 'company' ? 'นิติบุคคล' : 'บุคคล'}</td>
                      <td className="nowrap">{c.phone}</td>
                      <td>{c.email ?? '–'}</td>
                      <td className="num">{num(c.orders)}</td>
                      <td className="num">{baht(c.spent)}</td>
                      <td className="nowrap">{c.lastOrderAt ? dateTime(c.lastOrderAt) : 'ยังไม่เคยซื้อ'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          )}
          <Pager page={page} pages={pages} onPage={setPage} />
        </>
      )}
      {adding && (
        <CustomerForm
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

export function CustomerForm({ customer, onClose, onSaved }: { customer?: Customer; onClose: () => void; onSaved: (c: Customer) => void }) {
  const toast = useToast()
  const [f, setF] = useState({
    name: customer?.name ?? '',
    phone: customer?.phone ?? '',
    email: customer?.email ?? '',
    kind: customer?.kind ?? 'person',
    taxId: customer?.taxId ?? '',
    address: customer?.address ?? '',
    note: customer?.note ?? '',
  })
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const id = useId()
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const body = { ...f, email: f.email || null, taxId: f.taxId || null, address: f.address || null, note: f.note || null }
      const c = customer
        ? await api<Customer>(`/customers/${customer.id}`, { method: 'PATCH', body })
        : await api<Customer>('/customers', { method: 'POST', body })
      toast(customer ? `บันทึกข้อมูล ${c.name} แล้ว` : `เพิ่มลูกค้า ${c.name} แล้ว`)
      onSaved(c)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open onClose={onClose} title={customer ? `แก้ไขข้อมูล ${customer.name}` : 'เพิ่มลูกค้าใหม่'}>
      <form className="form" onSubmit={submit}>
        <fieldset className="radio-row">
          <legend className="field__label">ประเภทลูกค้า</legend>
          <label className="check">
            <input type="radio" name="kind" checked={f.kind === 'person'} onChange={() => setF((x) => ({ ...x, kind: 'person' }))} />
            บุคคล
          </label>
          <label className="check">
            <input type="radio" name="kind" checked={f.kind === 'company'} onChange={() => setF((x) => ({ ...x, kind: 'company' }))} />
            นิติบุคคล (ออกใบกำกับภาษีเต็มรูป)
          </label>
        </fieldset>
        <Field label="ชื่อลูกค้าหรือชื่อบริษัท" htmlFor={`${id}-n`}>
          <input id={`${id}-n`} className="input" value={f.name} onChange={set('name')} required />
        </Field>
        <div className="form__row">
          <Field label="เบอร์โทร" htmlFor={`${id}-p`}>
            <input id={`${id}-p`} className="input" inputMode="tel" value={f.phone} onChange={set('phone')} required />
          </Field>
          <Field label="อีเมล (ไม่บังคับ)" htmlFor={`${id}-e`}>
            <input id={`${id}-e`} className="input" type="email" value={f.email} onChange={set('email')} />
          </Field>
        </div>
        <Field label="เลขประจำตัวผู้เสียภาษี 13 หลัก (ไม่บังคับ)" htmlFor={`${id}-t`}>
          <input id={`${id}-t`} className="input" inputMode="numeric" maxLength={13} value={f.taxId} onChange={set('taxId')} />
        </Field>
        <Field label="ที่อยู่ (ไม่บังคับ)" htmlFor={`${id}-a`}>
          <textarea id={`${id}-a`} className="input" rows={2} value={f.address} onChange={set('address')} />
        </Field>
        <Field label="หมายเหตุ (ไม่บังคับ)" htmlFor={`${id}-o`} hint="เช่น แมวที่บ้าน แพ้อาหาร หรือวันนัดฉีดวัคซีน">
          <textarea id={`${id}-o`} className="input" rows={2} value={f.note} onChange={set('note')} />
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
            {customer ? 'บันทึกการแก้ไข' : 'เพิ่มลูกค้า'}
          </button>
        </div>
      </form>
    </Dialog>
  )
}

export function CustomerPage() {
  const { id = '' } = useParams()
  const { data, error, reload } = useApi<{ customer: ListedCustomer; orders: Order[] }>(`/customers/${encodeURIComponent(id)}`)
  const [editing, setEditing] = useState(false)

  if (error)
    return (
      <section className="page">
        <PageHead title="ไม่พบลูกค้า" />
        <ErrorNote message={error} onRetry={reload} />
        <Link to="/customers">กลับไปรายชื่อลูกค้า</Link>
      </section>
    )
  if (!data)
    return (
      <section className="page">
        <Loading />
      </section>
    )
  const c = data.customer
  const refunded = data.orders.filter((o) => o.status === 'refunded').length
  return (
    <section className="page">
      <p className="crumbs">
        <Link to="/customers">ลูกค้า</Link>
      </p>
      <PageHead
        title={c.name}
        heading={<Words text={c.name} />}
        lead={
          <>
            {c.kind === 'company' ? <Badge tone="sky">นิติบุคคล</Badge> : <Badge tone="peach">บุคคล</Badge>} ลงทะเบียน {dateTime(c.createdAt)}
          </>
        }
        actions={
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>
            <Pencil size={16} aria-hidden /> แก้ไขข้อมูล
          </button>
        }
      />
      <div className="stats">
        <Stat label="ยอดซื้อสะสม" value={<Money value={c.spent} />} note="ไม่รวมบิลที่คืนเงิน" />
        <Stat label="จำนวนบิล" value={`${num(c.orders)} บิล`} note={refunded ? `คืนเงิน ${refunded} บิล` : 'ไม่มีการคืนเงิน'} />
        <Stat label="เฉลี่ยต่อบิล" value={<Money value={c.orders ? c.spent / c.orders : 0} />} />
        <Stat label="ซื้อล่าสุด" value={c.lastOrderAt ? dateTime(c.lastOrderAt) : 'ยังไม่เคยซื้อ'} />
      </div>
      <section className="panel pad" aria-labelledby="contact">
        <h2 id="contact" className="h3">
          ข้อมูลติดต่อ
        </h2>
        <dl className="facts">
          <div>
            <dt>เบอร์โทร</dt>
            <dd>{c.phone}</dd>
          </div>
          <div>
            <dt>อีเมล</dt>
            <dd>{c.email ?? '–'}</dd>
          </div>
          <div>
            <dt>เลขผู้เสียภาษี</dt>
            <dd>{c.taxId ?? '–'}</dd>
          </div>
          <div>
            <dt>ที่อยู่</dt>
            <dd>{c.address ?? '–'}</dd>
          </div>
          <div>
            <dt>หมายเหตุ</dt>
            <dd>{c.note ?? '–'}</dd>
          </div>
          <div>
            <dt>รหัสลูกค้า</dt>
            <dd>{c.id}</dd>
          </div>
        </dl>
      </section>
      <section className="block" aria-labelledby="history">
        <h2 id="history" className="h3">
          ประวัติการซื้อ
        </h2>
        {data.orders.length === 0 ? (
          <p className="empty-line">ยังไม่มีบิล เลือกลูกค้านี้ในหน้าขายหน้าร้านเพื่อบันทึกการซื้อครั้งแรก</p>
        ) : (
          <TableWrap label="ประวัติการซื้อ">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">เลขที่บิล</th>
                  <th scope="col">วันเวลา</th>
                  <th scope="col">รายการ</th>
                  <th scope="col" className="num">
                    ยอด (บาท)
                  </th>
                  <th scope="col">ชำระด้วย</th>
                  <th scope="col">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link to={`/orders/${o.id}`}>{o.no}</Link>
                    </td>
                    <td className="nowrap">{dateTime(o.createdAt)}</td>
                    <td className="cell-items">
                      <Items lines={o.lines} />
                    </td>
                    <td className="num">{baht(o.total)}</td>
                    <td>{PAYMENT_LABEL[o.payment.method]}</td>
                    <td>
                      <StatusBadge status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </section>
      {editing && (
        <CustomerForm
          customer={c}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false)
            reload()
          }}
        />
      )}
    </section>
  )
}

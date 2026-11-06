import { useId, useState } from 'react'
import { Link } from 'react-router'
import { useApi, type Activity as Entry, type Paged } from '../api'
import { ACTIVITY_LABEL, dateTime, isReceiptNo, num } from '../format'
import { Badge, ErrorNote, Loading, PageHead, Pager, TableWrap, useDebounced } from '../ui'

const PAGE = 50

const TONE: Record<Entry['type'], string> = {
  login: 'sky',
  logout: 'sky',
  sale: 'mint',
  refund: 'rose',
  stock: 'butter',
  product: 'peach',
  customer: 'lavender',
  shift: 'butter',
  settings: 'peach',
  reset: 'rose',
}

function RefLink({ e }: { e: Entry }) {
  if (!e.ref) return <>–</>
  if (isReceiptNo(e.ref)) return <Link to={`/orders/${e.ref}`}>{e.ref}</Link>
  if (e.type === 'stock' || e.type === 'product') return <Link to={`/products/${e.ref}`}>ดูสินค้า</Link>
  if (e.type === 'customer') return <Link to={`/customers/${e.ref}`}>ดูลูกค้า</Link>
  if (e.type === 'shift') return <Link to="/shifts">ดูกะ</Link>
  return <>{e.ref}</>
}

export function Activity() {
  const [type, setType] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const term = useDebounced(q, 250)
  const qs = new URLSearchParams({ limit: String(PAGE), offset: String((page - 1) * PAGE) })
  if (type) qs.set('type', type)
  if (term.trim()) qs.set('q', term.trim())
  const { data, error, reload, loading } = useApi<Paged<Entry>>(`/activity?${qs}`)
  const id = useId()
  const pages = data ? Math.max(1, Math.ceil(data.total / PAGE)) : 1

  return (
    <section className="page">
      <PageHead title="บันทึกกิจกรรม" lead="ทุกการกระทำในระบบ ใครทำ ทำอะไร เมื่อไร ใช้ตรวจสอบย้อนหลัง" />
      <div className="filters" role="search" aria-label="กรองบันทึกกิจกรรม">
        <div className="mini-field">
          <label htmlFor={`${id}-t`}>ประเภท</label>
          <select
            id={`${id}-t`}
            className="input input--sm"
            value={type}
            onChange={(e) => {
              setType(e.target.value)
              setPage(1)
            }}
          >
            <option value="">ทุกประเภท</option>
            {Object.entries(ACTIVITY_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="mini-field mini-field--grow">
          <label htmlFor={`${id}-q`}>ค้นหา</label>
          <input
            id={`${id}-q`}
            className="input input--sm"
            type="search"
            placeholder="ข้อความ เลขที่บิล หรือชื่อพนักงาน"
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
        <div className={`page-body ${loading ? 'is-reloading' : ''}`}>
          <p className="result-line">{num(data.total)} รายการ ใหม่สุดอยู่บน</p>
          <TableWrap label="บันทึกกิจกรรม">
            <table className="table table--compact">
              <thead>
                <tr>
                  <th scope="col">วันเวลา</th>
                  <th scope="col">ประเภท</th>
                  <th scope="col">ผู้ทำรายการ</th>
                  <th scope="col">รายละเอียด</th>
                  <th scope="col">อ้างอิง</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((e) => (
                  <tr key={e.id}>
                    <td className="nowrap">{dateTime(e.at)}</td>
                    <td>
                      <Badge tone={TONE[e.type]}>{ACTIVITY_LABEL[e.type]}</Badge>
                    </td>
                    <td>{e.staffName ?? 'ระบบ'}</td>
                    <td className="cell-message">{e.message}</td>
                    <td>
                      <RefLink e={e} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
          <Pager page={page} pages={pages} onPage={setPage} />
        </div>
      )}
    </section>
  )
}

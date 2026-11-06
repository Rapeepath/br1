import { useId, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { RefreshCw } from 'lucide-react'
import { api, type Order, type Settings } from '../api'
import { useSession, useToast } from '../context'
import { WEEKDAY_LABEL, hoursSummary, hoursToRows, rowsToHours, type HoursRow } from '../crm'
import { ROLE_LABEL, dateTime, num } from '../format'
import { Receipt } from '../Receipt'
import { Avatar, Badge, Dialog, Field, PageHead, TableWrap } from '../ui'
import '../crm.css'

function sampleOrder(s: Settings, staffName: string): Order {
  const total = 1180 + 750
  const vat = Math.round(((total * s.vatRate) / (100 + s.vatRate)) * 100) / 100
  return {
    id: 'preview',
    no: `${s.receiptPrefix}000000-0000`,
    createdAt: new Date().toISOString(),
    staffId: '',
    staffName,
    shiftId: null,
    customerId: null,
    customerName: null,
    lines: [
      { productId: 'a', sku: '', name: 'อาหารเม็ดลูกแมว', qty: 2, unitPrice: 590, discount: 0, total: 1180, unitCost: 0 },
      { productId: 'b', sku: '', name: 'วัคซีนกระตุ้นประจำปี', qty: 1, unitPrice: 750, discount: 0, total: 750, unitCost: 0 },
    ],
    subtotal: total,
    lineDiscount: 0,
    billDiscount: 0,
    total,
    vat,
    beforeVat: Math.round((total - vat) * 100) / 100,
    vatRate: s.vatRate,
    payment: { method: 'cash', amount: total, tendered: 2000, change: 2000 - total, reference: null, cardLast4: null },
    status: 'paid',
    refund: null,
    note: null,
  }
}

export function SettingsPage() {
  const { meta, isManager, staff, refreshMeta, adopt } = useSession()
  const toast = useToast()
  const navigate = useNavigate()
  const [f, setF] = useState(meta.settings)
  const [rows, setRows] = useState<HoursRow[]>(() => hoursToRows(meta.settings.hours))
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [resetting, setResetting] = useState(false)
  const id = useId()
  const set = (k: keyof Settings) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: k === 'vatRate' ? Number(e.target.value) : e.target.value }))
  const setRow = (day: number, patch: Partial<HoursRow>) => setRows((rs) => rs.map((r) => (r.day === day ? { ...r, ...patch } : r)))
  const planned = rowsToHours(rows)

  const save = async (e: FormEvent) => {
    e.preventDefault()
    const { hours, error: hoursError } = rowsToHours(rows)
    if (hoursError) {
      setError(hoursError)
      return
    }
    setBusy(true)
    setError(null)
    try {
      await api<Settings>('/settings', { method: 'PATCH', body: { ...f, hours } })
      await refreshMeta()
      toast('บันทึกข้อมูลร้านแล้ว ใบเสร็จใบถัดไปจะใช้ข้อมูลนี้')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const reset = async () => {
    setBusy(true)
    try {
      const r = await api<{ token: string; orders: number }>('/admin/reset', { method: 'POST' })
      try {
        sessionStorage.removeItem('maew.pos.cart')
      } catch {
        // Nothing to clear
      }
      await adopt(r.token)
      setResetting(false)
      toast(`สร้างข้อมูลจำลองใหม่แล้ว ${num(r.orders)} บิล ย้อนหลัง 60 วัน`)
      navigate('/')
    } catch (err) {
      toast((err as Error).message, 'error')
      setBusy(false)
    }
  }

  return (
    <section className="page">
      <PageHead title="ตั้งค่า" lead="ข้อมูลร้านบนใบเสร็จ พนักงาน และฐานข้อมูลจำลอง" />
      <div className="grid-2 grid-2--wide-left">
        <form className="panel pad form" onSubmit={save} aria-labelledby={`${id}-t`}>
          <h2 id={`${id}-t`} className="h3">
            ข้อมูลร้านและใบเสร็จ
          </h2>
          {!isManager && <p className="form__lock">ผู้จัดการเท่านั้นที่แก้ข้อมูลร้านได้ พนักงานดูได้อย่างเดียว</p>}
          <fieldset disabled={!isManager} className="form__fields">
            <legend className="visually-hidden">ข้อมูลร้าน</legend>
            <div className="form__row">
              <Field label="ชื่อร้าน" htmlFor={`${id}-n`}>
                <input id={`${id}-n`} className="input" value={f.storeName} onChange={set('storeName')} />
              </Field>
              <Field label="สาขา" htmlFor={`${id}-b`}>
                <input id={`${id}-b`} className="input" value={f.branch} onChange={set('branch')} />
              </Field>
            </div>
            <Field label="ที่อยู่" htmlFor={`${id}-a`}>
              <textarea id={`${id}-a`} className="input" rows={2} value={f.address} onChange={set('address')} />
            </Field>
            <div className="form__row">
              <Field label="เบอร์โทร" htmlFor={`${id}-p`}>
                <input id={`${id}-p`} className="input" value={f.phone} onChange={set('phone')} />
              </Field>
              <Field label="เลขประจำตัวผู้เสียภาษี" htmlFor={`${id}-x`}>
                <input id={`${id}-x`} className="input" inputMode="numeric" maxLength={13} value={f.taxId} onChange={set('taxId')} />
              </Field>
              <Field label="อัตรา VAT (%)" htmlFor={`${id}-v`} hint="ราคาบนชั้นรวม VAT แล้ว">
                <input id={`${id}-v`} className="input" type="number" min={0} max={30} step={0.5} value={f.vatRate} onChange={set('vatRate')} />
              </Field>
            </div>
            <Field label="ข้อความท้ายใบเสร็จ" htmlFor={`${id}-f`}>
              <textarea id={`${id}-f`} className="input" rows={2} value={f.receiptFooter} onChange={set('receiptFooter')} />
            </Field>
            <p className="field__hint">คำนำหน้าเลขที่ใบเสร็จ {f.receiptPrefix} ตามด้วยวันที่แบบพุทธศักราชและลำดับบิลของวัน</p>

            <fieldset className="form__group">
              <legend>ช่องทางติดต่อบนเว็บไซต์</legend>
              <div className="form__row">
                <Field label="อีเมลร้าน" htmlFor={`${id}-e`}>
                  <input id={`${id}-e`} className="input" type="email" value={f.email ?? ''} onChange={set('email')} />
                </Field>
                <Field label="LINE ID" htmlFor={`${id}-li`} hint="บัญชีทางการขึ้นต้นด้วย @">
                  <input id={`${id}-li`} className="input" value={f.lineId ?? ''} onChange={set('lineId')} />
                </Field>
              </div>
              <Field label="ลิงก์เพิ่มเพื่อน LINE" htmlFor={`${id}-lu`}>
                <input id={`${id}-lu`} className="input" type="url" value={f.lineUrl ?? ''} onChange={set('lineUrl')} />
              </Field>
              <Field label="ลิงก์แผนที่" htmlFor={`${id}-m`} hint="ลิงก์ Google Maps ของร้าน">
                <input id={`${id}-m`} className="input" type="url" value={f.mapUrl ?? ''} onChange={set('mapUrl')} />
              </Field>
              <Field label="ที่อยู่เว็บไซต์" htmlFor={`${id}-w`} hint="ใช้สร้างลิงก์ในอีเมลและหน้าสถานะการจอง">
                <input id={`${id}-w`} className="input" type="url" value={f.siteUrl ?? ''} onChange={set('siteUrl')} />
              </Field>
            </fieldset>

            <fieldset className="form__group">
              <legend>เวลาเปิดร้าน</legend>
              <p className="field__hint">ลูกค้าจองนัดชมลูกแมวได้เฉพาะช่วงเวลาเปิดร้าน วันที่ปิดจะไม่มีเวลาให้จอง</p>
              <div className="hours-editor">
                <div className="hours-row hours-row--head" aria-hidden="true">
                  <span>วัน</span>
                  <span>เวลาเปิด</span>
                  <span>เวลาปิด</span>
                </div>
                {rows.map((r) => (
                  <div key={r.day} className="hours-row">
                    <label className="check">
                      <input type="checkbox" checked={r.open} onChange={(e) => setRow(r.day, { open: e.target.checked })} />
                      วัน{WEEKDAY_LABEL[r.day]}
                    </label>
                    {r.open ? (
                      <>
                        <div className="mini-field">
                          <label htmlFor={`${id}-o${r.day}`}>เปิด วัน{WEEKDAY_LABEL[r.day]}</label>
                          <input id={`${id}-o${r.day}`} className="input input--sm" type="time" step={1800} value={r.from} onChange={(e) => setRow(r.day, { from: e.target.value })} />
                        </div>
                        <div className="mini-field">
                          <label htmlFor={`${id}-c${r.day}`}>ปิด วัน{WEEKDAY_LABEL[r.day]}</label>
                          <input id={`${id}-c${r.day}`} className="input input--sm" type="time" step={1800} value={r.to} onChange={(e) => setRow(r.day, { to: e.target.value })} />
                        </div>
                      </>
                    ) : (
                      <span className="hours-row__closed">ร้านปิด</span>
                    )}
                  </div>
                ))}
              </div>
              <p className="field__hint" aria-live="polite">
                {planned.error ?? `บนเว็บไซต์จะแสดง: ${hoursSummary(planned.hours)}`}
              </p>
            </fieldset>
          </fieldset>
          {error && (
            <p className="form__error" role="alert">
              {error}
            </p>
          )}
          {isManager && (
            <div className="form__actions">
              <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>
                บันทึกข้อมูลร้าน
              </button>
            </div>
          )}
        </form>
        <section className="panel pad" aria-labelledby={`${id}-r`}>
          <h2 id={`${id}-r`} className="h3">
            ตัวอย่างใบเสร็จ
          </h2>
          <Receipt order={sampleOrder(f, staff.name)} settings={f} />
        </section>
      </div>

      <section className="block" aria-labelledby={`${id}-s`}>
        <h2 id={`${id}-s`} className="h3">
          พนักงาน
        </h2>
        <TableWrap label="พนักงาน">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">ชื่อ</th>
                <th scope="col">ตำแหน่ง</th>
                <th scope="col">สิทธิ์</th>
                <th scope="col">สิ่งที่ทำได้</th>
              </tr>
            </thead>
            <tbody>
              {meta.staff.map((s) => (
                <tr key={s.id}>
                  <td>
                    <span className="cell-product">
                      <Avatar name={s.name} tone={s.tone} size={34} />
                      <span>
                        {s.name}
                        {s.id === staff.id && <span className="cell-sub">กำลังใช้งาน</span>}
                      </span>
                    </span>
                  </td>
                  <td>{s.title}</td>
                  <td>{s.role === 'manager' ? <Badge tone="peach">{ROLE_LABEL.manager}</Badge> : <Badge tone="sky">{ROLE_LABEL.staff}</Badge>}</td>
                  <td>{s.role === 'manager' ? 'ทุกอย่าง รวมถึงแก้ราคา คืนเงิน ปรับสต็อก และตั้งค่าร้าน' : 'ขาย รับสินค้าเข้า เปิดปิดกะ คืนเงินและปรับสต็อกเมื่อผู้จัดการใส่ PIN'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      </section>

      <section className="panel pad block" aria-labelledby={`${id}-d`}>
        <h2 id={`${id}-d`} className="h3">
          ฐานข้อมูลจำลอง
        </h2>
        <dl className="facts">
          <div>
            <dt>สร้างข้อมูลเมื่อ</dt>
            <dd>{dateTime(meta.seededAt)}</dd>
          </div>
          <div>
            <dt>ไฟล์ฐานข้อมูล</dt>
            <dd className="break">{meta.file}</dd>
          </div>
          <div>
            <dt>สิ่งที่จำลอง</dt>
            <dd>ยอดขายย้อนหลัง 60 วัน ลูกค้า สต็อก และกะเงินสด การชำระเงินทุกช่องทางเป็นการจำลอง ไม่มีการตัดเงินจริง</dd>
          </div>
        </dl>
        {isManager ? (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setResetting(true)}>
            <RefreshCw size={16} aria-hidden /> สร้างข้อมูลจำลองใหม่
          </button>
        ) : (
          <p className="form__lock">ผู้จัดการเท่านั้นที่สร้างข้อมูลจำลองใหม่ได้</p>
        )}
      </section>

      <Dialog open={resetting} onClose={() => setResetting(false)} title="สร้างข้อมูลจำลองใหม่">
        <p>บิล ลูกค้า สต็อก กะ และบันทึกกิจกรรมทั้งหมดจะถูกแทนที่ด้วยข้อมูลจำลอง 60 วันชุดใหม่ที่จบที่วันนี้ พนักงานคนอื่นจะต้องเข้าสู่ระบบใหม่</p>
        <div className="form__actions">
          <button type="button" className="btn btn-ghost" onClick={() => setResetting(false)}>
            ยกเลิก
          </button>
          <button type="button" className="btn btn-primary" onClick={reset} disabled={busy}>
            แทนที่ด้วยข้อมูลชุดใหม่
          </button>
        </div>
      </Dialog>
    </section>
  )
}

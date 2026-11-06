import { useId, useState, type FormEvent } from 'react'
import { Wallet } from 'lucide-react'
import { api, type Shift } from './api'
import { useSession, useToast } from './context'
import { bahtText } from './format'
import { Field, parseAmount } from './ui'

/** Opening a shift: count the float into the drawer, then the till can sell. */
export function OpenShiftForm({ compact }: { compact?: boolean }) {
  const { refreshShift, meta } = useSession()
  const toast = useToast()
  const id = useId()
  const [amount, setAmount] = useState('3000')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const value = parseAmount(amount)
    if (!Number.isFinite(value) || value < 0) {
      setError('ใส่จำนวนเงินทอนตั้งต้นเป็นตัวเลข 0 ขึ้นไป')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const s = await api<Shift>('/shifts/open', { method: 'POST', body: { openingCash: value } })
      await refreshShift()
      toast(`เปิดกะ #${s.no} แล้ว เงินทอนตั้งต้น ${bahtText(s.openingCash)}`)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className={`open-shift ${compact ? 'open-shift--compact' : ''}`} onSubmit={submit}>
      <span className="bubble tone-butter" aria-hidden="true">
        <Wallet size={22} />
      </span>
      <div className="open-shift__text">
        <h2 className="h3">ยังไม่ได้เปิดกะ</h2>
        <p>นับเงินทอนที่ใส่ลิ้นชักของ {meta.settings.storeName} แล้วเปิดกะ ระบบจะเริ่มนับยอดเงินสดของกะนี้ทันที</p>
      </div>
      <div className="open-shift__form">
        <Field label="เงินทอนตั้งต้น (บาท)" htmlFor={id} error={error}>
          <input id={id} className="input" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          เปิดกะ
        </button>
      </div>
    </form>
  )
}

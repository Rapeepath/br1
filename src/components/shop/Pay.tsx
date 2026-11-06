import { useState } from 'react'
import { Landmark, QrCode, Wallet } from 'lucide-react'
import { useLang } from '../../i18n'
import type { Reservation } from '../../lib/kittens'
import { useStoreInfo } from '../../lib/live'
import { errorText, postPublic } from '../../lib/publicApi'
import { money } from '../../lib/shop'
import './pay.css'

/** A QR-looking pattern from the reference: decoration only, clearly labelled as not payable. */
export function FakeQr({ seed, size = 168 }: { seed: string; size?: number }) {
  const n = 25
  let h = 2166136261
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0
  const rand = () => {
    h ^= h << 13
    h ^= h >>> 17
    h ^= h << 5
    return (h >>> 0) / 4294967296
  }
  const finder = (x: number, y: number) => {
    const inBox = (ox: number, oy: number) => x >= ox && x < ox + 7 && y >= oy && y < oy + 7
    for (const [ox, oy] of [
      [0, 0],
      [n - 7, 0],
      [0, n - 7],
    ]) {
      if (inBox(ox, oy)) {
        const dx = x - ox
        const dy = y - oy
        const ring = dx === 0 || dx === 6 || dy === 0 || dy === 6
        const core = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4
        return ring || core ? 1 : 0
      }
    }
    return -1
  }
  const cells: [number, number][] = []
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const f = finder(x, y)
      if (f === 1 || (f === -1 && rand() > 0.52)) cells.push([x, y])
    }
  return (
    <svg className="fake-qr" width={size} height={size} viewBox={`-2 -2 ${n + 4} ${n + 4}`} aria-hidden="true" focusable="false">
      <rect x="-2" y="-2" width={n + 4} height={n + 4} rx="2" fill="#fff" />
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill="#1f1a17" />
      ))}
    </svg>
  )
}

const COPY = {
  th: {
    title: 'ชำระมัดจำ',
    amount: 'ยอดมัดจำ',
    ref: 'อ้างอิง',
    method: 'วิธีชำระ',
    promptpay: 'พร้อมเพย์ (QR)',
    transfer: 'โอนเงินเข้าบัญชี',
    qrNote: 'QR จำลองสำหรับการสาธิต สแกนจ่ายไม่ได้',
    qrNoteNb: 'สแกนจ่ายไม่ได้',
    bank: 'ธนาคารจำลอง สาขาอารีย์',
    account: 'เลขบัญชี 123-4-56789-0',
    accName: (n: string) => `ชื่อบัญชี ${n}`,
    simulated: 'ระบบจำลอง ไม่มีการตัดเงินจริง กดปุ่มด้านล่างเพื่อจำลองว่าชำระแล้ว',
    paid: 'ยืนยันว่าชำระมัดจำแล้ว',
    paying: 'กำลังยืนยัน…',
  },
  en: {
    title: 'Pay the deposit',
    amount: 'Deposit',
    ref: 'Reference',
    method: 'Pay by',
    promptpay: 'PromptPay (QR)',
    transfer: 'Bank transfer',
    qrNote: 'Demonstration QR: it can’t be scanned to pay',
    qrNoteNb: 'scanned to pay',
    bank: 'Demo Bank, Ari branch',
    account: 'Account 123-4-56789-0',
    accName: (n: string) => `Account name ${n}`,
    simulated: 'This is a simulation and no money moves. Press the button below to simulate the payment.',
    paid: 'I’ve paid the deposit',
    paying: 'Confirming…',
  },
}

/** The deposit step: PromptPay QR or bank transfer (both simulated), then confirm. */
export function PayStep({ reservation, token, onPaid }: { reservation: Reservation; token: string; onPaid: (r: Reservation) => void }) {
  const lang = useLang()
  const c = COPY[lang]
  const store = useStoreInfo()
  const [method, setMethod] = useState<'promptpay' | 'transfer'>('promptpay')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pay = async () => {
    setBusy(true)
    setError(null)
    try {
      onPaid(await postPublic<Reservation>(`reservations/${encodeURIComponent(reservation.no)}/pay`, { t: token, method, website: '' }))
    } catch (err) {
      setError(errorText(err, lang))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="pay">
      <div className="pay__amount">
        <p>{c.amount}</p>
        <p className="pay__figure">{money(reservation.deposit.amount, lang)}</p>
        <p className="pay__ref">
          {c.ref} {reservation.payment.promptpayRef}
        </p>
      </div>
      <fieldset className="choice-group">
        <legend className="field__label">{c.method}</legend>
        <div className="choice-row">
          <label className="choice">
            <input type="radio" name="pay-method" checked={method === 'promptpay'} onChange={() => setMethod('promptpay')} />
            <QrCode size={18} aria-hidden />
            <span>{c.promptpay}</span>
          </label>
          <label className="choice">
            <input type="radio" name="pay-method" checked={method === 'transfer'} onChange={() => setMethod('transfer')} />
            <Landmark size={18} aria-hidden />
            <span>{c.transfer}</span>
          </label>
        </div>
      </fieldset>
      {method === 'promptpay' ? (
        <figure className="pay__qr">
          <FakeQr seed={reservation.payment.promptpayRef} />
          <figcaption>
            {c.qrNote.replace(c.qrNoteNb, '')}
            <span className="nowrap">{c.qrNoteNb}</span>
          </figcaption>
        </figure>
      ) : (
        <dl className="pay__bank">
          <div>
            <dt>{c.bank}</dt>
            <dd>{c.account}</dd>
          </div>
          <div>
            <dt>{c.accName(store.storeName)}</dt>
            <dd>
              {c.ref} {reservation.payment.promptpayRef}
            </dd>
          </div>
        </dl>
      )}
      <p className="pay__sim">
        <Wallet size={18} aria-hidden />
        {c.simulated}
      </p>
      <div aria-live="polite">{error && <p className="form-message form-message--error">{error}</p>}</div>
      <button type="button" className="btn btn-primary" onClick={pay} disabled={busy}>
        {busy ? c.paying : c.paid}
      </button>
    </div>
  )
}

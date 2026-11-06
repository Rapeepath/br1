import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Delete } from 'lucide-react'
import { OddEyes } from '../../components/OddEyes'
import { api, type PublicStaff } from '../api'
import { useAuth } from '../context'
import { ROLE_LABEL } from '../format'
import { Avatar, ErrorNote, Loading, useTitle } from '../ui'

const PIN_LENGTH = 4

export function Login() {
  useTitle('เข้าสู่ระบบ')
  const { login, notice } = useAuth()
  const [staff, setStaff] = useState<PublicStaff[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [who, setWho] = useState<string | null>(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const pinRef = useRef<HTMLInputElement>(null)

  const load = () => {
    setLoadError(null)
    api<PublicStaff[]>('/staff')
      .then((s) => {
        setStaff(s)
        setWho((w) => w ?? s.find((x) => x.role === 'staff')?.id ?? s[0]?.id ?? null)
      })
      .catch((e: Error) => setLoadError(e.message))
  }
  useEffect(load, [])

  const submit = async (value = pin, e?: FormEvent) => {
    e?.preventDefault()
    if (!who || busy) return
    if (value.length < PIN_LENGTH) {
      setError(`ใส่รหัส PIN ให้ครบ ${PIN_LENGTH} หลัก`)
      return
    }
    setBusy(true)
    setError(null)
    try {
      await login(who, value)
    } catch (err) {
      setError((err as Error).message)
      setPin('')
      pinRef.current?.focus()
    } finally {
      setBusy(false)
    }
  }

  const press = (d: string) => {
    if (busy) return
    setError(null)
    const next = (pin + d).slice(0, PIN_LENGTH)
    setPin(next)
    if (next.length === PIN_LENGTH) void submit(next)
  }

  const chosen = staff?.find((s) => s.id === who)

  return (
    <main className="login" id="main">
      <div className="login__card">
        <div className="login__brand">
          <OddEyes size={26} />
          <div>
            <p className="login__name">Maew หลังร้าน</p>
            <p className="login__sub">ระบบขายหน้าร้านและหลังบ้าน (ระบบจำลอง)</p>
          </div>
        </div>
        <h1 className="login__title">ใครกำลังเข้ากะ</h1>
        {notice && (
          <p className="login__notice" role="alert">
            {notice}
          </p>
        )}

        {loadError && <ErrorNote message={loadError} onRetry={load} />}
        {!staff && !loadError && <Loading label="กำลังโหลดรายชื่อพนักงาน" />}

        {staff && (
          <form onSubmit={(e) => submit(pin, e)} className="login__form">
            <fieldset className="login__who">
              <legend className="visually-hidden">เลือกพนักงาน</legend>
              {staff.map((s) => (
                <label key={s.id} className="who">
                  <input
                    type="radio"
                    name="staff"
                    value={s.id}
                    checked={who === s.id}
                    onChange={() => {
                      setWho(s.id)
                      setPin('')
                      setError(null)
                    }}
                  />
                  <Avatar name={s.name} tone={s.tone} size={48} />
                  <span className="who__name">{s.name}</span>
                  <span className="who__title">
                    {s.title} ({ROLE_LABEL[s.role]})
                  </span>
                </label>
              ))}
            </fieldset>

            <div className="pin">
              <label htmlFor="pin" className="pin__label">
                รหัส PIN ของ{chosen ? chosen.name : 'พนักงาน'}
              </label>
              <input
                ref={pinRef}
                id="pin"
                className="pin__input"
                type="password"
                inputMode="numeric"
                autoComplete="off"
                maxLength={PIN_LENGTH}
                value={pin}
                aria-describedby="pin-hint"
                aria-invalid={error ? true : undefined}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, PIN_LENGTH)
                  setPin(v)
                  setError(null)
                  if (v.length === PIN_LENGTH) void submit(v)
                }}
              />
              {error && (
                <p className="pin__error" role="alert">
                  {error}
                </p>
              )}
              <div className="pin__pad">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
                  <button key={d} type="button" onClick={() => press(d)}>
                    {d}
                  </button>
                ))}
                <button type="button" onClick={() => setPin((p) => p.slice(0, -1))} aria-label="ลบตัวเลขล่าสุด">
                  <Delete size={22} aria-hidden />
                </button>
                <button type="button" onClick={() => press('0')}>
                  0
                </button>
                <button type="submit" className="pin__go" disabled={busy}>
                  เข้า
                </button>
              </div>
              <p id="pin-hint" className="pin__hint">
                รหัสทดลอง: ผู้จัดการ 1111 พนักงาน 2222 และ 3333
              </p>
            </div>
          </form>
        )}
        <a className="login__site" href="../">
          กลับไปหน้าเว็บไซต์ Maew
        </a>
      </div>
    </main>
  )
}

// A small form kit for the shop pages: visible labels, hints and errors tied to their inputs, a consent
// tick that links the privacy notice, a honeypot for bots, and a submit hook that turns the API's
// `{ error, code, errorEn, field }` into a message beside the right field (focused) in the page's language.
import { useCallback, useRef, useState, type ChangeEvent, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { Link } from 'react-router'
import { AlertCircle } from 'lucide-react'
import { useLang, type Lang } from '../../i18n'
import { ApiError, errorText } from '../../lib/publicApi'
import './form.css'

const COPY = {
  th: {
    required: 'จำเป็น',
    optional: 'ไม่บังคับ',
    needName: 'กรอกชื่อ',
    needPhone: 'กรอกเบอร์โทร',
    badPhone: 'เบอร์โทรควรเป็นตัวเลข 9–10 หลัก เช่น 081-234-5678',
    badEmail: 'อีเมลไม่ถูกต้อง เช่น name@example.com',
    needConsent: 'ติ๊กยินยอมก่อนส่ง เพื่อให้ร้านติดต่อกลับได้',
    consentA: 'ยินยอมให้ร้านเก็บและใช้ข้อมูลนี้เพื่อติดต่อกลับเรื่องที่สอบถาม ตาม',
    consentLink: 'นโยบายความเป็นส่วนตัว',
    consentB: '',
    fix: 'ยังส่งไม่ได้ แก้ช่องที่มีเครื่องหมายก่อน',
    sending: 'กำลังส่ง…',
  },
  en: {
    required: 'required',
    optional: 'optional',
    needName: 'Enter your name',
    needPhone: 'Enter a phone number',
    badPhone: 'Use 9–10 digits, e.g. 081-234-5678',
    badEmail: 'That email doesn’t look right, e.g. name@example.com',
    needConsent: 'Tick the box so the shop may contact you',
    consentA: 'I agree that the shop may keep and use these details to reply to me, as set out in the',
    consentLink: 'privacy policy',
    consentB: '.',
    fix: 'Not sent yet: please fix the marked fields first.',
    sending: 'Sending…',
  },
} as const

export const formCopy = (lang: Lang) => COPY[lang]

export type Errors = Record<string, string | undefined>

const PHONE_RE = /^[0-9+\-\s()]{9,20}$/
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

/** The checks every contact form shares; returns field → message. */
export function contactErrors(v: { name?: string; phone?: string; email?: string; consent?: boolean }, lang: Lang, opts: { consent?: boolean } = {}): Errors {
  const c = COPY[lang]
  const e: Errors = {}
  if (!v.name?.trim()) e.name = c.needName
  if (!v.phone?.trim()) e.phone = c.needPhone
  else if (!PHONE_RE.test(v.phone.trim()) || v.phone.replace(/\D/g, '').length < 9) e.phone = c.badPhone
  if (v.email?.trim() && !EMAIL_RE.test(v.email.trim())) e.email = c.badEmail
  if (opts.consent !== false && !v.consent) e.consent = c.needConsent
  return e
}

/** Form values with a setter per field. */
export function useFormValues<T extends Record<string, unknown>>(initial: T) {
  const [values, setValues] = useState<T>(initial)
  const set = useCallback(<K extends keyof T>(key: K, value: T[K]) => setValues((v) => ({ ...v, [key]: value })), [])
  const bind = (key: keyof T & string) => ({
    value: (values[key] as string) ?? '',
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => set(key, e.target.value as T[typeof key]),
  })
  return { values, set, bind, reset: () => setValues(initial) }
}

type SubmitState = 'idle' | 'sending' | 'done' | 'error'

/**
 * Runs a submit: checks first (focusing the first field in error), then the call. A field the API names
 * gets its message beside it; anything else becomes the form-level message.
 */
export function useSubmit<R>(formId: string) {
  const lang = useLang()
  const [state, setState] = useState<SubmitState>('idle')
  const [errors, setErrors] = useState<Errors>({})
  const [message, setMessage] = useState<string | null>(null)
  const [result, setResult] = useState<R | null>(null)
  const busy = useRef(false)

  const focusField = (name: string) => {
    requestAnimationFrame(() => {
      const el = document.getElementById(`${formId}-${name}`)
      el?.focus()
    })
  }

  const run = async (check: () => Errors, call: () => Promise<R>) => {
    if (busy.current) return
    const found = Object.fromEntries(Object.entries(check()).filter(([, v]) => v)) as Errors
    setErrors(found)
    const first = Object.keys(found)[0]
    if (first) {
      setState('error')
      setMessage(COPY[lang].fix)
      focusField(first)
      return
    }
    busy.current = true
    setState('sending')
    setMessage(null)
    try {
      const r = await call()
      setResult(r)
      setState('done')
    } catch (err) {
      const text = errorText(err, lang)
      if (err instanceof ApiError && err.field) {
        setErrors({ [err.field]: text })
        focusField(err.field)
        setMessage(COPY[lang].fix)
      } else {
        setMessage(text)
      }
      setState('error')
    } finally {
      busy.current = false
    }
  }

  return { state, errors, setErrors, message, result, run, reset: () => (setState('idle'), setResult(null), setMessage(null)) }
}

interface FieldShell {
  /** The form's id; the input gets `${form}-${name}` */
  form: string
  name: string
  label: ReactNode
  hint?: ReactNode
  error?: string
  required?: boolean
  /** Show "(ไม่บังคับ)" after the label */
  optional?: boolean
  className?: string
}

/** Label, hint and error around one control; `control` receives the ids/ARIA to wire itself up. */
export function Field({
  form,
  name,
  label,
  hint,
  error,
  required,
  optional,
  className,
  control,
}: FieldShell & { control: (a: { id: string; 'aria-describedby'?: string; 'aria-invalid'?: true; required?: boolean }) => ReactNode }) {
  const lang = useLang()
  const id = `${form}-${name}`
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined
  return (
    <div className={`field${error ? ' field--error' : ''}${className ? ` ${className}` : ''}`}>
      <label htmlFor={id} className="field__label">
        {label}
        {required && <span className="field__req"> ({COPY[lang].required})</span>}
        {optional && <span className="field__opt"> ({COPY[lang].optional})</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="field__hint">
          {hint}
        </p>
      )}
      {control({ id, 'aria-describedby': describedBy, ...(error ? { 'aria-invalid': true as const } : {}), required })}
      {error && (
        <p id={`${id}-error`} className="field__error">
          <AlertCircle size={16} aria-hidden />
          {error}
        </p>
      )}
    </div>
  )
}

export function TextField(props: FieldShell & Omit<InputHTMLAttributes<HTMLInputElement>, 'form' | 'name' | 'id'>) {
  const { form, name, label, hint, error, required, optional, className, ...input } = props
  return (
    <Field
      {...{ form, name, label, hint, error, required, optional, className }}
      control={(a) => <input {...input} {...a} name={name} className="input" />}
    />
  )
}

export function TextArea(props: FieldShell & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'form' | 'name' | 'id'>) {
  const { form, name, label, hint, error, required, optional, className, ...input } = props
  return (
    <Field
      {...{ form, name, label, hint, error, required, optional, className }}
      control={(a) => <textarea rows={4} {...input} {...a} name={name} className="input input--area" />}
    />
  )
}

export function SelectField(props: FieldShell & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'form' | 'name' | 'id'> & { children: ReactNode }) {
  const { form, name, label, hint, error, required, optional, className, children, ...input } = props
  return (
    <Field
      {...{ form, name, label, hint, error, required, optional, className }}
      control={(a) => (
        <select {...input} {...a} name={name} className="input input--select">
          {children}
        </select>
      )}
    />
  )
}

/** Name, phone, email and LINE: the details every shop form asks for. */
export function ContactFields({
  form,
  bind,
  errors,
  lang,
}: {
  form: string
  bind: (k: 'name' | 'phone' | 'email' | 'lineId') => { value: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void }
  errors: Errors
  lang: Lang
}) {
  const th = lang === 'th'
  return (
    <div className="form-grid">
      <TextField form={form} name="name" label={th ? 'ชื่อ' : 'Name'} required autoComplete="name" error={errors.name} {...bind('name')} />
      <TextField
        form={form}
        name="phone"
        label={th ? 'เบอร์โทร' : 'Phone'}
        required
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        error={errors.phone}
        {...bind('phone')}
      />
      <TextField form={form} name="email" label={th ? 'อีเมล' : 'Email'} optional type="email" autoComplete="email" error={errors.email} {...bind('email')} />
      <TextField
        form={form}
        name="lineId"
        label={th ? 'LINE ID' : 'LINE ID'}
        optional
        autoComplete="off"
        error={errors.lineId}
        {...bind('lineId')}
      />
    </div>
  )
}

/** The consent tick every form needs, linking the privacy notice. */
export function Consent({ form, checked, onChange, error }: { form: string; checked: boolean; onChange: (v: boolean) => void; error?: string }) {
  const lang = useLang()
  const c = COPY[lang]
  const id = `${form}-consent`
  return (
    <div className={`consent${error ? ' consent--error' : ''}`}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={error ? true : undefined}
      />
      <label htmlFor={id}>
        {c.consentA} <Link to="/privacy">{c.consentLink}</Link>
        {c.consentB}
      </label>
      {error && (
        <p id={`${id}-error`} className="field__error">
          <AlertCircle size={16} aria-hidden />
          {error}
        </p>
      )}
    </div>
  )
}

/** A field people never see or reach; bots that fill every input give themselves away. */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="honeypot" aria-hidden="true">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
    </div>
  )
}

/** The form-level message: a direction, announced politely when it changes. */
export function FormMessage({ message, tone = 'error' }: { message: string | null; tone?: 'error' | 'info' }) {
  return (
    <div className="form-message-slot" aria-live="polite">
      {message && (
        <p className={`form-message form-message--${tone}`}>
          <AlertCircle size={18} aria-hidden />
          {message}
        </p>
      )}
    </div>
  )
}

export const sendingLabel = (lang: Lang) => COPY[lang].sending

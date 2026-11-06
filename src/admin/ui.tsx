// Small building blocks shared by the admin screens.
import { Fragment, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { registerToastSlot } from './context'
import { baht, initial } from './format'

export function useTitle(title: string) {
  useEffect(() => {
    document.title = `${title} – Maew หลังร้าน`
  }, [title])
}

export function useMedia(query: string): boolean {
  const [match, setMatch] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatch(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return match
}

/** Debounces a fast-changing value (search boxes, the cart before re-quoting). */
export function useDebounced<T>(value: T, ms = 250): T {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}

const segmenter = typeof Intl !== 'undefined' && 'Segmenter' in Intl ? new Intl.Segmenter('th', { granularity: 'word' }) : null

/** Longer than this (in characters) a space-free run is a phrase of native Thai words, not one name */
const LONG = 12

/** Dictionary words of a long space-free run; punctuation sticks to the word beside it. */
function thaiWords(token: string): string[] {
  if (!segmenter) return [token]
  const out: string[] = []
  let lead = ''
  for (const s of segmenter.segment(token)) {
    if (!s.isWordLike) {
      if (out.length) out[out.length - 1] += s.segment
      else lead += s.segment
    } else {
      out.push(lead + s.segment)
      lead = ''
    }
  }
  if (lead) out.push(lead)
  return out.length ? out : [token]
}

/** The unbreakable pieces of one space-separated token. */
export function pieces(token: string): string[] {
  // "ลูกแมวบริติช": the kitten prefix parts from the breed, the breed name stays whole
  if (/^ลูกแมว./.test(token)) return ['ลูกแมว', ...pieces(token.slice('ลูกแมว'.length))]
  // Short runs are names (often transliterations the dictionary splits wrongly: "ช็อต|แฮร์"); keep them whole.
  // Long runs are ordinary Thai ("ชุดอุปกรณ์เริ่มต้นเลี้ยงแมว"), which the dictionary splits well.
  return [...token].length > LONG ? thaiWords(token) : [token]
}

/**
 * Thai has no spaces between words, so a browser breaks a name like "บริติช ช็อตแฮร์" mid-word. This keeps every
 * space-separated piece whole (a long space-free phrase may still break between its dictionary words), so
 * names wrap at their spaces. Only spans and <wbr> are added: the text reads and announces the same.
 */
export function Words({ text }: { text: string }) {
  const parts = text.split(/\s+/).filter(Boolean)
  // One wrapper, so a table cell laid out as a grid on phones treats the name as a single value
  return (
    <span className="words">
      {parts.map((p, i) => {
        const bits = pieces(p)
        return (
          <Fragment key={i}>
            {i > 0 && ' '}
            {bits.map((s, j) => (
              <Fragment key={j}>
                {j > 0 && <wbr />}
                <span className="seg">{s}</span>
              </Fragment>
            ))}
          </Fragment>
        )
      })}
    </span>
  )
}

export function PageHead({
  title,
  heading,
  lead,
  actions,
  children,
}: {
  title: string
  /** What the h1 shows when it needs more than plain text (defaults to the title) */
  heading?: ReactNode
  lead?: ReactNode
  actions?: ReactNode
  children?: ReactNode
}) {
  useTitle(title)
  return (
    <header className="page-head">
      <div className="page-head__text">
        <h1>{heading ?? title}</h1>
        {lead && <p className="page-head__lead">{lead}</p>}
      </div>
      {actions && <div className="page-head__actions">{actions}</div>}
      {children}
    </header>
  )
}

/** Baht figure with the unit set smaller beside it. */
export function Money({ value, className }: { value: number; className?: string }) {
  return (
    <span className={`money ${className ?? ''}`}>
      {baht(value)}
      <span className="money__unit"> บาท</span>
    </span>
  )
}

export function Stat({ label, value, note, tone }: { label: string; value: ReactNode; note?: ReactNode; tone?: string }) {
  return (
    <div className={`stat ${tone ? `tone-${tone}` : ''}`}>
      <p className="stat__label">{label}</p>
      <p className="stat__value">{value}</p>
      {note && <p className="stat__note">{note}</p>}
    </div>
  )
}

export function Badge({ tone = 'sky', children }: { tone?: string; children: ReactNode }) {
  return <span className={`badge tone-${tone}`}>{children}</span>
}

export function Avatar({ name, tone, size = 40 }: { name: string; tone: string; size?: number }) {
  return (
    <span className={`avatar tone-${tone}`} style={{ width: size, height: size, fontSize: size * 0.42 }} aria-hidden="true">
      {initial(name)}
    </span>
  )
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <p className="empty__title">{title}</p>
      {children && <div className="empty__body">{children}</div>}
    </div>
  )
}

export function ErrorNote({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="error-note" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-ghost btn-sm" onClick={onRetry}>
          ลองโหลดอีกครั้ง
        </button>
      )}
    </div>
  )
}

export function Loading({ label = 'กำลังโหลดข้อมูล' }: { label?: string }) {
  return (
    <p className="loading" role="status">
      <span className="loading__dot" aria-hidden="true" />
      {label}
    </p>
  )
}

/**
 * A data table. On phones (≤560px) the CSS lays each row out as a card of labelled fields, so every cell carries
 * its column heading as data-label. Between phone and desktop widths a wide table scrolls inside itself, and
 * the region becomes a tab stop only while it actually scrolls.
 */
export function TableWrap({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [scrolls, setScrolls] = useState(false)

  // Runs after every render: rows arrive and change with the data
  useLayoutEffect(() => {
    const wrap = ref.current
    if (!wrap) return
    for (const table of wrap.querySelectorAll('table')) {
      const heads = [...table.querySelectorAll('thead th')].map((th) => th.textContent?.trim() ?? '')
      for (const row of table.querySelectorAll('tbody tr')) {
        ;[...row.children].forEach((cell, i) => {
          if (heads[i] && cell.getAttribute('data-label') !== heads[i]) cell.setAttribute('data-label', heads[i])
        })
      }
    }
  })

  useEffect(() => {
    const wrap = ref.current
    if (!wrap) return
    const check = () => setScrolls(wrap.scrollWidth > wrap.clientWidth + 1)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(wrap)
    const table = wrap.querySelector('table')
    if (table) ro.observe(table)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={ref} className={`table-wrap ${className ?? ''}`} role="region" aria-label={label} tabIndex={scrolls ? 0 : undefined}>
      {children}
    </div>
  )
}

export function Pager({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  if (pages <= 1) return null
  return (
    <nav className="pager" aria-label="เปลี่ยนหน้า">
      <button type="button" className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        <ChevronLeft size={16} aria-hidden /> ก่อนหน้า
      </button>
      <span className="pager__at">
        หน้า {page} จาก {pages}
      </span>
      <button type="button" className="btn btn-ghost btn-sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>
        ถัดไป <ChevronRight size={16} aria-hidden />
      </button>
    </nav>
  )
}

/** Radio buttons drawn as a pill row (date presets, payment methods, discount type). */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  hideLabel = true,
  className,
}: {
  label: string
  value: T
  options: { value: T; label: ReactNode }[]
  onChange: (v: T) => void
  hideLabel?: boolean
  className?: string
}) {
  const name = useId()
  return (
    <fieldset className={`segmented ${className ?? ''}`}>
      <legend className={hideLabel ? 'visually-hidden' : 'field__label'}>{label}</legend>
      <div className="segmented__track">
        {options.map((o) => (
          <label key={o.value} className="segmented__option">
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

/**
 * Native modal dialog: the browser traps focus, Esc closes it, and the page behind is inert.
 * Rendered only while open, so its form state starts fresh each time.
 */
export function Dialog({
  open,
  onClose,
  title,
  children,
  wide,
  className,
  closeLabel = 'ปิดหน้าต่าง',
}: {
  open: boolean
  onClose: () => void
  title: ReactNode
  children: ReactNode
  wide?: boolean
  className?: string
  closeLabel?: string
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const live = useRef<HTMLDivElement>(null)
  const titleId = useId()
  useEffect(() => {
    const d = ref.current
    if (open && d && !d.open) d.showModal()
  }, [open])
  // Messages raised while this dialog is on top are announced from its own live region (see ToastProvider)
  useEffect(() => {
    if (!open || !live.current) return
    return registerToastSlot(live.current)
  }, [open])
  if (!open) return null
  return (
    <dialog
      ref={ref}
      className={`dialog ${wide ? 'dialog--wide' : ''} ${className ?? ''}`}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        // A click on the backdrop (the dialog element itself, outside its box) closes it
        if (e.target === ref.current) {
          const r = ref.current.getBoundingClientRect()
          const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
          if (!inside) onClose()
        }
      }}
    >
      <div className="dialog__head">
        <h2 id={titleId} className="dialog__title">
          {title}
        </h2>
        <button type="button" className="icon-btn" onClick={onClose} aria-label={closeLabel}>
          <X size={20} aria-hidden />
        </button>
      </div>
      <div className="dialog__body">{children}</div>
      <div ref={live} className="dialog__live" role="status" aria-live="polite" />
    </dialog>
  )
}

/** A labelled form row; the error sits right under its field and is announced. */
export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
}: {
  label: ReactNode
  hint?: ReactNode
  error?: string | null
  children: ReactNode
  htmlFor: string
}) {
  return (
    <div className={`field ${error ? 'field--error' : ''}`}>
      <label className="field__label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint && <p className="field__hint">{hint}</p>}
      {error && (
        <p className="field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

/** Parses a typed baht amount ("1,250.5" → 1250.5); NaN when empty or not a number. */
export function parseAmount(s: string): number {
  const t = s.replace(/[,\s]/g, '')
  return t === '' ? Number.NaN : Number(t)
}

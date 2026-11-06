import { useLang } from '../i18n'
import { labels } from '../lib/locale'
import './RatingMeter.css'

const MAX = 5

/**
 * Five-segment trait meter. Exposed to assistive tech as a single labelled value.
 * `showValue` adds the score as a small figure after the segments, like a spec-sheet reading.
 */
export function RatingMeter({ value, label, showValue = false }: { value: number; label: string; showValue?: boolean }) {
  const v = Math.max(0, Math.min(MAX, Math.round(value)))
  const lang = useLang()
  return (
    <span
      className={showValue ? 'meter meter--value' : 'meter'}
      role="img"
      aria-label={labels(lang).meter(label, v, MAX)}
    >
      {Array.from({ length: MAX }, (_, i) => (
        <span key={i} className={i < v ? 'meter__seg is-on' : 'meter__seg'} />
      ))}
      {showValue && (
        <span className="meter__value" aria-hidden="true">
          {v}
        </span>
      )}
    </span>
  )
}

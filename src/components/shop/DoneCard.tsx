import { useEffect, useRef, type ReactNode } from 'react'
import { CheckCircle2 } from 'lucide-react'

/**
 * What a sent form turns into: a confirmation with its reference number. Focus moves to its heading
 * when it appears, so keyboard and screen-reader users land on the result instead of a vanished button.
 */
export function DoneCard({ title, refLabel, refValue, children }: { title: string; refLabel?: string; refValue?: string; children?: ReactNode }) {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    heading.current?.focus()
  }, [])
  return (
    <div className="done-card">
      <CheckCircle2 size={32} aria-hidden />
      <h2 ref={heading} tabIndex={-1}>
        {title}
      </h2>
      {refValue && (
        <p className="done-card__ref">
          {refLabel} {refValue}
        </p>
      )}
      {children}
    </div>
  )
}

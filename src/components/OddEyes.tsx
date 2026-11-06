/** Brand mark: the Khao Manee's odd eyes — one blue, one gold. */
export function OddEyes({ size = 22 }: { size?: number }) {
  return (
    <svg className="odd-eyes" width={size * 1.6} height={size} viewBox="0 0 32 20" aria-hidden="true" focusable="false">
      <ellipse cx="8" cy="10" rx="7" ry="8" fill="var(--brand-blue)" />
      <ellipse cx="24" cy="10" rx="7" ry="8" fill="var(--brand-gold)" />
      <ellipse cx="8" cy="10" rx="1.6" ry="5.6" fill="var(--paper)" />
      <ellipse cx="24" cy="10" rx="1.6" ry="5.6" fill="var(--paper)" />
    </svg>
  )
}

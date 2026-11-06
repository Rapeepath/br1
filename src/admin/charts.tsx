// Charts as inline SVG (dataviz rules): one series → one hue, thin columns with a rounded data end and a
// square baseline, solid hairline grid, a tooltip on hover and on keyboard focus, and a table twin.
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Link } from 'react-router'
import { compact } from './format'
import { TableWrap } from './ui'
import './charts.css'

export interface Point {
  key: string
  /** Axis label under the column (kept short) */
  tick: string
  /** Full label for the tooltip and the table */
  label: string
  value: number
  /** Second line in the tooltip and a column in the table ("5 บิล") */
  extra?: string
}

function niceStep(raw: number): number {
  if (raw <= 0) return 1
  const pow = 10 ** Math.floor(Math.log10(raw))
  const f = raw / pow
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * pow
}

function useWidth<T extends HTMLElement>(fallback: number) {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(fallback)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(240, Math.round(entry.contentRect.width))))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, width] as const
}

/** Column path whose top corners are rounded (the data end) and whose base is square. */
function column(x: number, y: number, w: number, h: number): string {
  const r = Math.min(4, w / 2, h)
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`
}

export function ColumnChart({
  title,
  points,
  format,
  valueLabel,
  extraLabel,
  tickEvery = 1,
  height = 230,
}: {
  title: string
  points: Point[]
  format: (n: number) => string
  /** Heading of the value column in the table view */
  valueLabel: string
  extraLabel?: string
  /** Label every n-th column so ticks never collide */
  tickEvery?: number
  height?: number
}) {
  const [wrap, width] = useWidth<HTMLDivElement>(640)
  const [active, setActive] = useState<number | null>(null)
  const [asTable, setAsTable] = useState(false)
  const tipId = useId()

  const m = { top: 14, right: 6, bottom: 30, left: 52 }
  const plotW = width - m.left - m.right
  const plotH = height - m.top - m.bottom
  const max = Math.max(0, ...points.map((p) => p.value))
  const step = niceStep(max / 4)
  const top = Math.max(step, Math.ceil(max / step) * step)
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step)
  const band = plotW / Math.max(1, points.length)
  const barW = Math.max(3, Math.min(24, band * 0.62))
  const y = (v: number) => m.top + plotH - (v / top) * plotH
  const every = Math.max(tickEvery, Math.ceil((points.length * 44) / plotW))

  const onKey = (e: KeyboardEvent) => {
    if (!points.length) return
    const at = active ?? points.length - 1
    let next: number | null = null
    if (e.key === 'ArrowRight') next = Math.min(points.length - 1, at + 1)
    else if (e.key === 'ArrowLeft') next = Math.max(0, at - 1)
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = points.length - 1
    else if (e.key === 'Escape') setActive(null)
    if (next !== null) {
      e.preventDefault()
      setActive(next)
    }
  }

  const a = active !== null ? points[active] : null
  const tipLeft = active !== null ? Math.min(Math.max(m.left + band * (active + 0.5), 70), width - 70) : 0

  return (
    <figure className="chart">
      <div className="chart__bar">
        <figcaption className="chart__title">{title}</figcaption>
        <button type="button" className="chart__toggle" aria-pressed={asTable} onClick={() => setAsTable((t) => !t)}>
          ดูเป็นตาราง
        </button>
      </div>
      {asTable ? (
        <TableWrap className="chart__table" label={`${title} แบบตาราง`}>
          <table className="table table--compact">
            <thead>
              <tr>
                <th scope="col">ช่วงเวลา</th>
                <th scope="col" className="num">
                  {valueLabel}
                </th>
                {extraLabel && (
                  <th scope="col" className="num">
                    {extraLabel}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {points.map((p) => (
                <tr key={p.key}>
                  <th scope="row">{p.label}</th>
                  <td className="num">{format(p.value)}</td>
                  {extraLabel && <td className="num">{p.extra}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      ) : (
        <div
          ref={wrap}
          className="chart__plot"
          tabIndex={0}
          role="group"
          aria-label={`${title} กดลูกศรซ้ายขวาเพื่ออ่านค่าทีละช่วง`}
          aria-describedby={a ? tipId : undefined}
          onKeyDown={onKey}
          onBlur={() => setActive(null)}
          onMouseLeave={() => setActive(null)}
        >
          <svg width={width} height={height} aria-hidden="true" focusable="false">
            {ticks.map((t) => (
              <g key={t}>
                <line className="chart__grid" x1={m.left} x2={width - m.right} y1={y(t)} y2={y(t)} />
                <text className="chart__ytick" x={m.left - 8} y={y(t)} dy="0.32em" textAnchor="end">
                  {t === 0 ? '0' : compact(t)}
                </text>
              </g>
            ))}
            {points.map((p, i) => {
              const h = (p.value / top) * plotH
              const x = m.left + band * i + (band - barW) / 2
              return (
                <g key={p.key}>
                  {h > 0 && (
                    <path
                      className={`chart__col ${active !== null && active !== i ? 'chart__col--dim' : ''}`}
                      d={column(x, y(p.value), barW, h)}
                    />
                  )}
                  {i % every === (points.length - 1) % every && (
                    <text className="chart__xtick" x={m.left + band * (i + 0.5)} y={height - 8} textAnchor="middle">
                      {p.tick}
                    </text>
                  )}
                  {/* Hit area: the whole band, taller than the column, so small values are easy to hover */}
                  <rect
                    className="chart__hit"
                    x={m.left + band * i}
                    y={m.top}
                    width={band}
                    height={plotH}
                    onMouseEnter={() => setActive(i)}
                  />
                </g>
              )
            })}
            <line className="chart__axis" x1={m.left} x2={width - m.right} y1={y(0)} y2={y(0)} />
          </svg>
          {a && (
            <div id={tipId} className="chart__tip" style={{ left: tipLeft }} role="status">
              <span className="chart__tip-label">{a.label}</span>
              <strong>{format(a.value)}</strong>
              {a.extra && <span>{a.extra}</span>}
            </div>
          )}
        </div>
      )}
    </figure>
  )
}

export interface BarRow {
  key: string
  label: ReactNode
  value: number
  /** The figure printed at the bar's end */
  display: string
  sub?: string
  to?: string
}

/** Ranked horizontal bars; every value is printed, so the list reads fine without the bars. */
export function BarList({ title, rows, empty = 'ยังไม่มีข้อมูลในช่วงนี้' }: { title: string; rows: BarRow[]; empty?: string }) {
  const max = Math.max(0, ...rows.map((r) => r.value))
  return (
    <figure className="barlist">
      <figcaption className="chart__title">{title}</figcaption>
      {rows.length === 0 || max === 0 ? (
        <p className="barlist__empty">{empty}</p>
      ) : (
        <ul>
          {rows.map((r) => (
            <li key={r.key}>
              <div className="barlist__row">
                <span className="barlist__label">{r.to ? <Link to={r.to}>{r.label}</Link> : r.label}</span>
                <span className="barlist__value">{r.display}</span>
              </div>
              {r.sub && <span className="barlist__sub">{r.sub}</span>}
              <span className="barlist__track" aria-hidden="true">
                <span className="barlist__fill" style={{ width: `${Math.max(0.5, (r.value / max) * 100)}%` }} />
              </span>
            </li>
          ))}
        </ul>
      )}
    </figure>
  )
}

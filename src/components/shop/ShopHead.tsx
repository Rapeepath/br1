import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import './shop.css'

/** The pastel page head every shop page opens with: title (two-tone), lede, an optional aside. */
export function ShopHead({
  title,
  tint,
  lede,
  crumb,
  aside,
}: {
  title: ReactNode
  /** Second line of the title, in ginger */
  tint?: ReactNode
  lede?: ReactNode
  crumb?: { to: string; label: string }
  aside?: ReactNode
}) {
  return (
    <header className="shop-head">
      <div className="container shop-head__inner">
        <div>
          {crumb && (
            <Link to={crumb.to} className="shop-head__crumb">
              <ArrowLeft size={16} aria-hidden />
              {crumb.label}
            </Link>
          )}
          <h1>
            {title}
            {tint && (
              <>
                <br />
                <span className="tint">{tint}</span>
              </>
            )}
          </h1>
        </div>
        {(lede || aside) && (
          <div className="shop-head__aside">
            {lede && <p className="shop-head__lede">{lede}</p>}
            {aside}
          </div>
        )}
      </div>
    </header>
  )
}

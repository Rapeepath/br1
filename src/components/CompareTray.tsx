import { Fragment, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { ArrowRight, Plus, X } from 'lucide-react'
import { getBreed } from '../data'
import { useLang, useT } from '../i18n'
import { focusSoon, focusSoonQuietly } from '../lib/a11y'
import { COMPARE_LIMIT, useCompare } from '../lib/compare'
import { Picture } from './Picture'
import './CompareTray.css'

/** Floating summary of the comparison list; hidden on the compare page itself. */
export function CompareTray() {
  const { ids, remove, clear } = useCompare()
  const { pathname } = useLocation()
  const t = useT()
  const lang = useLang()
  const selected = ids.map(getBreed).filter((b) => b != null)
  const hidden = selected.length === 0 || pathname === '/compare'
  const nameOf = (b: (typeof selected)[number]) => (lang === 'en' ? b.nameEn : b.nameTh)

  // Announce changes, including the list becoming empty (otherwise the region just goes silent).
  const [announcement, setAnnouncement] = useState('')
  const prevCount = useRef(selected.length)
  useEffect(() => {
    if (prevCount.current === selected.length) return
    setAnnouncement(
      selected.length > 0 ? t('tray.announce', { count: selected.length, limit: COMPARE_LIMIT }) : t('tray.cleared'),
    )
    prevCount.current = selected.length
  }, [selected.length, t])

  const removeAt = (index: number, id: string) => {
    remove(id)
    focusSoon(
      () => document.querySelectorAll<HTMLElement>('.compare-tray__item button')[index] ?? null,
      () => document.querySelectorAll<HTMLElement>('.compare-tray__item button')[index - 1] ?? null,
      '.compare-tray__go',
    )
    // Last item removed: the tray is gone, so land quietly near the content without scrolling.
    if (selected.length === 1) focusSoonQuietly('#breeds', '#main h1', '#main')
  }

  const clearAll = () => {
    clear()
    focusSoonQuietly('#breeds', '#main h1', '#main')
  }

  return (
    <>
      <p className="visually-hidden" aria-live="polite">
        {announcement}
      </p>
      {!hidden && (
        <aside className="compare-tray" aria-label={t('tray.label')}>
          <ul className="compare-tray__list">
            {selected.map((b, i) => (
              <li key={b.id} className="compare-tray__item">
                <Picture
                  src={b.image.srcSmall}
                  alt=""
                  sizes="40px"
                  width={40}
                  height={40}
                  style={b.image.focus ? { objectPosition: b.image.focus } : undefined}
                />
                {/* Two-word names wrap at the space, never inside a word */}
                <span className="compare-tray__name" lang={lang === 'en' ? 'en' : undefined}>
                  {nameOf(b).split(' ').map((word, k) => (
                    <Fragment key={k}>
                      {k > 0 && ' '}
                      <span className="nowrap">{word}</span>
                    </Fragment>
                  ))}
                </span>
                <button
                  type="button"
                  className="compare-tray__remove"
                  onClick={() => removeAt(i, b.id)}
                  aria-label={t('tray.remove', { name: nameOf(b) })}
                >
                  <X size={14} aria-hidden />
                </button>
              </li>
            ))}
            {Array.from({ length: COMPARE_LIMIT - selected.length }, (_, i) => (
              <li key={`empty-${i}`} className="compare-tray__slot" aria-hidden="true">
                <Plus size={14} />
              </li>
            ))}
          </ul>
          <div className="compare-tray__actions">
            <button type="button" className="btn btn-ghost btn-sm compare-tray__clear" onClick={clearAll}>
              {t('tray.clear')}
            </button>
            <Link to="/compare" className="btn btn-primary btn-sm compare-tray__go">
              {t('tray.go', { count: selected.length, limit: COMPARE_LIMIT })}
              <ArrowRight size={16} aria-hidden className="btn__arrow compare-tray__arrow" />
            </Link>
          </div>
        </aside>
      )}
    </>
  )
}

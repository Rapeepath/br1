import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowRight, PawPrint } from 'lucide-react'
import { breeds, getBreed } from '../data'
import { useLang } from '../i18n'
import { localized } from '../i18n/content'
import { asset } from '../lib/asset'
import { useLiveCatalog } from '../lib/live'
import { useContactAway } from '../lib/fab'
import type { Breed } from '../lib/types'
import './HelloStage.css'

/*
  The home page's first screen. Cats sit inside the headline as little photo capsules, and every so often
  one gives a cat's slow blink (the lid closes, a different breed opens its eyes), which in cat language
  means "I trust you". Below, every breed as a round portrait to step straight into its page.
  Motion: one load sequence, then each capsule blinks at most twice in the first five seconds (WCAG 2.2.2);
  after that a capsule only blinks when it's pointed at or tapped. None of it runs under reduced motion.
*/

// Thai heritage breeds in the first capsule (the Khao Manee's odd eyes are the logo), favourites in the second
const POOLS = [
  ['khao-manee', 'siamese', 'korat'],
  ['scottish-fold', 'british-shorthair', 'persian', 'maine-coon', 'ragdoll', 'bengal'],
]
const RING_TONES = ['tone-peach', 'tone-mint', 'tone-butter', 'tone-sky', 'tone-rose', 'tone-lavender']

const COPY = {
  th: {
    lines: ['แมว', 'ตัวไหน', 'ที่ใช่', 'สำหรับบ้านคุณ'],
    // Compounds the browser's Thai breaker splits ("ลูก|แมว", "สาย|พันธุ์") stay whole
    lede: (n: number): ReactNode => (
      <>
        {n} <span className="nowrap">สายพันธุ์</span>ที่คนไทยรัก ทั้งนิสัย การดูแล สุขภาพ และราคาในไทย พร้อม
        <span className="nowrap">ลูกแมว</span>ที่รอพบคุณที่ร้าน
      </>
    ),
    seeAll: (n: number) => `ดูทั้ง ${n} สายพันธุ์`,
    kittens: (n: number | null) => (n ? `ลูกแมวพร้อมรับ ${n} ตัว` : 'ดูลูกแมวที่พร้อมรับ'),
    rail: (n: number) => `รู้จักทั้ง ${n} สายพันธุ์`,
    thai: 'ไทย',
  },
  en: {
    lines: ['Which cat', '', 'is right', 'for your home?'],
    lede: (n: number): ReactNode =>
      `The ${n} breeds Thailand loves: temperament, care, health and Thai prices, plus kittens waiting to meet you at the shop.`,
    seeAll: (n: number) => `See all ${n} breeds`,
    kittens: (n: number | null) => (n ? `${n} kittens ready for a home` : 'See kittens ready for a home'),
    rail: (n: number) => `Meet all ${n} breeds`,
    thai: 'Thai',
  },
}

const short = (s: string) => s.replace(/\s*\(.*\)$/, '')

/** Motion is welcome: a browser (not the prerender) whose visitor hasn't asked for less. */
const motionWelcome = () =>
  typeof window !== 'undefined' && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** A photo capsule inside the headline that slow-blinks from one breed to the next. Decorative. */
function BlinkChip({ pool, tilt, autoBlinks }: { pool: Breed[]; tilt: number; autoBlinks: number[] }) {
  const [index, setIndex] = useState(0)
  const [blinking, setBlinking] = useState(false)
  const busy = useRef(false)
  const timers = useRef<number[]>([])

  const blink = useCallback(() => {
    if (busy.current || pool.length < 2) return
    const next = () => setIndex((i) => (i + 1) % pool.length)
    if (!motionWelcome()) {
      next()
      return
    }
    busy.current = true
    setBlinking(true)
    // The new breed takes the old one's place while the lid is shut
    timers.current.push(window.setTimeout(next, 300))
  }, [pool.length])

  useEffect(() => {
    if (!motionWelcome()) return
    const t = timers.current
    autoBlinks.forEach((ms) => t.push(window.setTimeout(blink, ms)))
    return () => t.forEach(clearTimeout)
  }, [autoBlinks, blink])

  const current = pool[index]
  const upcoming = pool[(index + 1) % pool.length]
  if (!current) return null
  return (
    <span
      className={`blink${blinking ? ' is-blinking' : ''}`}
      style={{ '--tilt': `${tilt}deg` } as CSSProperties}
      aria-hidden="true"
      onPointerEnter={(e) => e.pointerType === 'mouse' && blink()}
      onClick={blink}
      onAnimationEnd={(e) => {
        // Only the lid's blink ends a blink (the capsule's opening animation bubbles here too)
        if (e.animationName !== 'blink-lid') return
        setBlinking(false)
        busy.current = false
      }}
    >
      <span className="blink__lid">
        <img
          key={current.id}
          src={asset(current.image.srcSmall)}
          alt=""
          decoding="async"
          fetchPriority="high"
          style={current.image.focus ? { objectPosition: current.image.focus } : undefined}
        />
        {/* The next breed is already loaded, so the swap never shows an empty capsule */}
        {upcoming && upcoming.id !== current.id && (
          <img className="blink__next" key={`next-${upcoming.id}`} src={asset(upcoming.image.srcSmall)} alt="" decoding="async" loading="lazy" />
        )}
      </span>
    </span>
  )
}

export function HelloStage({ onBrowse }: { onBrowse: () => void }) {
  const lang = useLang()
  const c = COPY[lang]
  const { status, items } = useLiveCatalog()
  const ref = useRef<HTMLElement>(null)
  const pools = POOLS.map((ids) => ids.map(getBreed).filter((b): b is Breed => b != null))
  const kittens =
    status === 'live' && items
      ? items.filter((i) => i.categoryId === 'kitten').reduce((s, i) => s + (i.kittensAvailable ?? i.stock ?? 0), 0)
      : null

  // While this screen is in view on a phone, the floating contact button stays out of the way
  useContactAway(ref)

  const [l1, l1b, l2, l3] = c.lines
  return (
    <section ref={ref} className="hello" aria-labelledby="hero-title">
      <div className="container hello__inner">
        {/* The headline sizes itself to this box, so its longest line always fits (HelloStage.css) */}
        <div className="hello__titlebox">
          <h1 id="hero-title" className="hello__title">
            <span className="hello__line">
              {l1}
              <BlinkChip pool={pools[0]} tilt={-5} autoBlinks={[1500, 3900]} />
              {l1b}
            </span>{' '}
            <span className="hello__line">
              {l2}
              <BlinkChip pool={pools[1]} tilt={4} autoBlinks={[2700]} />
            </span>{' '}
            <span className="hello__line">{l3}</span>
          </h1>
        </div>

        <div className="hello__aside">
          <p className="hello__lede">{c.lede(breeds.length)}</p>
          <div className="hello__actions">
            <button type="button" className="btn btn-primary" onClick={onBrowse}>
              {c.seeAll(breeds.length)}
              <ArrowRight size={18} aria-hidden className="btn__arrow" />
            </button>
            <Link to="/kittens" className="btn btn-ghost hello__kittens">
              <PawPrint size={18} aria-hidden />
              {c.kittens(kittens)}
            </Link>
          </div>
        </div>

        <div className="hello__rail">
          <p className="hello__rail-title" id="hello-rail-title">
            {c.rail(breeds.length)}
          </p>
          <ul className="hello__breeds" aria-labelledby="hello-rail-title">
            {breeds.map((b, i) => {
              const name = lang === 'en' ? short(localized(b, 'en').nameEn) : short(b.nameTh)
              return (
                <li key={b.id} style={{ '--i': i } as CSSProperties}>
                  <Link to={`/breeds/${b.id}`} className={`hello__breed ${RING_TONES[i % RING_TONES.length]}`}>
                    <span className="hello__portrait">
                      <img
                        src={asset(b.image.srcSmall)}
                        alt=""
                        width={160}
                        height={160}
                        loading={i < 6 ? 'eager' : 'lazy'}
                        decoding="async"
                        style={b.image.focus ? { objectPosition: b.image.focus } : undefined}
                      />
                      {b.group === 'thai' && <span className="hello__thai">{c.thai}</span>}
                    </span>
                    <span className="hello__name">{name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}

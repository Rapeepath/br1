import { useEffect, useMemo, type ReactNode } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router'
import { ArrowUpRight, ClipboardCheck, RotateCcw, Syringe, Wallet } from 'lucide-react'
import { BreedCard } from '../components/BreedCard'
import { HelloStage } from '../components/HelloStage'
import { FilterBar } from '../components/FilterBar'
import { breeds, market } from '../data'
import { useLang } from '../i18n'
import { localized } from '../i18n/content'
import { focusSoon } from '../lib/a11y'
import { applyFilters, DEFAULT_FILTERS, isFiltered, SORT_LABEL, type Filters, type SortKey } from '../lib/filter'
import { COAT_LABEL, formatNumber } from '../lib/format'
import { pick } from '../lib/locale'
import type { CoatLength } from '../lib/types'
import './HomePage.css'

function readFilters(p: URLSearchParams): Filters {
  const pick = <T extends string>(key: string, allowed: readonly T[], fallback: T): T => {
    const v = p.get(key)
    return v && (allowed as readonly string[]).includes(v) ? (v as T) : fallback
  }
  return {
    q: p.get('q') ?? '',
    group: pick('group', ['all', 'thai', 'international'] as const, 'all'),
    coat: pick('coat', ['all', ...(Object.keys(COAT_LABEL) as CoatLength[])], 'all'),
    size: pick('size', ['all', 'small', 'medium', 'large'] as const, 'all'),
    sort: pick('sort', Object.keys(SORT_LABEL) as SortKey[], 'default'),
  }
}

function toParams(f: Filters): URLSearchParams {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(f)) {
    if (v !== DEFAULT_FILTERS[k as keyof Filters] && v !== '') p.set(k, v)
  }
  return p
}

const COPY = {
  th: {
    guide: 'อ่านคู่มือก่อนซื้อ',
    allTitle: 'สายพันธุ์ทั้งหมด',
    allLede: (
      <>
        เลือก<span className="nowrap">สายพันธุ์</span>เพื่อดูข้อมูลครบทุกด้าน หรือเพิ่มได้สูงสุด 3 <span className="nowrap">สายพันธุ์</span>เพื่อ<span className="nowrap">เปรียบเทียบ</span>กัน
      </>
    ) as ReactNode,
    found: (n: number, of: number) => `พบ ${n} จาก ${of} สายพันธุ์`,
    total: (n: number) => `ทั้งหมด ${n} สายพันธุ์`,
    clear: 'ล้างตัวกรอง',
    emptyTitle: 'ไม่พบสายพันธุ์ที่ตรงกับเงื่อนไขนี้',
    emptyBody: 'ลองใช้คำค้นที่สั้นลง หรือลดตัวกรองบางข้อ',
    clearAll: 'ล้างตัวกรองทั้งหมด',
    bandA: 'ก่อนรับลูกแมว',
    bandB: 'เข้าบ้าน',
    bandLede: 'สามเรื่องที่ควรเตรียมให้พร้อม ไม่ว่าจะเลือกสายพันธุ์ใด',
    checklist: 'เช็กลิสต์จากฟาร์ม',
    checklistBody: (n: number) => `${n} ข้อที่ควรได้รับและควรถามก่อนจ่ายเงิน`,
    vaccines: 'วัคซีนลูกแมว',
    vaccinesBody: 'ตารางวัคซีนหลักและพิษสุนัขบ้าตามช่วงอายุ',
    monthly: 'ค่าใช้จ่ายต่อเดือน',
    monthlyPre: 'ประมาณ',
    monthlyUnit: 'บาท',
    monthlyPost: 'ไม่รวมค่ารักษาเมื่อเจ็บป่วย',
  },
  en: {
    guide: 'Read the buyer’s guide',
    allTitle: 'All breeds',
    allLede: 'Open a breed for the full picture, or add up to 3 to compare them side by side.' as ReactNode,
    found: (n: number, of: number) => `Showing ${n} of ${of} breeds`,
    total: (n: number) => `All ${n} breeds`,
    clear: 'Clear filters',
    emptyTitle: 'No breed matches these filters',
    emptyBody: 'Try a shorter search, or remove a filter or two.',
    clearAll: 'Clear all filters',
    bandA: 'Before you bring',
    bandB: 'a kitten home',
    bandLede: 'Three things to have ready, whichever breed you choose.',
    checklist: 'Cattery checklist',
    checklistBody: (n: number) => `${n} things to receive and to ask about before you pay`,
    vaccines: 'Kitten vaccines',
    vaccinesBody: 'The core and rabies vaccine schedule by age',
    monthly: 'Monthly costs',
    monthlyPre: 'About',
    monthlyUnit: 'baht',
    monthlyPost: 'not counting vet bills when your cat is ill',
  },
}

const sum = (xs: { min: number; max: number }[]) =>
  xs.reduce((acc, x) => ({ min: acc.min + x.min, max: acc.max + x.max }), { min: 0, max: 0 })

export function HomePage() {
  const [params, setParams] = useSearchParams()
  const filters = readFilters(params)
  const location = useLocation()
  const lang = useLang()
  const c = pick(COPY, lang)

  // Coming back from a breed page: land on the list, not the hero.
  useEffect(() => {
    if ((location.state as { scrollTo?: string } | null)?.scrollTo === 'breeds') {
      requestAnimationFrame(() => {
        const list = document.getElementById('breeds')
        list?.scrollIntoView()
        list?.focus({ preventScroll: true })
      })
    }
  }, [location.key, location.state])
  // English pages search and sort the English text (Thai names still match)
  const pool = lang === 'en' ? breeds.map((b) => localized(b, 'en')) : breeds
  const matched = applyFilters(pool, filters)
  const results = lang === 'en' && filters.sort === 'name' ? [...matched].sort((a, b) => a.nameEn.localeCompare(b.nameEn, 'en')) : matched

  const update = (patch: Partial<Filters>) => setParams(toParams({ ...filters, ...patch }), { replace: true })
  const reset = () => {
    setParams(new URLSearchParams(), { replace: true })
    // The reset button removes itself, so hand focus to the search box.
    focusSoon('[data-breed-search]')
  }

  const coatOptions = useMemo(
    () => (Object.keys(COAT_LABEL) as CoatLength[]).filter((c) => breeds.some((b) => b.coat.length === c)),
    [],
  )
  const monthly = sum(market.ownershipCost.monthly)

  const scrollToBreeds = () => {
    const el = document.getElementById('breeds')
    el?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    el?.focus({ preventScroll: true })
  }

  return (
    <>
      <HelloStage onBrowse={scrollToBreeds} />

      {/* Full-bleed band: the floor the lineup cards stand on */}
      <section id="breeds" className="section lineup" aria-labelledby="breeds-title" tabIndex={-1}>
        <div className="container">
          <div className="section-head">
            <div>
              <h2 id="breeds-title">{c.allTitle}</h2>
            </div>
            <p>{c.allLede}</p>
          </div>

          <FilterBar filters={filters} onChange={update} coatOptions={coatOptions} />

          <div className="results-meta">
            <p aria-live="polite">
              {isFiltered(filters) ? c.found(results.length, breeds.length) : c.total(breeds.length)}
            </p>
            {isFiltered(filters) && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>
                <RotateCcw size={14} aria-hidden />
                {c.clear}
              </button>
            )}
          </div>

          {results.length > 0 ? (
            <ul className="breed-grid">
              {results.map((b) => (
                <li key={b.id}>
                  <BreedCard breed={b} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty">
              <p className="empty__title">{c.emptyTitle}</p>
              <p>{c.emptyBody}</p>
              <button type="button" className="btn btn-primary btn-sm" onClick={reset}>
                {c.clearAll}
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="guide-band" aria-labelledby="guide-band-title">
        <div className="container guide-band__inner">
          <div className="guide-band__intro">
            <h2 id="guide-band-title">
              {c.bandA} <span className="nowrap">{c.bandB}</span>
            </h2>
            <p>{c.bandLede}</p>
            <Link to="/guide" className="link-arrow guide-band__cta">
              {c.guide}
              <ArrowUpRight size={18} aria-hidden />
            </Link>
          </div>
          <ul className="guide-band__list">
            <li className="tone-peach">
              <Link to="/guide" state={{ section: 'checklist' }}>
                <span className="guide-band__icon" aria-hidden="true">
                  <ClipboardCheck size={22} strokeWidth={2} />
                </span>
                <h3>{c.checklist}</h3>
                <p>{c.checklistBody(market.buyerChecklist.length)}</p>
              </Link>
            </li>
            <li className="tone-mint">
              <Link to="/guide" state={{ section: 'vaccines' }}>
                <span className="guide-band__icon" aria-hidden="true">
                  <Syringe size={22} strokeWidth={2} />
                </span>
                <h3>{c.vaccines}</h3>
                <p>{c.vaccinesBody}</p>
              </Link>
            </li>
            <li className="tone-sky">
              <Link to="/guide" state={{ section: 'costs' }}>
                <span className="guide-band__icon" aria-hidden="true">
                  <Wallet size={22} strokeWidth={2} />
                </span>
                <h3>{c.monthly}</h3>
                <p>
                  {c.monthlyPre}{' '}
                  <span className="nowrap">
                    {formatNumber(monthly.min)}–{formatNumber(monthly.max)} {c.monthlyUnit}
                  </span>{' '}
                  {c.monthlyPost}
                </p>
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </>
  )
}

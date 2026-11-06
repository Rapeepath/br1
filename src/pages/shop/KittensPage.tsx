import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { CalendarDays, RotateCcw } from 'lucide-react'
import { breeds } from '../../data'
import { useLang } from '../../i18n'
import { KittenCard } from '../../components/shop/KittenCard'
import { ShopHead } from '../../components/shop/ShopHead'
import { ContactButtons } from '../../components/shop/StoreDetails'
import { kittenText, usePublic, type Kitten } from '../../lib/kittens'
import { READY_WEEKS } from '../../lib/shop'
import '../../components/shop/kittens.css'
import './shop-pages.css'
import './kittens-page.css'

type SexFilter = 'all' | 'male' | 'female'
type AgeFilter = 'all' | 'ready' | 'young'
type Sort = 'young' | 'old' | 'price-asc' | 'price-desc'

const COPY = {
  th: {
    title: 'ลูกแมวพร้อมรับ',
    tint: 'เลือกน้องแล้วจองได้ทันที',
    lede: 'ข้อมูลจากระบบของร้าน อัปเดตตามการจองจริง ทุกตัวตรวจสุขภาพโดยสัตวแพทย์ ฉีดวัคซีนตามอายุ และฝังไมโครชิปแล้ว',
    book: 'นัดชมที่ร้าน',
    filters: 'ตัวกรองลูกแมว',
    breed: 'สายพันธุ์',
    allBreeds: 'ทุกสายพันธุ์',
    sex: 'เพศ',
    sexes: { all: 'ทั้งหมด', male: 'ตัวผู้', female: 'ตัวเมีย' } as Record<SexFilter, string>,
    color: 'สี',
    allColors: 'ทุกสี',
    age: 'อายุ',
    ages: { all: 'ทุกอายุ', ready: `รับได้เลย (${READY_WEEKS} สัปดาห์ขึ้นไป)`, young: `จองไว้ก่อน (ไม่ถึง ${READY_WEEKS} สัปดาห์)` } as Record<AgeFilter, string>,
    sort: 'เรียงตาม',
    sorts: { young: 'อายุน้อยไปมาก', old: 'อายุมากไปน้อย', 'price-asc': 'ราคาต่ำไปสูง', 'price-desc': 'ราคาสูงไปต่ำ' } as Record<Sort, string>,
    count: (n: number, all: number) => (n === all ? `ทั้งหมด ${all} ตัว` : `พบ ${n} จาก ${all} ตัว`),
    reset: 'ล้างตัวกรอง',
    reservedNote: 'น้องที่ติดจองยังแสดงอยู่ ถ้าการจองหมดเวลา น้องจะกลับมาว่างอีกครั้ง',
    loading: 'กำลังโหลดรายการลูกแมว',
    emptyTitle: 'ไม่พบน้องที่ตรงกับตัวกรองนี้',
    emptyBody: 'ลองเลือกสายพันธุ์หรือเพศอื่น หรือฝากความต้องการไว้ ร้านจะแจ้งเมื่อมีครอกใหม่',
    ask: 'ฝากความต้องการ',
    offlineTitle: 'ยังดูรายการลูกแมวไม่ได้ในขณะนี้',
    offlineBody: 'ระบบของร้านไม่ตอบสนอง ลองใหม่อีกครั้ง หรือโทรและทัก LINE สอบถามน้องที่พร้อมรับได้เลย',
    retry: 'ลองใหม่',
    noneTitle: 'ตอนนี้ยังไม่มีลูกแมวพร้อมรับ',
    more: (n: number) => `ดูเพิ่มอีก ${n} ตัว`,
  },
  en: {
    title: 'Kittens ready for a home',
    tint: 'Find yours and reserve it now',
    lede: 'Live from the shop’s system, updated as kittens are reserved. Every kitten has been checked by a vet, vaccinated for its age and microchipped.',
    book: 'Book a visit',
    filters: 'Kitten filters',
    breed: 'Breed',
    allBreeds: 'All breeds',
    sex: 'Sex',
    sexes: { all: 'Any', male: 'Male', female: 'Female' } as Record<SexFilter, string>,
    color: 'Colour',
    allColors: 'Any colour',
    age: 'Age',
    ages: { all: 'Any age', ready: `Ready now (${READY_WEEKS}+ weeks)`, young: `Reserve ahead (under ${READY_WEEKS} weeks)` } as Record<AgeFilter, string>,
    sort: 'Sort by',
    sorts: { young: 'Youngest first', old: 'Oldest first', 'price-asc': 'Price, low to high', 'price-desc': 'Price, high to low' } as Record<Sort, string>,
    count: (n: number, all: number) => (n === all ? `${all} kittens` : `${n} of ${all} kittens`),
    reset: 'Clear filters',
    reservedNote: 'Reserved kittens stay listed; if a hold lapses, the kitten becomes available again.',
    loading: 'Loading the kittens',
    emptyTitle: 'No kitten matches these filters',
    emptyBody: 'Try another breed or sex, or tell us what you’re looking for and we’ll let you know about the next litter.',
    ask: 'Tell us what you want',
    offlineTitle: 'The kittens can’t be shown right now',
    offlineBody: 'The shop’s system isn’t responding. Try again, or call or message us on LINE to ask which kittens are available.',
    retry: 'Try again',
    noneTitle: 'No kittens are available right now',
    more: (n: number) => `Show ${n} more`,
  },
}

/** Kittens shown before 'show more' (and how many each press adds) */
const PAGE = 16

const pick = <T extends string>(v: string | null, allowed: readonly T[], fallback: T): T => (v && (allowed as readonly string[]).includes(v) ? (v as T) : fallback)

export function KittensPage() {
  const lang = useLang()
  const c = COPY[lang]
  const id = useId().replace(/:/g, '')
  const [params, setParams] = useSearchParams()
  const res = usePublic<Kitten[]>('kittens')
  const breed = breeds.some((b) => b.id === params.get('breed')) ? params.get('breed')! : 'all'
  const sex = pick<SexFilter>(params.get('sex'), ['all', 'male', 'female'], 'all')
  const age = pick<AgeFilter>(params.get('age'), ['all', 'ready', 'young'], 'all')
  const sort = pick<Sort>(params.get('sort'), ['young', 'old', 'price-asc', 'price-desc'], 'young')
  const color = params.get('color') ?? 'all'

  const update = (key: string, value: string, fallback: string) => {
    const next = new URLSearchParams(params)
    if (value === fallback) next.delete(key)
    else next.set(key, value)
    // A colour belongs to its breed's list; drop it when the breed changes
    if (key === 'breed') next.delete('color')
    setParams(next, { replace: true })
  }

  const all = res.status === 'ready' ? res.data : []
  const colors = useMemo(() => {
    const seen = new Map<string, string>()
    for (const k of all) if (breed === 'all' || k.refId === breed) seen.set(k.color, kittenText(k, lang).color)
    return [...seen.entries()].sort((a, b) => a[1].localeCompare(b[1], lang === 'th' ? 'th' : 'en'))
  }, [all, breed, lang])

  const list = useMemo(() => {
    const out = all.filter(
      (k) =>
        (breed === 'all' || k.refId === breed) &&
        (sex === 'all' || k.sex === sex) &&
        (color === 'all' || k.color === color) &&
        (age === 'all' || (age === 'ready' ? k.ageWeeks >= READY_WEEKS : k.ageWeeks < READY_WEEKS)),
    )
    const by: Record<Sort, (a: Kitten, b: Kitten) => number> = {
      young: (a, b) => a.ageWeeks - b.ageWeeks || a.price - b.price,
      old: (a, b) => b.ageWeeks - a.ageWeeks || a.price - b.price,
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
    }
    // Available kittens before reserved ones, then the chosen order
    return out.sort((a, b) => (a.status === b.status ? by[sort](a, b) : a.status === 'available' ? -1 : 1))
  }, [all, breed, sex, color, age, sort])

  const [shown, setShown] = useState(PAGE)
  const grid = useRef<HTMLUListElement>(null)
  // A new filter starts from the first page again
  useEffect(() => setShown(PAGE), [breed, sex, color, age, sort])
  const visible = list.slice(0, shown)
  const showMore = () => {
    const first = shown
    setShown((n) => n + PAGE)
    // Keyboard users carry on at the first newly shown kitten
    requestAnimationFrame(() => grid.current?.querySelectorAll<HTMLAnchorElement>('.kitten-card__name a')[first]?.focus())
  }

  const filtered = breed !== 'all' || sex !== 'all' || color !== 'all' || age !== 'all'
  const breedName = (b: (typeof breeds)[number]) => (lang === 'en' ? b.nameEn : b.nameTh)

  return (
    <>
      <ShopHead
        title={c.title}
        tint={c.tint}
        lede={c.lede}
        aside={
          <Link to="/booking" className="btn btn-ghost">
            <CalendarDays size={18} aria-hidden />
            {c.book}
          </Link>
        }
      />
      <section className="shop-band">
        <div className="container">
          <form className="kitten-filters shop-sheet" aria-label={c.filters} onSubmit={(e) => e.preventDefault()}>
            <div className="field">
              <label className="field__label" htmlFor={`${id}-breed`}>
                {c.breed}
              </label>
              <select id={`${id}-breed`} className="input input--select" value={breed} onChange={(e) => update('breed', e.target.value, 'all')}>
                <option value="all">{c.allBreeds}</option>
                {breeds.map((b) => (
                  <option key={b.id} value={b.id}>
                    {breedName(b)}
                  </option>
                ))}
              </select>
            </div>
            <fieldset className="choice-group">
              <legend className="field__label">{c.sex}</legend>
              <div className="seg">
                {(['all', 'male', 'female'] as SexFilter[]).map((s) => (
                  <label key={s} className="seg__opt">
                    <input type="radio" name={`${id}-sex`} value={s} checked={sex === s} onChange={() => update('sex', s, 'all')} />
                    <span>{c.sexes[s]}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="field">
              <label className="field__label" htmlFor={`${id}-color`}>
                {c.color}
              </label>
              <select id={`${id}-color`} className="input input--select" value={color} onChange={(e) => update('color', e.target.value, 'all')}>
                <option value="all">{c.allColors}</option>
                {colors.map(([raw, label]) => (
                  <option key={raw} value={raw}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="field__label" htmlFor={`${id}-age`}>
                {c.age}
              </label>
              <select id={`${id}-age`} className="input input--select" value={age} onChange={(e) => update('age', e.target.value, 'all')}>
                {(['all', 'ready', 'young'] as AgeFilter[]).map((a) => (
                  <option key={a} value={a}>
                    {c.ages[a]}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="field__label" htmlFor={`${id}-sort`}>
                {c.sort}
              </label>
              <select id={`${id}-sort`} className="input input--select" value={sort} onChange={(e) => update('sort', e.target.value, 'young')}>
                {(['young', 'old', 'price-asc', 'price-desc'] as Sort[]).map((s) => (
                  <option key={s} value={s}>
                    {c.sorts[s]}
                  </option>
                ))}
              </select>
            </div>
          </form>

          <div className="kitten-results-meta">
            <p aria-live="polite">{res.status === 'ready' ? c.count(list.length, all.length) : res.status === 'loading' ? c.loading : ''}</p>
            {filtered && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
                <RotateCcw size={14} aria-hidden />
                {c.reset}
              </button>
            )}
          </div>

          {res.status === 'loading' && (
            <ul className="kitten-grid" aria-hidden="true">
              {Array.from({ length: 8 }, (_, i) => (
                <li key={i}>
                  <div className="skeleton kitten-skeleton" />
                </li>
              ))}
            </ul>
          )}

          {res.status === 'error' && (
            <div className="empty-card">
              <p className="empty-card__title">{c.offlineTitle}</p>
              <p>{c.offlineBody}</p>
              <button type="button" className="btn btn-ghost btn-sm" onClick={res.reload}>
                {c.retry}
              </button>
              <ContactButtons />
            </div>
          )}

          {res.status === 'ready' && list.length > 0 && (
            <>
              <ul className="kitten-grid" ref={grid}>
                {visible.map((k) => (
                  <li key={k.id}>
                    <KittenCard kitten={k} />
                  </li>
                ))}
              </ul>
              {list.length > shown && (
                <div className="kitten-more">
                  <button type="button" className="btn btn-ghost" onClick={showMore}>
                    {c.more(Math.min(PAGE, list.length - shown))}
                  </button>
                </div>
              )}
              {list.some((k) => k.status === 'reserved') && <p className="kitten-note">{c.reservedNote}</p>}
            </>
          )}

          {res.status === 'ready' && list.length === 0 && (
            <div className="empty-card">
              <p className="empty-card__title">{all.length ? c.emptyTitle : c.noneTitle}</p>
              <p>{c.emptyBody}</p>
              <div className="btn-row">
                {filtered && (
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
                    {c.reset}
                  </button>
                )}
                <Link to={breed !== 'all' ? `/contact?breed=${breed}` : '/contact'} className="btn btn-ghost btn-sm">
                  {c.ask}
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

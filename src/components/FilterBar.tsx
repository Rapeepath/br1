import { useId, useState } from 'react'
import { ChevronDown, Search, SlidersHorizontal } from 'lucide-react'
import { useLang } from '../i18n'
import { SORT_LABEL, type Filters, type SortKey } from '../lib/filter'
import { labels, pick } from '../lib/locale'
import type { CoatLength, Size } from '../lib/types'
import './FilterBar.css'

interface Props {
  filters: Filters
  onChange: (patch: Partial<Filters>) => void
  coatOptions: CoatLength[]
}

const COPY = {
  th: {
    group: { all: 'ทั้งหมด', thai: 'ไทย', international: 'ต่างประเทศ' },
    region: 'ค้นหาและกรองสายพันธุ์',
    search: 'ค้นหาสายพันธุ์',
    placeholder: 'ค้นหาชื่อ นิสัย หรือสีขน',
    groupLegend: 'กลุ่มสายพันธุ์',
    more: 'ตัวกรองเพิ่มเติม',
    coat: 'ความยาวขน',
    coatAll: 'ทุกแบบ',
    size: 'ขนาด',
    sizeAll: 'ทุกขนาด',
    sort: 'เรียงตาม',
    sortLabel: SORT_LABEL,
  },
  en: {
    group: { all: 'All', thai: 'Thai', international: 'International' },
    region: 'Search and filter breeds',
    search: 'Search breeds',
    placeholder: 'Name, trait or colour',
    groupLegend: 'Breed group',
    more: 'More filters',
    coat: 'Coat length',
    coatAll: 'Any',
    size: 'Size',
    sizeAll: 'Any size',
    sort: 'Sort by',
    sortLabel: {
      default: 'Recommended',
      name: 'Name A–Z',
      priceAsc: 'Price, low to high',
      priceDesc: 'Price, high to low',
      sizeAsc: 'Size, small to large',
      lifespanDesc: 'Longest lifespan',
    } satisfies Record<SortKey, string>,
  },
}

const GROUPS: Filters['group'][] = ['all', 'thai', 'international']

const SIZES: Size[] = ['small', 'medium', 'large']

function SelectField<T extends string>(props: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  const id = useId()
  return (
    <div className="select">
      <label htmlFor={id} className="select__label">
        {props.label}
      </label>
      <select id={id} value={props.value} onChange={(e) => props.onChange(e.target.value as T)}>
        {props.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={16} aria-hidden className="select__icon" />
    </div>
  )
}

export function FilterBar({ filters, onChange, coatOptions }: Props) {
  const lang = useLang()
  const c = pick(COPY, lang)
  const L = labels(lang)
  const searchId = useId()
  const extrasId = useId()
  const extrasActive = (filters.coat !== 'all' ? 1 : 0) + (filters.size !== 'all' ? 1 : 0) + (filters.sort !== 'default' ? 1 : 0)
  // Coat, size and sort fold away behind one toggle at every width; it starts open when one of them is set.
  const [open, setOpen] = useState(extrasActive > 0)

  return (
    <div className="toolbar" role="search" aria-label={c.region}>
      <div className="toolbar__search">
        <label htmlFor={searchId} className="visually-hidden">
          {c.search}
        </label>
        <Search size={18} aria-hidden className="toolbar__search-icon" />
        <input
          id={searchId}
          data-breed-search
          type="search"
          value={filters.q}
          placeholder={c.placeholder}
          autoComplete="off"
          onChange={(e) => onChange({ q: e.target.value })}
        />
      </div>

      <fieldset className="segmented">
        <legend className="visually-hidden">{c.groupLegend}</legend>
        {GROUPS.map((value) => (
          <label key={value} className="segmented__option">
            <input
              type="radio"
              name="group"
              value={value}
              checked={filters.group === value}
              onChange={() => onChange({ group: value })}
            />
            <span>{c.group[value]}</span>
          </label>
        ))}
      </fieldset>

      <button
        type="button"
        className="toolbar__more"
        aria-expanded={open}
        aria-controls={extrasId}
        onClick={() => setOpen((o) => !o)}
      >
        <SlidersHorizontal size={16} aria-hidden />
        {c.more}{extrasActive > 0 ? ` (${extrasActive})` : ''}
      </button>

      <div className="toolbar__selects" id={extrasId} data-open={open || undefined}>
        <SelectField
          label={c.coat}
          value={filters.coat}
          onChange={(coat) => onChange({ coat })}
          options={[{ value: 'all', label: c.coatAll }, ...coatOptions.map((k) => ({ value: k, label: L.coat[k] }))]}
        />
        <SelectField
          label={c.size}
          value={filters.size}
          onChange={(size) => onChange({ size })}
          options={[{ value: 'all', label: c.sizeAll }, ...SIZES.map((s) => ({ value: s, label: L.size[s] }))]}
        />
        <SelectField
          label={c.sort}
          value={filters.sort}
          onChange={(sort) => onChange({ sort })}
          options={(Object.keys(SORT_LABEL) as SortKey[]).map((k) => ({ value: k, label: c.sortLabel[k] }))}
        />
      </div>
    </div>
  )
}

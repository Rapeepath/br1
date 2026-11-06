import { Link } from 'react-router'
import { Mars, Venus } from 'lucide-react'
import { useLang } from '../../i18n'
import { kittenPhoto, kittenText, type Kitten } from '../../lib/kittens'
import { money, READY_WEEKS } from '../../lib/shop'
import { Picture } from '../Picture'
import './kittens.css'

const COPY = {
  th: {
    male: 'ตัวผู้',
    female: 'ตัวเมีย',
    weeks: (n: number) => `อายุ ${n} สัปดาห์`,
    available: 'ว่าง จองได้',
    reserved: 'ติดจองแล้ว',
    sold: 'มีเจ้าของแล้ว',
    soon: 'รับกลับได้เมื่อครบ 12 สัปดาห์',
  },
  en: {
    male: 'Male',
    female: 'Female',
    weeks: (n: number) => `${n} weeks old`,
    available: 'Available',
    reserved: 'Reserved',
    sold: 'Homed',
    soon: 'Goes home at 12 weeks',
  },
}

export function SexLabel({ sex }: { sex: Kitten['sex'] }) {
  const lang = useLang()
  const Icon = sex === 'male' ? Mars : Venus
  return (
    <span className={`kitten-sex kitten-sex--${sex}`}>
      <Icon size={16} aria-hidden />
      {COPY[lang][sex]}
    </span>
  )
}

export function StatusPill({ status }: { status: Kitten['status'] }) {
  const lang = useLang()
  const tone = status === 'available' ? 'tone-mint' : status === 'reserved' ? 'tone-butter' : 'tone-lavender'
  return <span className={`pill ${tone}`}>{COPY[lang][status]}</span>
}

/** One kitten as a product tile: photo, name, breed, sex, colour, age, price and status. */
export function KittenCard({ kitten, compact = false }: { kitten: Kitten; compact?: boolean }) {
  const lang = useLang()
  const c = COPY[lang]
  const text = kittenText(kitten, lang)
  const photo = kittenPhoto(kitten)
  const to = `/kittens/${kitten.id}`
  return (
    <article className={`kitten-card${compact ? ' kitten-card--compact' : ''}`} aria-labelledby={`kc-${kitten.id}`} data-status={kitten.status}>
      <Link to={to} className="kitten-card__media" tabIndex={-1} aria-hidden="true">
        {photo && (
          <Picture
            src={photo.srcSmall}
            alt=""
            sizes="(max-width: 560px) 50vw, (max-width: 960px) 33vw, 280px"
            style={photo.focus ? { objectPosition: photo.focus } : undefined}
          />
        )}
        <span className="kitten-card__status">
          <StatusPill status={kitten.status} />
        </span>
      </Link>
      <div className="kitten-card__body">
        <p className="kitten-card__breed">{text.breedName}</p>
        <h3 id={`kc-${kitten.id}`} className="kitten-card__name">
          <Link to={to}>
            {lang === 'th' ? 'น้อง' : ''}
            <span lang="th">{kitten.name}</span>
          </Link>
        </h3>
        <p className="kitten-card__meta">
          <SexLabel sex={kitten.sex} />
          <span className="kitten-card__color">{text.color}</span>
        </p>
        <p className="kitten-card__age">
          {c.weeks(kitten.ageWeeks)}
          {!compact && kitten.ageWeeks < READY_WEEKS && <span className="kitten-card__soon">{c.soon}</span>}
        </p>
        <p className="kitten-card__price">{money(kitten.price, lang)}</p>
      </div>
    </article>
  )
}

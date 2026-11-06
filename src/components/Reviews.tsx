import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { AlertCircle, CheckCircle2, MessageSquarePlus, Star } from 'lucide-react'
import { useLang } from '../i18n'
import { date, pick } from '../lib/locale'
import { getPublic, postPublic } from '../lib/publicApi'
import { FormMessage, Honeypot, TextArea, TextField, sendingLabel, useFormValues, useSubmit, type Errors } from './shop/form'
import './Reviews.css'

interface Review {
  id: string
  name: string
  rating: number
  title: string | null
  body: string
  lang: 'th' | 'en'
  createdAt: string
}

interface Summary {
  average: number | null
  count: number
  rows: Review[]
}

const COPY = {
  th: {
    title: 'รีวิวจากผู้เลี้ยง',
    lede: 'เขียนโดยลูกค้าของร้าน ทุกรีวิวผ่านการตรวจสอบก่อนแสดง',
    average: (a: string, n: number) => `${a} จาก 5 ดาว จาก ${n} รีวิว`,
    empty: (name: string) => `ยังไม่มีรีวิวสำหรับ${name} ถ้าเคยรับลูกแมวจากร้าน เล่าประสบการณ์ให้คนอื่นอ่านเป็นคนแรกได้เลย`,
    write: 'เขียนรีวิว',
    formTitle: (name: string) => `รีวิว${name}`,
    name: 'ชื่อที่แสดง',
    nameHint: 'ชื่อเล่นหรือชื่อย่อก็ได้ จะแสดงคู่กับรีวิว',
    rating: 'คะแนน',
    star: (n: number) => `${n} ดาว`,
    reviewTitle: 'หัวข้อ',
    body: 'เล่าประสบการณ์',
    bodyHint: 'เช่น นิสัยของน้อง การดูแลจากร้าน สุขภาพหลังรับกลับบ้าน',
    consent: 'ยินยอมให้ร้านเผยแพร่ชื่อที่แสดงและรีวิวนี้บนเว็บไซต์ ตาม',
    privacy: 'นโยบายความเป็นส่วนตัว',
    needName: 'กรอกชื่อที่แสดง',
    needRating: 'เลือกคะแนน 1 ถึง 5 ดาว',
    needBody: 'เล่าประสบการณ์อย่างน้อย 10 ตัวอักษร',
    needConsent: 'ติ๊กยินยอมก่อนส่ง',
    submit: 'ส่งรีวิว',
    cancel: 'ยกเลิก',
    done: 'ขอบคุณสำหรับรีวิว',
    pending: 'รีวิวจะแสดงหลังผู้จัดการตรวจสอบ',
    another: 'เขียนอีกรีวิว',
    starsOf: (n: number) => `${n} จาก 5 ดาว`,
  },
  en: {
    title: 'Reviews from owners',
    lede: 'Written by the shop’s customers; every review is checked before it appears.',
    average: (a: string, n: number) => `${a} out of 5 stars from ${n} ${n === 1 ? 'review' : 'reviews'}`,
    empty: (name: string) =>
      `No reviews of the ${name} yet. If you have taken a kitten home from the shop, be the first to tell others about it.`,
    write: 'Write a review',
    formTitle: (name: string) => `Review the ${name}`,
    name: 'Display name',
    nameHint: 'A first name or nickname is fine; it is shown with your review.',
    rating: 'Rating',
    star: (n: number) => `${n} ${n === 1 ? 'star' : 'stars'}`,
    reviewTitle: 'Title',
    body: 'Your experience',
    bodyHint: 'For example the kitten’s personality, the shop’s care, its health after coming home.',
    consent: 'I agree that the shop may publish my display name and this review on the website, as set out in the',
    privacy: 'privacy policy',
    needName: 'Enter a display name',
    needRating: 'Choose 1 to 5 stars',
    needBody: 'Please write at least 10 characters',
    needConsent: 'Tick the box before sending',
    submit: 'Send review',
    cancel: 'Cancel',
    done: 'Thank you for your review',
    pending: 'It will appear once a manager has checked it.',
    another: 'Write another review',
    starsOf: (n: number) => `${n} out of 5 stars`,
  },
}

/** Five stars, filled to a (possibly fractional) rating; decorative, the text beside it says the figure. */
function Stars({ value, size = 18 }: { value: number; size?: number }) {
  return (
    <span className="stars" aria-hidden="true" style={{ ['--fill' as string]: `${(value / 5) * 100}%` }}>
      <span className="stars__row stars__row--off">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} size={size} />
        ))}
      </span>
      <span className="stars__row stars__row--on">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} size={size} />
        ))}
      </span>
    </span>
  )
}

interface Props {
  refId: string
  /** The breed as the page names it, for headings and the structured data */
  name: string
}

/**
 * Owners' reviews of a breed from the shop's system: the average, approved reviews, and a form that sends
 * a new one for a manager to check. Nothing is shown when the shop's system can't be reached, and there are
 * never placeholder reviews: an empty list invites the first one.
 */
export function Reviews({ refId, name }: Props) {
  const lang = useLang()
  const c = pick(COPY, lang)
  const [data, setData] = useState<Summary | null>(null)
  const [offline, setOffline] = useState(false)
  const [writing, setWriting] = useState(false)
  const formId = `review-${refId}`
  const { values, set, bind, reset } = useFormValues({ name: '', rating: 0, title: '', body: '', consent: false, website: '' })
  const submit = useSubmit<{ status: string }>(formId)

  useEffect(() => {
    let live = true
    getPublic<Summary>(`reviews?refId=${encodeURIComponent(refId)}`).then(
      (d) => live && setData(d),
      () => live && setOffline(true),
    )
    return () => {
      live = false
    }
  }, [refId])

  // Star ratings for search engines, only once real approved reviews exist (never in the prerendered page)
  useEffect(() => {
    if (!data || !data.count || data.average == null) return
    const el = document.createElement('script')
    el.type = 'application/ld+json'
    el.dataset.reviews = refId
    el.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name,
      aggregateRating: { '@type': 'AggregateRating', ratingValue: data.average, reviewCount: data.count, bestRating: 5, worstRating: 1 },
    })
    document.head.appendChild(el)
    return () => el.remove()
  }, [data, name, refId])

  // Opening the form takes keyboard users straight to its first field
  useEffect(() => {
    if (writing) document.getElementById(`${formId}-name`)?.focus()
  }, [writing, formId])

  if (offline || !data) return null

  const check = (): Errors => ({
    name: values.name.trim() ? undefined : c.needName,
    rating: values.rating >= 1 && values.rating <= 5 ? undefined : c.needRating,
    body: values.body.trim().length >= 10 ? undefined : c.needBody,
    consent: values.consent ? undefined : c.needConsent,
  })

  const send = () =>
    submit.run(check, () =>
      postPublic<{ status: string }>('reviews', {
        refId,
        name: values.name.trim(),
        rating: values.rating,
        title: values.title.trim() || null,
        body: values.body.trim(),
        lang,
        page: typeof location !== 'undefined' ? location.pathname : undefined,
        consent: values.consent,
        website: values.website,
      }),
    )

  const avg = data.average != null ? data.average.toLocaleString(lang === 'en' ? 'en-GB' : 'th-TH', { maximumFractionDigits: 1 }) : null

  return (
    <section className="reviews" aria-labelledby={`${formId}-title`}>
      <div className="reviews__head">
        <div>
          <h2 id={`${formId}-title`}>{c.title}</h2>
          <p>{c.lede}</p>
        </div>
        {data.count > 0 && avg && (
          <p className="reviews__avg">
            <span className="reviews__avg-figure">{avg}</span>
            <Stars value={data.average!} size={20} />
            <span className="reviews__avg-text">{c.average(avg, data.count)}</span>
          </p>
        )}
      </div>

      {data.count > 0 ? (
        <ul className="reviews__list">
          {data.rows.map((r) => (
            <li key={r.id} lang={r.lang === lang ? undefined : r.lang}>
              <div className="reviews__meta">
                <Stars value={r.rating} />
                <span className="visually-hidden">{c.starsOf(r.rating)}</span>
                <span className="reviews__name">{r.name}</span>
                <time dateTime={r.createdAt}>{date(r.createdAt, lang)}</time>
              </div>
              {r.title && <h3 className="reviews__title">{r.title}</h3>}
              <p className="reviews__body">{r.body}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="reviews__empty">{c.empty(name)}</p>
      )}

      {submit.state === 'done' ? (
        <div className="reviews__done" role="status">
          <CheckCircle2 size={22} aria-hidden />
          <div>
            <p className="reviews__done-title">{c.done}</p>
            <p>{c.pending}</p>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              reset()
              submit.reset()
              setWriting(true)
            }}
          >
            {c.another}
          </button>
        </div>
      ) : writing ? (
        <form
          id={formId}
          className="reviews__form"
          noValidate
          aria-labelledby={`${formId}-form-title`}
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
        >
          <h3 id={`${formId}-form-title`}>{c.formTitle(name)}</h3>
          <div className="form-grid">
            <TextField form={formId} name="name" label={c.name} hint={c.nameHint} required maxLength={60} autoComplete="nickname" error={submit.errors.name} {...bind('name')} />
            <TextField form={formId} name="title" label={c.reviewTitle} optional maxLength={120} error={submit.errors.title} {...bind('title')} />
          </div>

          <fieldset className={`reviews__rating${submit.errors.rating ? ' reviews__rating--error' : ''}`} aria-describedby={submit.errors.rating ? `${formId}-rating-error` : undefined}>
            <legend>
              {c.rating} <span className="field__req">({lang === 'en' ? 'required' : 'จำเป็น'})</span>
            </legend>
            <div className="reviews__star-picks">
              {[1, 2, 3, 4, 5].map((n) => (
                <label key={n} className={n <= values.rating ? 'is-on' : undefined}>
                  <input
                    type="radio"
                    name={`${formId}-rating`}
                    id={n === 1 ? `${formId}-rating` : undefined}
                    value={n}
                    checked={values.rating === n}
                    onChange={() => set('rating', n)}
                  />
                  <Star size={26} aria-hidden />
                  <span className="visually-hidden">{c.star(n)}</span>
                </label>
              ))}
            </div>
            {submit.errors.rating && (
              <p id={`${formId}-rating-error`} className="field__error">
                <AlertCircle size={16} aria-hidden />
                {submit.errors.rating}
              </p>
            )}
          </fieldset>

          <TextArea form={formId} name="body" label={c.body} hint={c.bodyHint} required rows={5} maxLength={2000} error={submit.errors.body} {...bind('body')} />

          <div className={`consent${submit.errors.consent ? ' consent--error' : ''}`}>
            <input
              id={`${formId}-consent`}
              type="checkbox"
              checked={values.consent}
              onChange={(e) => set('consent', e.target.checked)}
              aria-invalid={submit.errors.consent ? true : undefined}
              aria-describedby={submit.errors.consent ? `${formId}-consent-error` : undefined}
            />
            <label htmlFor={`${formId}-consent`}>
              {c.consent} <Link to="/privacy">{c.privacy}</Link>
              {lang === 'en' ? '.' : ''}
            </label>
            {submit.errors.consent && (
              <p id={`${formId}-consent-error`} className="field__error">
                <AlertCircle size={16} aria-hidden />
                {submit.errors.consent}
              </p>
            )}
          </div>
          <Honeypot value={values.website} onChange={(v) => set('website', v)} />
          <FormMessage message={submit.message} />

          <div className="btn-row">
            <button type="submit" className="btn btn-primary" disabled={submit.state === 'sending'}>
              {submit.state === 'sending' ? sendingLabel(lang) : c.submit}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setWriting(false)}>
              {c.cancel}
            </button>
          </div>
        </form>
      ) : (
        <button type="button" className="btn btn-ghost reviews__write" onClick={() => setWriting(true)}>
          <MessageSquarePlus size={18} aria-hidden />
          {c.write}
        </button>
      )}
    </section>
  )
}

import { useEffect, useId, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { CalendarCheck, CalendarPlus, Clock, X } from 'lucide-react'
import { breeds } from '../../data'
import { useLang } from '../../i18n'
import { Consent, ContactFields, contactErrors, FormMessage, Honeypot, SelectField, TextArea, useFormValues, useSubmit, sendingLabel } from '../../components/shop/form'
import { DoneCard } from '../../components/shop/DoneCard'
import { ShopHead } from '../../components/shop/ShopHead'
import { ContactButtons } from '../../components/shop/StoreDetails'
import { usePublic, type Kitten } from '../../lib/kittens'
import { useStoreInfo } from '../../lib/live'
import { postPublic } from '../../lib/publicApi'
import { addDays, bkkDay, bookingDays, formatDay, icsFor, weekdayName, weekdayOf } from '../../lib/shop'
import './shop-pages.css'

interface Slots {
  date: string
  open: boolean
  durationMin: number
  slots: { time: string; available: boolean }[]
}

interface Booked {
  no: string
  date: string
  time: string
  durationMin: number
}

const COPY = {
  th: {
    title: 'นัดชมลูกแมวที่ร้าน',
    tint: 'เลือกวันและเวลาที่สะดวก',
    lede: 'ครั้งละ 1 ชั่วโมง ได้เล่นกับน้อง เห็นพ่อแม่พันธุ์ และดูสมุดวัคซีนกับผลตรวจสุขภาพจริง ไม่มีค่าใช้จ่าย นัดล่วงหน้าได้ 21 วัน',
    step1: 'เลือกวัน',
    step2: 'เลือกเวลา',
    step3: 'รายละเอียดการนัด',
    closed: 'ร้านปิด',
    pickDay: 'เลือกวันก่อน แล้วเวลาที่ว่างจะแสดงตรงนี้',
    loading: 'กำลังดูเวลาที่ว่าง…',
    noSlots: 'วันนี้เต็มแล้ว ลองเลือกวันอื่น',
    full: 'เต็ม',
    minutes: (m: number) => `${m} นาที`,
    breed: 'สายพันธุ์ที่อยากดู',
    anyBreed: 'ดูหลายสายพันธุ์',
    kitten: 'ลูกแมวที่อยากดู',
    removeKitten: 'ไม่ระบุตัว',
    note: 'ฝากถึงร้าน',
    noteHint: 'เช่น มากัน 2 คน มีเด็กเล็กมาด้วย',
    needDay: 'เลือกวันที่จะมา',
    needTime: 'เลือกเวลาที่จะมา',
    book: 'ยืนยันการนัด',
    doneTitle: 'นัดเรียบร้อยแล้ว',
    doneRef: 'เลขที่นัด',
    doneWhen: (d: string, t: string) => `${d} เวลา ${t} น.`,
    doneBody: 'ร้านจะโทรหรือทัก LINE ยืนยันอีกครั้งก่อนวันนัด ถ้าต้องการเลื่อนหรือยกเลิก แจ้งร้านพร้อมเลขที่นัด',
    ics: 'บันทึกลงปฏิทิน (.ics)',
    another: 'นัดอีกครั้ง',
    seeKittens: 'ดูลูกแมวที่พร้อมรับ',
    bring: 'ก่อนมา: ล้างมือหรือใช้เจลที่ร้าน และงดพาสัตว์เลี้ยงตัวอื่นมาด้วย เพื่อสุขภาพของลูกแมว',
    icsTitle: 'นัดชมลูกแมว Maew Cat House',
    offline: 'ดูเวลาที่ว่างไม่ได้ในขณะนี้ โทรหรือทัก LINE เพื่อนัดได้เลย',
  },
  en: {
    title: 'Book a visit',
    tint: 'Pick a day and time that suits you',
    lede: 'One hour with the kittens: play with them, meet the parents, and see the real vaccine book and health checks. It’s free; book up to 21 days ahead.',
    step1: 'Choose a day',
    step2: 'Choose a time',
    step3: 'Your visit',
    closed: 'Closed',
    pickDay: 'Choose a day first; its free times appear here.',
    loading: 'Checking free times…',
    noSlots: 'This day is fully booked. Try another day.',
    full: 'Full',
    minutes: (m: number) => `${m} minutes`,
    breed: 'Breed you’d like to see',
    anyBreed: 'Several breeds',
    kitten: 'Kitten you’d like to meet',
    removeKitten: 'Any kitten',
    note: 'Note for the shop',
    noteHint: 'For example: two of us, with a small child',
    needDay: 'Choose the day you’ll come',
    needTime: 'Choose the time you’ll come',
    book: 'Confirm booking',
    doneTitle: 'Your visit is booked',
    doneRef: 'Booking number',
    doneWhen: (d: string, t: string) => `${d} at ${t}`,
    doneBody: 'The shop will call or message you on LINE to confirm before the day. To change or cancel, tell us your booking number.',
    ics: 'Add to calendar (.ics)',
    another: 'Book another visit',
    seeKittens: 'See available kittens',
    bring: 'Before you come: wash your hands or use the gel at the shop, and please don’t bring other pets, for the kittens’ health.',
    icsTitle: 'Kitten visit at Maew Cat House',
    offline: 'Free times can’t be shown right now. Call or message us on LINE to book.',
  },
}

/** Weeks (Monday first) covering the booking window, for a calendar grid. */
function weeksOf(days: { day: string; weekday: number; open: boolean }[]) {
  if (!days.length) return []
  const first = days[0].day
  const lead = (weekdayOf(first) + 6) % 7
  const start = addDays(first, -lead)
  const last = days[days.length - 1].day
  const byDay = new Map(days.map((d) => [d.day, d]))
  const weeks: ({ day: string; weekday: number; open: boolean } | null)[][] = []
  for (let d = start; d <= last; d = addDays(d, 7)) {
    weeks.push(Array.from({ length: 7 }, (_, i) => byDay.get(addDays(d, i)) ?? null))
  }
  return weeks
}

function downloadIcs(name: string, body: string) {
  const url = URL.createObjectURL(new Blob([body], { type: 'text/calendar;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function BookingPage() {
  const lang = useLang()
  const c = COPY[lang]
  const form = useId().replace(/:/g, '')
  const store = useStoreInfo()
  const [params, setParams] = useSearchParams()
  const kittenId = params.get('kitten')
  const kitten = usePublic<Kitten>(kittenId ? `kittens/${encodeURIComponent(kittenId)}` : null)
  const presetBreed = breeds.some((b) => b.id === params.get('breed')) ? params.get('breed')! : ''
  const days = useMemo(() => bookingDays(store.hours, Date.now(), 21), [store.hours])
  const weeks = useMemo(() => weeksOf(days), [days])
  const [day, setDay] = useState<string | null>(null)
  const [time, setTime] = useState<string | null>(null)
  const [slots, setSlots] = useState<{ state: 'idle' | 'loading' | 'ready' | 'error'; data?: Slots; error?: unknown }>({ state: 'idle' })
  const { values, set, bind, reset } = useFormValues({ name: '', phone: '', email: '', lineId: '', breed: presetBreed, note: '', consent: false, website: '' })
  const submit = useSubmit<Booked>(form)
  const chosenKitten = kittenId && kitten.status === 'ready' ? kitten.data : null

  useEffect(() => {
    if (!day) return
    let alive = true
    setSlots({ state: 'loading' })
    setTime(null)
    fetch(`/api/public/slots?date=${day}`, { headers: { Accept: 'application/json' } })
      .then(async (r) => {
        if (!r.ok || !(r.headers.get('content-type') ?? '').includes('json')) throw new Error('offline')
        return (await r.json()) as Slots
      })
      .then(
        (data) => alive && setSlots({ state: 'ready', data }),
        (error) => alive && setSlots({ state: 'error', error }),
      )
    return () => {
      alive = false
    }
  }, [day])

  // A kitten picked on its page sets the breed too
  useEffect(() => {
    if (chosenKitten) set('breed', chosenKitten.refId)
  }, [chosenKitten, set])

  const send = () =>
    submit.run(
      () => ({ ...contactErrors(values, lang), day: day ? undefined : c.needDay, time: day && !time ? c.needTime : undefined }),
      () =>
        postPublic<Booked>('bookings', {
          date: day,
          time,
          refId: values.breed || undefined,
          name: values.name.trim(),
          phone: values.phone.trim(),
          email: values.email.trim() || undefined,
          lineId: values.lineId.trim() || undefined,
          note: [chosenKitten ? `${lang === 'th' ? 'อยากดูน้อง' : 'To meet'} ${chosenKitten.name} (${chosenKitten.code})` : null, values.note.trim() || null]
            .filter(Boolean)
            .join(' | ') || undefined,
          page: '/booking',
          lang,
          consent: values.consent,
          website: values.website,
        }),
    )

  if (submit.state === 'done' && submit.result) {
    const b = submit.result
    const when = c.doneWhen(formatDay(b.date, lang, { weekday: true }), b.time)
    return (
      <>
        <ShopHead title={c.title} tint={c.tint} />
        <section className="shop-band">
          <div className="container narrow">
            <DoneCard title={c.doneTitle} refLabel={c.doneRef} refValue={b.no}>
              <p className="booking-when">
                <Clock size={18} aria-hidden /> {when}
              </p>
              <p>{c.doneBody}</p>
              <p>{c.bring}</p>
              <div className="btn-row">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() =>
                    downloadIcs(
                      `${b.no}.ics`,
                      icsFor({
                        uid: b.no,
                        day: b.date,
                        time: b.time,
                        durationMin: b.durationMin,
                        title: c.icsTitle,
                        location: `${store.storeName} ${store.branch} ${store.address}`,
                        description: `${c.doneRef} ${b.no}`,
                      }),
                    )
                  }
                >
                  <CalendarPlus size={18} aria-hidden />
                  {c.ics}
                </button>
                <Link to="/kittens" className="btn btn-ghost">
                  {c.seeKittens}
                </Link>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    reset()
                    submit.reset()
                    setDay(null)
                    setTime(null)
                  }}
                >
                  {c.another}
                </button>
              </div>
            </DoneCard>
          </div>
        </section>
      </>
    )
  }

  const today = bkkDay()
  return (
    <>
      <ShopHead title={c.title} tint={c.tint} lede={c.lede} aside={<ContactButtons />} />
      <section className="shop-band">
        <div className="container">
          <form
            className="booking"
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              send()
            }}
          >
            <div className="shop-cols">
              <fieldset className="shop-sheet booking-step" aria-describedby={submit.errors.day ? `${form}-day-error` : undefined}>
                <legend className="booking-step__title">
                  <span className="booking-step__num" aria-hidden="true">
                    1
                  </span>
                  {c.step1}
                </legend>
                <div className="cal" role="presentation">
                  <div className="cal__head" aria-hidden="true">
                    {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                      <span key={d}>{weekdayName(d, lang, true)}</span>
                    ))}
                  </div>
                  {weeks.map((w, i) => (
                    <div className="cal__week" key={i}>
                      {w.map((d, j) =>
                        d ? (
                          <label key={d.day} className="cal__day" data-closed={!d.open || undefined} data-today={d.day === today || undefined}>
                            <input
                              type="radio"
                              name="day"
                              id={i === 0 && j === w.findIndex(Boolean) ? `${form}-day` : undefined}
                              value={d.day}
                              checked={day === d.day}
                              disabled={!d.open}
                              onChange={() => setDay(d.day)}
                            />
                            <span className="cal__num">{Number(d.day.slice(8))}</span>
                            <span className="cal__month">{formatDay(d.day, lang, { short: true }).replace(/^\d+\s*/, '').replace(/\s*\d{4}$/, '')}</span>
                            <span className="visually-hidden">{formatDay(d.day, lang, { weekday: true })}</span>
                            {!d.open && <span className="cal__closed">{c.closed}</span>}
                          </label>
                        ) : (
                          <span key={j} className="cal__blank" />
                        ),
                      )}
                    </div>
                  ))}
                </div>
                {submit.errors.day && (
                  <p id={`${form}-day-error`} className="field__error">
                    {submit.errors.day}
                  </p>
                )}
              </fieldset>

              <fieldset className="shop-sheet booking-step" aria-describedby={submit.errors.time ? `${form}-time-error` : undefined}>
                <legend className="booking-step__title">
                  <span className="booking-step__num" aria-hidden="true">
                    2
                  </span>
                  {c.step2}
                </legend>
                {day && <p className="booking-step__day">{formatDay(day, lang, { weekday: true })}</p>}
                <div aria-live="polite">
                  {!day && <p className="booking-step__hint">{c.pickDay}</p>}
                  {day && slots.state === 'loading' && <p className="booking-step__hint">{c.loading}</p>}
                  {day && slots.state === 'error' && (
                    <div className="empty-card">
                      <p>{c.offline}</p>
                      <ContactButtons />
                    </div>
                  )}
                  {day && slots.state === 'ready' && slots.data && (
                    <>
                      {slots.data.slots.some((s) => s.available) ? (
                        <div className="slots">
                          {slots.data.slots.map((s, i) => (
                            <label key={s.time} className="slot" data-full={!s.available || undefined}>
                              <input
                                type="radio"
                                name="time"
                                id={i === slots.data!.slots.findIndex((x) => x.available) ? `${form}-time` : undefined}
                                value={s.time}
                                checked={time === s.time}
                                disabled={!s.available}
                                onChange={() => setTime(s.time)}
                              />
                              <span>{s.time}</span>
                              {!s.available && <span className="slot__full">{c.full}</span>}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <p className="booking-step__hint">{c.noSlots}</p>
                      )}
                      <p className="booking-step__hint">
                        <Clock size={14} aria-hidden /> {c.minutes(slots.data.durationMin)}
                      </p>
                    </>
                  )}
                </div>
                {submit.errors.time && (
                  <p id={`${form}-time-error`} className="field__error">
                    {submit.errors.time}
                  </p>
                )}
              </fieldset>
            </div>

            <fieldset className="shop-sheet booking-step booking-step--details">
              <legend className="booking-step__title">
                <span className="booking-step__num" aria-hidden="true">
                  3
                </span>
                {c.step3}
              </legend>
              <div className="form">
                {chosenKitten && (
                  <p className="booking-kitten">
                    <span>
                      {c.kitten}: <strong>{chosenKitten.name}</strong> ({chosenKitten.code})
                    </span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        params.delete('kitten')
                        setParams(params, { replace: true })
                      }}
                    >
                      <X size={16} aria-hidden />
                      {c.removeKitten}
                    </button>
                  </p>
                )}
                <div className="form-grid">
                  <SelectField form={form} name="breed" label={c.breed} optional {...bind('breed')}>
                    <option value="">{c.anyBreed}</option>
                    {breeds.map((b) => (
                      <option key={b.id} value={b.id}>
                        {lang === 'en' ? b.nameEn : b.nameTh}
                      </option>
                    ))}
                  </SelectField>
                  <TextArea form={form} name="note" label={c.note} optional hint={c.noteHint} rows={2} className="field--wide" error={submit.errors.note} {...bind('note')} />
                </div>
                <ContactFields form={form} bind={bind} errors={submit.errors} lang={lang} />
                <Consent form={form} checked={values.consent} onChange={(v) => set('consent', v)} error={submit.errors.consent} />
                <Honeypot value={values.website} onChange={(v) => set('website', v)} />
                <FormMessage message={submit.state === 'error' ? submit.message : null} />
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={submit.state === 'sending'}>
                    <CalendarCheck size={18} aria-hidden />
                    {submit.state === 'sending' ? sendingLabel(lang) : c.book}
                  </button>
                  {day && time && (
                    <p className="booking-summary">
                      {formatDay(day, lang, { weekday: true })} {lang === 'th' ? `เวลา ${time} น.` : `at ${time}`}
                    </p>
                  )}
                </div>
              </div>
            </fieldset>
          </form>
        </div>
      </section>
    </>
  )
}

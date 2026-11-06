import { useId } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { PawPrint, Store, Truck } from 'lucide-react'
import { getBreed } from '../../data'
import { useLang } from '../../i18n'
import { localized } from '../../i18n/content'
import { Consent, ContactFields, contactErrors, FormMessage, Honeypot, TextArea, useFormValues, useSubmit, sendingLabel } from '../../components/shop/form'
import { ShopHead } from '../../components/shop/ShopHead'
import { ContactButtons } from '../../components/shop/StoreDetails'
import { Picture } from '../../components/Picture'
import { kittenPhoto, kittenText, usePublic, type Kitten, type Reservation } from '../../lib/kittens'
import { ApiError, postPublic } from '../../lib/publicApi'
import { money, PAID_HOLD_HOURS, READY_WEEKS, UNPAID_HOLD_HOURS } from '../../lib/shop'
import './shop-pages.css'
import './cost.css'
import './privacy.css'
import './kitten-page.css'
import './reserve.css'

const COPY = {
  th: {
    title: 'จองลูกแมว',
    tint: (n: string) => `น้อง${n}`,
    lede: `กรอกข้อมูลติดต่อและเลือกวิธีรับน้อง จากนั้นชำระมัดจำภายใน ${UNPAID_HOLD_HOURS} ชั่วโมง เมื่อชำระแล้วร้านกันน้องไว้ให้ ${PAID_HOLD_HOURS} ชั่วโมงและโทรนัดวันรับ`,
    back: 'กลับไปหน้าน้อง',
    formTitle: 'ข้อมูลผู้จอง',
    pickup: 'รับน้องอย่างไร',
    store: 'รับที่ร้าน',
    delivery: 'ให้ร้านจัดส่ง',
    deliveryHint: 'ร้านแจ้งค่าส่งตามระยะทางให้ทราบก่อนยืนยัน',
    address: 'ที่อยู่จัดส่ง',
    needAddress: 'กรอกที่อยู่สำหรับจัดส่ง',
    note: 'ฝากถึงร้าน',
    submit: 'จองและไปชำระมัดจำ',
    summary: 'สรุปการจอง',
    price: 'ราคาน้อง',
    deposit: 'มัดจำ',
    rest: 'ชำระส่วนที่เหลือตอนรับน้อง',
    rules: [
      `ชำระมัดจำภายใน ${UNPAID_HOLD_HOURS} ชั่วโมง ไม่เช่นนั้นการจองจะหมดเวลา`,
      `ชำระแล้วร้านกันน้องไว้ ${PAID_HOLD_HOURS} ชั่วโมง ถ้าน้องยังไม่ครบ ${READY_WEEKS} สัปดาห์ ร้านขยายเวลาให้จนถึงวันรับ`,
      'ยกเลิกก่อนรับน้องได้ ร้านคืนมัดจำเต็มจำนวนภายใน 7 วัน',
    ],
    loading: 'กำลังโหลดข้อมูลน้อง',
    unavailableTitle: 'จองน้องตัวนี้ไม่ได้แล้ว',
    unavailableBody: 'น้องถูกจองหรือได้บ้านใหม่ไปแล้ว ดูน้องตัวอื่นที่พร้อมรับได้',
    offlineTitle: 'ยังจองออนไลน์ไม่ได้ในขณะนี้',
    offlineBody: 'ระบบของร้านไม่ตอบสนอง โทรหรือทัก LINE เพื่อจองได้เลย',
    seeAll: 'ดูลูกแมวทั้งหมด',
  },
  en: {
    title: 'Reserve a kitten',
    tint: (n: string) => n,
    lede: `Give your contact details and choose how you’ll collect, then pay the deposit within ${UNPAID_HOLD_HOURS} hours. Once it’s paid the shop holds the kitten for ${PAID_HOLD_HOURS} hours and calls you to set the collection day.`,
    back: 'Back to the kitten',
    formTitle: 'Your details',
    pickup: 'How you’ll collect',
    store: 'Collect at the shop',
    delivery: 'Ask for delivery',
    deliveryHint: 'The shop tells you the charge for your distance before you confirm.',
    address: 'Delivery address',
    needAddress: 'Enter the delivery address',
    note: 'Note for the shop',
    submit: 'Reserve and pay the deposit',
    summary: 'Your reservation',
    price: 'Price',
    deposit: 'Deposit',
    rest: 'Pay the rest when you collect',
    rules: [
      `Pay the deposit within ${UNPAID_HOLD_HOURS} hours, or the reservation lapses.`,
      `Once paid, the kitten is held for ${PAID_HOLD_HOURS} hours; if it isn’t ${READY_WEEKS} weeks old yet, the shop extends the hold until collection.`,
      'You can cancel before collecting; the deposit is refunded in full within 7 days.',
    ],
    loading: 'Loading the kitten',
    unavailableTitle: 'This kitten can’t be reserved',
    unavailableBody: 'It has been reserved or found a home. See the other kittens ready for a home.',
    offlineTitle: 'Online reservations aren’t available right now',
    offlineBody: 'The shop’s system isn’t responding. Call or message us on LINE to reserve.',
    seeAll: 'See all kittens',
  },
}

export function ReservePage() {
  const lang = useLang()
  const c = COPY[lang]
  const form = useId().replace(/:/g, '')
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const res = usePublic<Kitten>(`kittens/${encodeURIComponent(id)}`)
  const { values, set, bind } = useFormValues({ name: '', phone: '', email: '', lineId: '', pickup: 'store' as 'store' | 'delivery', address: '', note: '', consent: false, website: '' })
  const submit = useSubmit<Reservation>(form)

  if (res.status === 'loading') {
    return (
      <section className="shop-band kitten-page">
        <div className="container">
          <p role="status">{c.loading}</p>
        </div>
      </section>
    )
  }

  const unavailable = res.status === 'ready' && res.data.status !== 'available'
  if (res.status === 'error' || unavailable) {
    const gone = unavailable || (res.status === 'error' && res.error instanceof ApiError && res.error.status === 404)
    return (
      <>
        <ShopHead title={c.title} />
        <section className="shop-band">
          <div className="container narrow">
            <div className="empty-card">
              <p className="empty-card__title">{gone ? c.unavailableTitle : c.offlineTitle}</p>
              <p>{gone ? c.unavailableBody : c.offlineBody}</p>
              <Link to="/kittens" className="btn btn-primary btn-sm">
                {c.seeAll}
              </Link>
              {!gone && <ContactButtons />}
            </div>
          </div>
        </section>
      </>
    )
  }

  const k = res.data
  const text = kittenText(k, lang)
  const photo = kittenPhoto(k)
  const breed = getBreed(k.refId)
  const breedName = lang === 'en' && breed ? localized(breed, 'en').nameEn : text.breedName

  const send = () =>
    submit.run(
      () => ({ ...contactErrors(values, lang), address: values.pickup === 'delivery' && !values.address.trim() ? c.needAddress : undefined }),
      async () => {
        const r = await postPublic<Reservation>('reservations', {
          unitId: k.id,
          name: values.name.trim(),
          phone: values.phone.trim(),
          email: values.email.trim() || undefined,
          lineId: values.lineId.trim() || undefined,
          pickup: values.pickup,
          address: values.pickup === 'delivery' ? values.address.trim() : undefined,
          note: values.note.trim() || undefined,
          lang,
          consent: values.consent,
          website: values.website,
        })
        navigate(`/reservation/${encodeURIComponent(r.no)}?t=${encodeURIComponent(r.token ?? '')}`)
        return r
      },
    )

  return (
    <>
      <ShopHead title={c.title} tint={c.tint(k.name)} lede={c.lede} crumb={{ to: `/kittens/${k.id}`, label: c.back }} />
      <section className="shop-band">
        <div className="container reserve-layout">
          <div className="shop-sheet">
            <h2>{c.formTitle}</h2>
            <form
              className="form reserve-form"
              noValidate
              onSubmit={(e) => {
                e.preventDefault()
                send()
              }}
            >
              <ContactFields form={form} bind={bind} errors={submit.errors} lang={lang} />
              <fieldset className="choice-group">
                <legend className="field__label">{c.pickup}</legend>
                <div className="choice-row">
                  <label className="choice">
                    <input type="radio" name="pickup" checked={values.pickup === 'store'} onChange={() => set('pickup', 'store')} />
                    <Store size={18} aria-hidden />
                    <span>{c.store}</span>
                  </label>
                  <label className="choice">
                    <input type="radio" name="pickup" checked={values.pickup === 'delivery'} onChange={() => set('pickup', 'delivery')} />
                    <Truck size={18} aria-hidden />
                    <span>{c.delivery}</span>
                  </label>
                </div>
              </fieldset>
              {values.pickup === 'delivery' && (
                <TextArea form={form} name="address" label={c.address} required hint={c.deliveryHint} rows={3} autoComplete="street-address" error={submit.errors.address} {...bind('address')} />
              )}
              <TextArea form={form} name="note" label={c.note} optional rows={2} error={submit.errors.note} {...bind('note')} />
              <Consent form={form} checked={values.consent} onChange={(v) => set('consent', v)} error={submit.errors.consent} />
              <Honeypot value={values.website} onChange={(v) => set('website', v)} />
              <FormMessage message={submit.state === 'error' ? submit.message : null} />
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={submit.state === 'sending' || submit.state === 'done'}>
                  <PawPrint size={18} aria-hidden />
                  {submit.state === 'sending' ? sendingLabel(lang) : c.submit}
                </button>
              </div>
            </form>
          </div>

          <aside className="shop-sheet reserve-summary" aria-labelledby={`${form}-sum`}>
            <h2 id={`${form}-sum`}>{c.summary}</h2>
            <div className="reserve-kitten">
              {photo && <Picture src={photo.srcSmall} alt="" sizes="120px" className="reserve-kitten__photo" />}
              <div>
                <p className="reserve-kitten__name">
                  {lang === 'th' ? 'น้อง' : ''}
                  <span lang="th">{k.name}</span>
                </p>
                <p>
                  {breedName}
                  {text.grade ? `, ${text.grade}` : ''}
                </p>
                <p>
                  {text.color}, {lang === 'th' ? `${k.sex === 'male' ? 'ตัวผู้' : 'ตัวเมีย'} อายุ ${k.ageWeeks} สัปดาห์` : `${k.sex}, ${k.ageWeeks} weeks`}
                </p>
              </div>
            </div>
            <dl className="cost-totals">
              <div>
                <dt>{c.price}</dt>
                <dd>{money(k.price, lang)}</dd>
              </div>
              <div className="cost-totals__big">
                <dt>{c.deposit}</dt>
                <dd>{money(k.deposit, lang)}</dd>
              </div>
              <div>
                <dt>{c.rest}</dt>
                <dd>{money(k.price - k.deposit, lang)}</dd>
              </div>
            </dl>
            <ul className="privacy-list reserve-rules">
              {c.rules.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </>
  )
}

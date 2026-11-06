import { useId } from 'react'
import { Link, useSearchParams } from 'react-router'
import { CalendarDays, Send } from 'lucide-react'
import { breeds } from '../../data'
import { useLang } from '../../i18n'
import { Consent, ContactFields, contactErrors, FormMessage, Honeypot, SelectField, TextArea, useFormValues, useSubmit, sendingLabel } from '../../components/shop/form'
import { DoneCard } from '../../components/shop/DoneCard'
import { ShopHead } from '../../components/shop/ShopHead'
import { ContactButtons, StoreDetails, WeekHours } from '../../components/shop/StoreDetails'
import { postPublic } from '../../lib/publicApi'
import { useStoreInfo } from '../../lib/live'
import './shop-pages.css'

const COPY = {
  th: {
    title: 'ติดต่อเรา',
    tint: 'ถามได้ทุกเรื่องเกี่ยวกับน้องแมว',
    lede: 'สอบถามสายพันธุ์ ลูกแมวที่พร้อมรับ การดูแล หรือนัดเข้ามาชมที่ร้าน ร้านตอบกลับในเวลาเปิดทำการ ทางโทรศัพท์หรือ LINE ตามที่สะดวก',
    formTitle: 'ส่งคำถามถึงร้าน',
    formLede: 'กรอกช่องที่จำเป็นแล้วกดส่ง ร้านจะติดต่อกลับตามช่องทางที่ให้ไว้',
    topic: 'เรื่องที่ต้องการสอบถาม',
    topics: ['ลูกแมวที่พร้อมรับ', 'สายพันธุ์และนิสัย', 'การดูแลและสุขภาพ', 'การจองและการชำระเงิน', 'เรื่องอื่น'],
    breed: 'สายพันธุ์ที่สนใจ',
    anyBreed: 'ยังไม่แน่ใจ',
    message: 'ข้อความ',
    messageHint: 'เช่น อยากได้ลูกแมวตัวเมีย สีครีม อายุพร้อมรับเดือนหน้า',
    needMessage: 'พิมพ์ข้อความที่ต้องการสอบถาม',
    send: 'ส่งคำถาม',
    doneTitle: 'ส่งคำถามแล้ว',
    doneRef: 'เลขที่อ้างอิง',
    doneBody: (hours: string) => `ร้านจะติดต่อกลับภายในเวลาเปิดทำการ (${hours}) ถ้าเรื่องด่วน โทรหรือทัก LINE ได้เลย`,
    again: 'ส่งอีกเรื่อง',
    visitTitle: 'อยากเห็นน้องตัวจริง',
    visitBody: 'นัดเวลาเข้ามาชมลูกแมวที่ร้าน ครั้งละ 1 ชั่วโมง ไม่มีค่าใช้จ่าย',
    visit: 'นัดชมลูกแมว',
    hoursTitle: 'เวลาเปิดทำการ',
    storeTitle: 'ร้านอยู่ที่ไหน',
  },
  en: {
    title: 'Contact us',
    tint: 'Ask us anything about your cat-to-be',
    lede: 'Ask about breeds, kittens ready for a home, care, or come and visit the shop. We reply during opening hours, by phone or LINE, whichever suits you.',
    formTitle: 'Send the shop a question',
    formLede: 'Fill in the required fields and send. We’ll reply the way you choose.',
    topic: 'What it’s about',
    topics: ['Kittens available now', 'Breeds and temperament', 'Care and health', 'Reserving and paying', 'Something else'],
    breed: 'Breed you’re interested in',
    anyBreed: 'Not sure yet',
    message: 'Message',
    messageHint: 'For example: a female kitten, cream coat, ready to go home next month',
    needMessage: 'Type your question',
    send: 'Send question',
    doneTitle: 'Question sent',
    doneRef: 'Reference',
    doneBody: (hours: string) => `We’ll get back to you during opening hours (${hours}). If it’s urgent, call or message us on LINE.`,
    again: 'Ask something else',
    visitTitle: 'Want to meet them in person?',
    visitBody: 'Book a one-hour visit to meet the kittens at the shop. It’s free.',
    visit: 'Book a visit',
    hoursTitle: 'Opening hours',
    storeTitle: 'Where to find us',
  },
}

export function ContactPage() {
  const lang = useLang()
  const c = COPY[lang]
  const form = useId().replace(/:/g, '')
  const [params] = useSearchParams()
  const store = useStoreInfo()
  const preset = breeds.some((b) => b.id === params.get('breed')) ? params.get('breed')! : ''
  const { values, set, bind, reset } = useFormValues({
    name: '',
    phone: '',
    email: '',
    lineId: '',
    topic: c.topics[0],
    breed: preset,
    message: '',
    consent: false,
    website: '',
  })
  const submit = useSubmit<{ no: string }>(form)
  const hours = store.hours.length ? `${store.hours[0].open}–${store.hours[0].close}` : ''

  const send = () =>
    submit.run(
      () => ({ ...contactErrors(values, lang), message: values.message.trim() ? undefined : c.needMessage }),
      () =>
        postPublic<{ no: string }>('leads', {
          kind: 'inquiry',
          name: values.name.trim(),
          phone: values.phone.trim(),
          email: values.email.trim() || undefined,
          lineId: values.lineId.trim() || undefined,
          message: `[${values.topic}] ${values.message.trim()}`,
          refIds: values.breed ? [values.breed] : [],
          page: '/contact',
          lang,
          consent: values.consent,
          website: values.website,
        }),
    )

  return (
    <>
      <ShopHead title={c.title} tint={c.tint} lede={c.lede} aside={<ContactButtons />} />
      <section className="shop-band">
        <div className="container shop-cols">
          <div className="shop-sheet" id="contact-form">
            {submit.state === 'done' && submit.result ? (
              <DoneCard title={c.doneTitle} refLabel={c.doneRef} refValue={submit.result.no}>
                <p>{c.doneBody(hours)}</p>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    reset()
                    submit.reset()
                  }}
                >
                  {c.again}
                </button>
              </DoneCard>
            ) : (
              <>
                <h2>{c.formTitle}</h2>
                <p className="shop-sheet__lede">{c.formLede}</p>
                <form
                  className="form"
                  noValidate
                  onSubmit={(e) => {
                    e.preventDefault()
                    send()
                  }}
                >
                  <ContactFields form={form} bind={bind} errors={submit.errors} lang={lang} />
                  <div className="form-grid">
                    <SelectField form={form} name="topic" label={c.topic} {...bind('topic')}>
                      {c.topics.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </SelectField>
                    <SelectField form={form} name="breed" label={c.breed} optional {...bind('breed')}>
                      <option value="">{c.anyBreed}</option>
                      {breeds.map((b) => (
                        <option key={b.id} value={b.id}>
                          {lang === 'en' ? b.nameEn : b.nameTh}
                        </option>
                      ))}
                    </SelectField>
                    <TextArea
                      form={form}
                      name="message"
                      label={c.message}
                      required
                      hint={c.messageHint}
                      className="field--wide"
                      error={submit.errors.message}
                      {...bind('message')}
                    />
                  </div>
                  <Consent form={form} checked={values.consent} onChange={(v) => set('consent', v)} error={submit.errors.consent} />
                  <Honeypot value={values.website} onChange={(v) => set('website', v)} />
                  <FormMessage message={submit.state === 'error' ? submit.message : null} />
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={submit.state === 'sending'}>
                      <Send size={18} aria-hidden />
                      {submit.state === 'sending' ? sendingLabel(lang) : c.send}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>

          <div className="shop-stack">
            <div className="shop-sheet">
              <h2>{c.storeTitle}</h2>
              <StoreDetails showHours={false} />
            </div>
            <div className="shop-sheet">
              <h2>{c.hoursTitle}</h2>
              <WeekHours />
            </div>
            <div className="shop-sheet shop-sheet--mint">
              <h2>{c.visitTitle}</h2>
              <p>{c.visitBody}</p>
              <Link to={preset ? `/booking?breed=${preset}` : '/booking'} className="btn btn-primary">
                <CalendarDays size={18} aria-hidden />
                {c.visit}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

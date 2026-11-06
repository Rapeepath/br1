import { useId } from 'react'
import { ShieldCheck } from 'lucide-react'
import { useLang } from '../../i18n'
import { Consent, ContactFields, contactErrors, FormMessage, Honeypot, TextArea, useFormValues, useSubmit, sendingLabel } from '../../components/shop/form'
import { DoneCard } from '../../components/shop/DoneCard'
import { ShopHead } from '../../components/shop/ShopHead'
import { useStoreInfo } from '../../lib/live'
import { postPublic } from '../../lib/publicApi'
import { formatDay, telHref } from '../../lib/shop'
import './shop-pages.css'
import './privacy.css'

const UPDATED = '2026-11-06'

type Request = 'access' | 'correct' | 'delete'

const COPY = {
  th: {
    title: 'นโยบายความเป็นส่วนตัว',
    tint: 'ข้อมูลที่ร้านเก็บ และสิทธิ์ของคุณ',
    lede: 'ร้านเก็บข้อมูลเท่าที่จำเป็นเพื่อตอบคำถาม จัดการนัดหมาย และส่งมอบลูกแมว ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)',
    updated: (d: string) => `ปรับปรุงล่าสุด ${d}`,
    simulated: 'ร้านและระบบบนเว็บนี้เป็นระบบจำลองเพื่อการสาธิต ข้อมูลที่กรอกถูกเก็บในฐานข้อมูลจำลองของร้านเท่านั้น',
    controllerTitle: 'ผู้ควบคุมข้อมูลส่วนบุคคล',
    taxId: 'เลขประจำตัวผู้เสียภาษี',
    dataTitle: 'ข้อมูลที่เก็บและนำไปใช้',
    cols: ['เมื่อคุณ', 'ข้อมูลที่เก็บ', 'นำไปใช้เพื่อ', 'ฐานทางกฎหมาย', 'เก็บไว้นาน'],
    rows: [
      ['ส่งคำถามถึงร้าน', 'ชื่อ เบอร์โทร อีเมล LINE ID ข้อความ สายพันธุ์ที่สนใจ', 'ติดต่อกลับและตอบคำถาม', 'ความยินยอม', '1 ปีหลังการติดต่อครั้งล่าสุด'],
      ['นัดชมที่ร้าน', 'ข้อมูลติดต่อ วันเวลานัด หมายเหตุ', 'ยืนยันและจัดการนัด', 'ความยินยอม และขั้นตอนก่อนทำสัญญา', '1 ปีหลังวันนัด'],
      ['จองลูกแมว', 'ข้อมูลติดต่อ ที่อยู่จัดส่ง (ถ้ามี) ข้อมูลการชำระมัดจำ', 'กันน้องไว้ให้ ส่งมอบ และออกใบเสร็จ', 'การปฏิบัติตามสัญญา และหน้าที่ตามกฎหมายบัญชีและภาษี', 'ตามระยะเวลาที่กฎหมายบัญชีและภาษีกำหนด'],
      ['เขียนรีวิว', 'ชื่อที่ให้แสดง คะแนน และข้อความรีวิว', 'แสดงบนเว็บหลังร้านตรวจสอบ', 'ความยินยอม', 'จนกว่าคุณขอลบ'],
      ['ส่งคำขอเรื่องข้อมูล', 'ข้อมูลติดต่อ และรายละเอียดคำขอ', 'ดำเนินการตามคำขอ', 'หน้าที่ตามกฎหมาย', '3 ปีหลังดำเนินการเสร็จ'],
    ],
    notTitle: 'สิ่งที่ร้านไม่ทำ',
    nots: [
      'ไม่ขายหรือส่งต่อข้อมูลของคุณให้ผู้อื่นเพื่อการตลาด',
      'ไม่ใช้คุกกี้ติดตามหรือเครื่องมือวิเคราะห์พฤติกรรมการใช้งาน',
      'สิ่งที่เว็บจำไว้ในเบราว์เซอร์ (ธีม รายการเปรียบเทียบ และเช็กลิสต์) อยู่ในเครื่องของคุณเท่านั้น และลบได้จากการตั้งค่าเบราว์เซอร์',
    ],
    safeTitle: 'การดูแลข้อมูล',
    safe: [
      'เฉพาะพนักงานของร้านที่เข้าสู่ระบบด้วยรหัสของตัวเองเท่านั้นที่ดูข้อมูลได้ และทุกการแก้ไขถูกบันทึกไว้',
      'เมื่อคุณขอลบ ร้านลบข้อมูลติดต่อออกจากรายการ และเก็บไว้เฉพาะส่วนที่กฎหมายบังคับให้เก็บ',
    ],
    rightsTitle: 'สิทธิ์ของคุณ',
    rights: [
      'ขอดูและขอรับสำเนาข้อมูลของคุณ',
      'ขอแก้ไขข้อมูลที่ไม่ถูกต้องหรือไม่เป็นปัจจุบัน',
      'ขอลบ หรือทำให้ข้อมูลไม่สามารถระบุตัวคุณได้',
      'คัดค้านหรือขอให้ระงับการใช้ข้อมูล',
      'ถอนความยินยอมเมื่อใดก็ได้ โดยไม่กระทบสิ่งที่ทำไปก่อนถอน',
      'ร้องเรียนต่อสำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล (สคส.)',
    ],
    formTitle: 'ส่งคำขอเรื่องข้อมูลส่วนบุคคล',
    formLede: 'ร้านตอบกลับภายใน 30 วัน และอาจขอยืนยันตัวตนก่อนดำเนินการ',
    request: 'ต้องการ',
    requests: { access: 'ขอดูหรือขอสำเนาข้อมูล', correct: 'ขอแก้ไขข้อมูล', delete: 'ขอลบข้อมูล' } as Record<Request, string>,
    details: 'รายละเอียด',
    detailsHint: 'เช่น เบอร์ที่เคยใช้ติดต่อร้าน หรือข้อมูลที่ต้องการแก้',
    send: 'ส่งคำขอ',
    doneTitle: 'ได้รับคำขอแล้ว',
    doneRef: 'เลขที่คำขอ',
    doneBody: 'ร้านจะติดต่อกลับภายใน 30 วันตามช่องทางที่ให้ไว้',
  },
  en: {
    title: 'Privacy policy',
    tint: 'What the shop keeps, and your rights',
    lede: 'The shop keeps only what it needs to answer you, manage visits and hand over kittens, under Thailand’s Personal Data Protection Act B.E. 2562 (2019).',
    updated: (d: string) => `Last updated ${d}`,
    simulated: 'The shop and its system on this site are a simulation for demonstration. Anything you enter is kept only in the shop’s demonstration database.',
    controllerTitle: 'Data controller',
    taxId: 'Tax ID',
    dataTitle: 'What we keep and why',
    cols: ['When you', 'What we keep', 'Used to', 'Legal basis', 'Kept for'],
    rows: [
      ['Ask the shop a question', 'Name, phone, email, LINE ID, message, breed of interest', 'Reply to you', 'Consent', '1 year after your last contact'],
      ['Book a visit', 'Contact details, visit day and time, note', 'Confirm and manage the visit', 'Consent; steps before a contract', '1 year after the visit'],
      ['Reserve a kitten', 'Contact details, delivery address (if any), deposit payment', 'Hold the kitten, hand it over and issue receipts', 'Contract; accounting and tax law', 'As long as accounting and tax law require'],
      ['Write a review', 'Display name, rating and review text', 'Show it on the site after the shop checks it', 'Consent', 'Until you ask us to remove it'],
      ['Send a data request', 'Contact details and your request', 'Carry out the request', 'Legal obligation', '3 years after it is completed'],
    ],
    notTitle: 'What we don’t do',
    nots: [
      'We don’t sell your details or pass them to anyone for marketing.',
      'We don’t use tracking cookies or behaviour analytics.',
      'What the site remembers in your browser (theme, comparison list, checklist) stays on your device; clear it in your browser settings.',
    ],
    safeTitle: 'How your data is looked after',
    safe: [
      'Only shop staff signed in with their own code can see it, and every change is logged.',
      'When you ask us to delete your details, we remove your contact details from our lists and keep only what the law requires.',
    ],
    rightsTitle: 'Your rights',
    rights: [
      'See your data and get a copy',
      'Have wrong or out-of-date details corrected',
      'Have your data deleted or made anonymous',
      'Object to, or restrict, how it is used',
      'Withdraw consent at any time (without affecting what was done before)',
      'Complain to the Personal Data Protection Committee office (PDPC)',
    ],
    formTitle: 'Send a personal-data request',
    formLede: 'We reply within 30 days and may ask you to confirm who you are first.',
    request: 'I would like to',
    requests: { access: 'See or get a copy of my data', correct: 'Correct my data', delete: 'Delete my data' } as Record<Request, string>,
    details: 'Details',
    detailsHint: 'For example the phone number you used with the shop, or what needs correcting',
    send: 'Send request',
    doneTitle: 'Request received',
    doneRef: 'Request number',
    doneBody: 'We’ll contact you within 30 days the way you gave us.',
  },
}

export function PrivacyPage() {
  const lang = useLang()
  const c = COPY[lang]
  const form = useId().replace(/:/g, '')
  const store = useStoreInfo()
  const { values, set, bind, reset } = useFormValues({ name: '', phone: '', email: '', lineId: '', request: 'access' as Request, details: '', consent: false, website: '' })
  const submit = useSubmit<{ no: string }>(form)

  const send = () =>
    submit.run(
      () => contactErrors(values, lang),
      () =>
        postPublic<{ no: string }>('privacy', {
          request: values.request,
          name: values.name.trim(),
          phone: values.phone.trim(),
          email: values.email.trim() || undefined,
          lineId: values.lineId.trim() || undefined,
          details: values.details.trim() || undefined,
          lang,
          consent: values.consent,
          website: values.website,
        }),
    )

  return (
    <>
      <ShopHead title={c.title} tint={c.tint} lede={c.lede} aside={<p className="privacy-updated">{c.updated(formatDay(UPDATED, lang))}</p>} />
      <section className="shop-band">
        <div className="container privacy">
          <p className="privacy-note">
            <ShieldCheck size={20} aria-hidden />
            {c.simulated}
          </p>

          <div className="shop-sheet">
            <h2>{c.controllerTitle}</h2>
            <dl className="shop-facts">
              <div>
                <dt>{store.storeName}</dt>
                <dd>
                  {store.branch} {store.address}
                </dd>
              </div>
              <div>
                <dt>{lang === 'th' ? 'ติดต่อ' : 'Contact'}</dt>
                <dd className="privacy-contact">
                  <a href={telHref(store.phone)}>{store.phone}</a>
                  {store.email && <a href={`mailto:${store.email}`}>{store.email}</a>}
                </dd>
              </div>
              <div>
                <dt>{c.taxId}</dt>
                <dd>{store.taxId}</dd>
              </div>
            </dl>
          </div>

          <div className="shop-sheet">
            <h2>{c.dataTitle}</h2>
            <div className="privacy-table">
              <table>
                <thead>
                  <tr>
                    {c.cols.map((h) => (
                      <th key={h} scope="col">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {c.rows.map((r) => (
                    <tr key={r[0]}>
                      <th scope="row" data-label={c.cols[0]}>
                        {r[0]}
                      </th>
                      {r.slice(1).map((cell, i) => (
                        <td key={i} data-label={c.cols[i + 1]}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="privacy-cols">
            <div className="shop-sheet">
              <h2>{c.notTitle}</h2>
              <ul className="privacy-list">
                {c.nots.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div className="shop-sheet">
              <h2>{c.safeTitle}</h2>
              <ul className="privacy-list">
                {c.safe.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="shop-sheet">
            <h2>{c.rightsTitle}</h2>
            <ul className="privacy-list privacy-list--two">
              {c.rights.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>

          <div className="shop-sheet" id="request">
            {submit.state === 'done' && submit.result ? (
              <DoneCard title={c.doneTitle} refLabel={c.doneRef} refValue={submit.result.no}>
                <p>{c.doneBody}</p>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    reset()
                    submit.reset()
                  }}
                >
                  {c.send}
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
                  <fieldset className="choice-group">
                    <legend className="field__label">{c.request}</legend>
                    <div className="choice-row">
                      {(Object.keys(c.requests) as Request[]).map((r) => (
                        <label key={r} className="choice">
                          <input type="radio" name="request" value={r} checked={values.request === r} onChange={() => set('request', r)} />
                          <span>{c.requests[r]}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <ContactFields form={form} bind={bind} errors={submit.errors} lang={lang} />
                  <TextArea form={form} name="details" label={c.details} optional hint={c.detailsHint} error={submit.errors.details} {...bind('details')} />
                  <Consent form={form} checked={values.consent} onChange={(v) => set('consent', v)} error={submit.errors.consent} />
                  <Honeypot value={values.website} onChange={(v) => set('website', v)} />
                  <FormMessage message={submit.state === 'error' ? submit.message : null} />
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={submit.state === 'sending'}>
                      {submit.state === 'sending' ? sendingLabel(lang) : c.send}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

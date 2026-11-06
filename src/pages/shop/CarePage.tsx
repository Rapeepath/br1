import { Link } from 'react-router'
import { BadgeCheck, CalendarDays, Dna, FileText, HeartPulse, ShieldCheck, Stethoscope, Syringe } from 'lucide-react'
import { breeds, market } from '../../data'
import { useLang } from '../../i18n'
import { localized, localizedMarket } from '../../i18n/content'
import { ShopHead } from '../../components/shop/ShopHead'
import { ContactButtons } from '../../components/shop/StoreDetails'
import { READY_WEEKS } from '../../lib/shop'
import './shop-pages.css'
import './faq.css'
import './privacy.css'
import './care.css'

const COPY = {
  th: {
    title: 'การดูแลหลังรับเลี้ยง',
    tint: 'และการรับประกันสุขภาพ',
    lede: 'สิ่งที่น้องทุกตัวได้รับก่อนกลับบ้าน การดูแลช่วงแรก ตารางวัคซีน และเงื่อนไขการรับประกันสุขภาพของร้าน',
    policyNote: 'นโยบายในหน้านี้เป็นของร้านจำลองบนเว็บสาธิต ไม่ใช่ข้อเสนอจริง',
    getsTitle: 'น้องทุกตัวได้รับก่อนกลับบ้าน',
    gets: [
      { icon: 'vet', title: 'ตรวจสุขภาพโดยสัตวแพทย์', body: 'ตรวจร่างกายภายใน 10 วันก่อนส่งมอบ พร้อมใบรายงานผลตรวจ' },
      { icon: 'vaccine', title: 'วัคซีนตามอายุ', body: 'วัคซีนรวมเข็มแรกที่ 8 สัปดาห์ และเข็มถัดไปตามตาราง บันทึกในสมุดวัคซีน' },
      { icon: 'chip', title: 'ไมโครชิป', body: 'ฝังไมโครชิปและช่วยลงทะเบียนชื่อเจ้าของใหม่' },
      { icon: 'dna', title: 'ผลตรวจทางพันธุกรรม', body: 'ผลตรวจ DNA ตามโรคที่สายพันธุ์นั้นมีการตรวจ ดูได้ในหน้าข้อมูลของน้องแต่ละตัว' },
      { icon: 'paper', title: 'เอกสารครบ', body: 'สมุดวัคซีน ใบรายงานสุขภาพ และใบเพ็ดดีกรีสำหรับเกรดประกวด' },
      { icon: 'line', title: 'ปรึกษาสัตวแพทย์ฟรี 30 วัน', body: 'โทรหรือทัก LINE ถามเรื่องอาหาร การขับถ่าย หรืออาการผิดปกติได้ตลอด 30 วันแรก' },
    ],
    guaranteeTitle: 'การรับประกันสุขภาพ',
    guarantee: [
      {
        title: 'โรคติดเชื้อ 7 วัน',
        body: 'ถ้าสัตวแพทย์ตรวจพบไข้หัดแมวหรือหวัดแมวภายใน 7 วันหลังรับน้อง ร้านรับผิดชอบค่ารักษาตามใบรับรองแพทย์ หรือเปลี่ยนเป็นน้องตัวใหม่ตามที่ตกลงกัน',
      },
      {
        title: 'โรคทางพันธุกรรม 1 ปี',
        body: 'ถ้าพบโรคทางพันธุกรรมที่น้องตรวจ DNA แล้วผลเป็นลบภายในปีแรก ร้านคืนเงินค่าตัวน้องหรือรับผิดชอบค่ารักษาตามใบรับรองแพทย์',
      },
    ],
    conditionsTitle: 'เงื่อนไข',
    conditions: [
      'พาน้องตรวจสุขภาพกับสัตวแพทย์ภายใน 7 วันหลังรับกลับบ้าน',
      'ฉีดวัคซีนเข็มที่เหลือตามตาราง',
      'ไม่ครอบคลุมอุบัติเหตุ และอาการที่เกิดจากการเลี้ยงดูหรืออาหาร',
      'แจ้งร้านพร้อมเลขที่ใบเสร็จและใบรับรองแพทย์',
    ],
    firstTitle: 'เดือนแรกที่บ้าน',
    first: [
      { when: 'วันแรก', what: 'ให้น้องอยู่ห้องเงียบที่มีกระบะทราย น้ำ และที่ซ่อน ปล่อยให้สำรวจเองก่อน' },
      { when: 'สัปดาห์แรก', what: 'ให้อาหารเดิมจากร้าน ถ้าจะเปลี่ยนให้ค่อยๆ ผสมทีละน้อยใน 7–10 วัน และพาตรวจสุขภาพ' },
      { when: 'สัปดาห์ที่ 2–4', what: 'เริ่มฝึกให้ชินกับการแปรงขน ตัดเล็บ และกระเป๋าใส่แมว ขยายพื้นที่ในบ้านทีละส่วน' },
      { when: 'ตามตาราง', what: 'ฉีดวัคซีนเข็มถัดไปและถ่ายพยาธิตามที่สัตวแพทย์นัด' },
    ],
    readyNote: `ร้านให้ลูกแมวกลับบ้านเมื่ออายุครบ ${READY_WEEKS} สัปดาห์ขึ้นไป`,
    vaccineTitle: 'ตารางวัคซีนลูกแมว',
    vaccineLede: 'เข็มที่น้องได้แล้วดูได้ในหน้าข้อมูลของน้องแต่ละตัว เข็มที่เหลือให้สัตวแพทย์ใกล้บ้านฉีดตามตารางนี้',
    cols: ['อายุ', 'วัคซีน', 'หมายเหตุ'],
    screenTitle: 'ร้านตรวจอะไรในแต่ละสายพันธุ์',
    screenLede: 'โรคที่สายพันธุ์นั้นมีวิธีตรวจหรือคัดกรอง จากข้อมูลสุขภาพในหน้าสายพันธุ์ ร้านตรวจในพ่อแม่พันธุ์และในลูกแมวเมื่อมีการตรวจ DNA',
    noScreen: 'ยังไม่มีการตรวจเฉพาะสายพันธุ์ ใช้การตรวจสุขภาพทั่วไปโดยสัตวแพทย์',
    breedPage: 'อ่านเรื่องสุขภาพของสายพันธุ์นี้',
    askTitle: 'มีคำถามเรื่องการดูแล',
    askBody: 'โทรหรือทัก LINE หาร้านได้ในเวลาเปิดทำการ',
    faq: 'คำถามที่พบบ่อย',
    booking: 'นัดชมลูกแมว',
  },
  en: {
    title: 'Aftercare',
    tint: 'and the health guarantee',
    lede: 'What every kitten has before it goes home, the first weeks, the vaccine schedule, and the shop’s health guarantee terms.',
    policyNote: 'The policies on this page belong to a simulated shop on a demonstration site; they are not a real offer.',
    getsTitle: 'Every kitten comes with',
    gets: [
      { icon: 'vet', title: 'A vet check', body: 'Examined by a vet within 10 days before handover, with a written report.' },
      { icon: 'vaccine', title: 'Vaccines for its age', body: 'First core vaccine at 8 weeks and the next doses on schedule, recorded in its vaccine book.' },
      { icon: 'chip', title: 'A microchip', body: 'Microchipped, and we help you register as the new owner.' },
      { icon: 'dna', title: 'DNA results', body: 'Results for the inherited diseases its breed can be tested for, shown on each kitten’s page.' },
      { icon: 'paper', title: 'Its paperwork', body: 'Vaccine book, health report, and a pedigree for show-quality kittens.' },
      { icon: 'line', title: '30 days of free vet advice', body: 'Call or message us on LINE about food, litter habits or anything unusual for the first 30 days.' },
    ],
    guaranteeTitle: 'Health guarantee',
    guarantee: [
      {
        title: 'Infectious disease: 7 days',
        body: 'If a vet finds panleukopenia or cat flu within 7 days of collection, the shop pays for treatment against the vet’s certificate, or replaces the kitten as agreed.',
      },
      {
        title: 'Inherited disease: 1 year',
        body: 'If the kitten develops an inherited disease it tested negative for within its first year, the shop refunds the price or pays for treatment against the vet’s certificate.',
      },
    ],
    conditionsTitle: 'Conditions',
    conditions: [
      'Take the kitten to a vet for a check within 7 days of collecting it.',
      'Keep to the vaccine schedule for the remaining doses.',
      'Accidents, and problems caused by care or diet, are not covered.',
      'Tell the shop with your receipt number and the vet’s certificate.',
    ],
    firstTitle: 'The first month at home',
    first: [
      { when: 'Day one', what: 'Keep the kitten in a quiet room with a litter tray, water and a place to hide; let it explore on its own terms.' },
      { when: 'First week', what: 'Feed the same food the shop used; change gradually over 7–10 days if you want to, and book the vet check.' },
      { when: 'Weeks 2–4', what: 'Get it used to brushing, nail trims and the carrier; open up the rest of the home a room at a time.' },
      { when: 'On schedule', what: 'Next vaccines and deworming as your vet advises.' },
    ],
    readyNote: `Kittens go home at ${READY_WEEKS} weeks or older.`,
    vaccineTitle: 'Kitten vaccine schedule',
    vaccineLede: 'Each kitten’s page shows the doses it has had; your local vet gives the rest following this schedule.',
    cols: ['Age', 'Vaccine', 'Note'],
    screenTitle: 'What the shop screens for, breed by breed',
    screenLede: 'Conditions each breed can be tested or screened for, from the breed pages’ health data. The shop tests the parents, and the kittens where a DNA test exists.',
    noScreen: 'No breed-specific test; a general vet examination is used.',
    breedPage: 'Read about this breed’s health',
    askTitle: 'Questions about care?',
    askBody: 'Call or message us on LINE during opening hours.',
    faq: 'FAQ',
    booking: 'Book a visit',
  },
}

const ICONS = { vet: Stethoscope, vaccine: Syringe, chip: BadgeCheck, dna: Dna, paper: FileText, line: HeartPulse }

export function CarePage() {
  const lang = useLang()
  const c = COPY[lang]
  const m = localizedMarket(market, lang)
  return (
    <>
      <ShopHead title={c.title} tint={c.tint} lede={c.lede} />
      <section className="shop-band">
        <div className="container">
          <p className="privacy-note care-note">
            <ShieldCheck size={20} aria-hidden />
            {c.policyNote}
          </p>

          <section className="shop-section" aria-labelledby="care-gets">
            <h2 id="care-gets">{c.getsTitle}</h2>
            <ul className="care-gets">
              {c.gets.map((g) => {
                const Icon = ICONS[g.icon as keyof typeof ICONS]
                return (
                  <li key={g.title} className="shop-sheet">
                    <span className="bubble tone-peach">
                      <Icon size={22} aria-hidden />
                    </span>
                    <h3>{g.title}</h3>
                    <p>{g.body}</p>
                  </li>
                )
              })}
            </ul>
          </section>

          <section className="shop-section" aria-labelledby="care-guarantee">
            <h2 id="care-guarantee">{c.guaranteeTitle}</h2>
            <div className="care-guarantee">
              {c.guarantee.map((g) => (
                <div key={g.title} className="shop-sheet shop-sheet--mint">
                  <h3>{g.title}</h3>
                  <p>{g.body}</p>
                </div>
              ))}
              <div className="shop-sheet">
                <h3>{c.conditionsTitle}</h3>
                <ul className="privacy-list">
                  {c.conditions.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="shop-section" aria-labelledby="care-first">
            <h2 id="care-first">{c.firstTitle}</h2>
            <p className="shop-section__lede">{c.readyNote}</p>
            <ol className="care-first">
              {c.first.map((s) => (
                <li key={s.when} className="shop-sheet">
                  <p className="care-first__when">{s.when}</p>
                  <p>{s.what}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="shop-section" aria-labelledby="care-vaccines">
            <h2 id="care-vaccines">{c.vaccineTitle}</h2>
            <p className="shop-section__lede">{c.vaccineLede}</p>
            <div className="shop-sheet">
              <table className="care-table">
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
                  {m.vaccineSchedule.map((v) => (
                    <tr key={v.age}>
                      <th scope="row" data-label={c.cols[0]}>
                        <Syringe size={16} aria-hidden /> {v.age}
                      </th>
                      <td data-label={c.cols[1]}>{v.vaccines}</td>
                      <td data-label={c.cols[2]}>{v.note ?? '–'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="shop-section" aria-labelledby="care-screen">
            <h2 id="care-screen">{c.screenTitle}</h2>
            <p className="shop-section__lede">{c.screenLede}</p>
            <div className="care-screen">
              {breeds.map((b) => {
                const lb = localized(b, lang)
                const items = lb.health.filter((h) => h.screening)
                return (
                  <details key={b.id} className="faq-item care-breed">
                    <summary>
                      <span>
                        {lang === 'en' ? lb.nameEn : b.nameTh}
                        <span className="care-breed__count">
                          {lang === 'en' ? ` ${items.length} ${items.length === 1 ? 'check' : 'checks'}` : ` ${items.length} รายการ`}
                        </span>
                      </span>
                    </summary>
                    <div className="faq-item__body">
                      {items.length ? (
                        <ul className="care-breed__list">
                          {items.map((h) => (
                            <li key={h.name}>
                              <strong>{h.name}</strong>
                              <span>{h.screening}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>{c.noScreen}</p>
                      )}
                      <Link to={`/breeds/${b.id}`} className="link-arrow">
                        {c.breedPage}
                      </Link>
                    </div>
                  </details>
                )
              })}
            </div>
          </section>

          <section className="shop-section shop-sheet care-ask" aria-labelledby="care-ask">
            <h2 id="care-ask">{c.askTitle}</h2>
            <p>{c.askBody}</p>
            <ContactButtons />
            <div className="btn-row">
              <Link to="/faq" className="link-arrow">
                {c.faq}
              </Link>
              <Link to="/booking" className="link-arrow">
                <CalendarDays size={16} aria-hidden />
                {c.booking}
              </Link>
            </div>
          </section>
        </div>
      </section>
    </>
  )
}

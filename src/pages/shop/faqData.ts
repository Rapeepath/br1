// The shop's FAQ, as plain text so the page and its FAQPage JSON-LD say exactly the same thing.
// Rules quoted here mirror the shop's system: deposits and holds (server/extras.ts), the vaccine course
// each kitten has had (seeded records), payment methods and VAT (POS settings). The shop is a simulation.
import type { Lang } from '../../i18n'
import { PAID_HOLD_HOURS, READY_WEEKS, UNPAID_HOLD_HOURS } from '../../lib/shop'

export interface FaqItem {
  id: string
  q: string
  a: string
  link?: { to: string; label: string }
}

export interface FaqGroup {
  id: string
  title: string
  items: FaqItem[]
}

export function faqGroups(lang: Lang): FaqGroup[] {
  if (lang === 'en') {
    return [
      {
        id: 'reserve',
        title: 'Reserving a kitten',
        items: [
          {
            id: 'how',
            q: 'How do I reserve a kitten?',
            a: `Pick a kitten on the "Kittens ready for a home" page, press Reserve, give your name and phone number, then pay the deposit by PromptPay or bank transfer within ${UNPAID_HOLD_HOURS} hours. Once it’s paid the shop holds the kitten for you for ${PAID_HOLD_HOURS} hours and arranges the day you collect.`,
            link: { to: '/kittens', label: 'See kittens ready for a home' },
          },
          {
            id: 'deposit',
            q: 'How much is the deposit?',
            a: 'THB 2,000, or 10% of the price (rounded to the nearest hundred) for kittens over THB 40,000. The deposit comes off the price when you collect.',
          },
          {
            id: 'young',
            q: `What if the kitten isn’t ${READY_WEEKS} weeks old yet?`,
            a: `Kittens go home at ${READY_WEEKS} weeks at the earliest. If you reserve a younger kitten, the shop calls you to set the collection day and extends the hold until then.`,
          },
          {
            id: 'cancel',
            q: 'Can I cancel and get the deposit back?',
            a: 'Yes. Tell the shop your reservation number before you collect the kitten and the deposit is refunded in full within 7 days.',
          },
        ],
      },
      {
        id: 'health',
        title: 'Health and paperwork',
        items: [
          {
            id: 'vaccines',
            q: 'Which vaccines has a kitten had?',
            a: 'Every kitten is vaccinated for its age: the first core vaccine at 8 weeks, the second at 12 weeks, and the last one with the first rabies shot at 16 weeks. Each kitten’s page shows the dates it actually had them; the doses still to come after you take it home are on the aftercare page.',
            link: { to: '/care', label: 'Aftercare and vaccine schedule' },
          },
          {
            id: 'chip',
            q: 'Are kittens microchipped and checked by a vet?',
            a: 'Every kitten is microchipped and examined by a vet before handover. Where the breed has a DNA test for an inherited disease, the kitten’s page shows the result.',
          },
          {
            id: 'guarantee',
            q: 'Is there a health guarantee?',
            a: 'Yes: the shop covers infectious disease found by a vet within 7 days of collection, and inherited conditions the kitten tested negative for during its first year. You can also call the shop’s vet free for 30 days.',
            link: { to: '/care', label: 'Read the guarantee terms' },
          },
          {
            id: 'price',
            q: 'Why do kittens of the same breed cost different amounts?',
            a: 'Mostly the grade: pet-quality kittens go home to be companions (neutered, no breeding), show-quality kittens come with a pedigree from an association. Coat colour and the parents’ lines also matter.',
            link: { to: '/guide', label: 'What drives the price' },
          },
        ],
      },
      {
        id: 'buying',
        title: 'Paying and collecting',
        items: [
          {
            id: 'pay',
            q: 'How can I pay?',
            a: 'Cash, PromptPay, credit or debit card, or bank transfer. Cards from participating banks can spread the price over 3, 6 or 10 months at 0%.',
            link: { to: '/cost', label: 'Work out monthly instalments' },
          },
          {
            id: 'vat',
            q: 'Do prices include VAT? Can I get a receipt?',
            a: 'Prices include 7% VAT. Every payment comes with a receipt and abbreviated tax invoice.',
          },
          {
            id: 'collect',
            q: 'Do I have to collect at the shop?',
            a: 'You can collect at the shop or ask for delivery when you reserve. For delivery the shop tells you the charge for your distance before you confirm.',
          },
          {
            id: 'visit',
            q: 'Can I meet the kittens first?',
            a: 'Yes. Book a free one-hour visit online; you’ll meet the kittens and their parents and see the vaccine book and health checks.',
            link: { to: '/booking', label: 'Book a visit' },
          },
          {
            id: 'privacy',
            q: 'What happens to the details I fill in?',
            a: 'The shop uses them only to reply to you and to handle your booking or reservation. You can ask to see, correct or delete them at any time.',
            link: { to: '/privacy', label: 'Privacy policy' },
          },
        ],
      },
    ]
  }
  return [
    {
      id: 'reserve',
      title: 'การจองลูกแมว',
      items: [
        {
          id: 'how',
          q: 'จองลูกแมวได้อย่างไร',
          a: `เลือกน้องในหน้าลูกแมวพร้อมรับ กดจอง กรอกชื่อและเบอร์โทร แล้วชำระมัดจำผ่านพร้อมเพย์หรือโอนเงินภายใน ${UNPAID_HOLD_HOURS} ชั่วโมง เมื่อชำระแล้วร้านกันน้องไว้ให้ ${PAID_HOLD_HOURS} ชั่วโมงและนัดวันรับ`,
          link: { to: '/kittens', label: 'ดูลูกแมวพร้อมรับ' },
        },
        {
          id: 'deposit',
          q: 'มัดจำเท่าไร',
          a: '2,000 บาท หรือ 10% ของราคา (ปัดเป็นหลักร้อย) สำหรับน้องที่ราคาเกิน 40,000 บาท มัดจำหักออกจากราคาตอนรับน้อง',
        },
        {
          id: 'young',
          q: `ถ้าน้องยังอายุไม่ถึง ${READY_WEEKS} สัปดาห์`,
          a: `ร้านให้ลูกแมวกลับบ้านเมื่ออายุครบ ${READY_WEEKS} สัปดาห์ ถ้าจองน้องที่อายุน้อยกว่านั้น ร้านจะโทรนัดวันรับและขยายเวลาจองให้จนถึงวันนั้น`,
        },
        {
          id: 'cancel',
          q: 'ยกเลิกการจองได้ไหม ได้มัดจำคืนหรือเปล่า',
          a: 'ได้ แจ้งร้านพร้อมเลขที่จองก่อนรับน้อง ร้านคืนมัดจำเต็มจำนวนภายใน 7 วัน',
        },
      ],
    },
    {
      id: 'health',
      title: 'สุขภาพและเอกสาร',
      items: [
        {
          id: 'vaccines',
          q: 'ลูกแมวได้วัคซีนอะไรมาแล้วบ้าง',
          a: 'ทุกตัวได้วัคซีนตามอายุ วัคซีนรวมเข็มแรกที่ 8 สัปดาห์ เข็มที่ 2 ที่ 12 สัปดาห์ และเข็มสุดท้ายพร้อมพิษสุนัขบ้าเข็มแรกที่ 16 สัปดาห์ หน้าข้อมูลของน้องแต่ละตัวบอกวันที่ฉีดจริง ส่วนเข็มที่เหลือหลังรับกลับบ้านดูได้ในหน้าการดูแล',
          link: { to: '/care', label: 'การดูแลและตารางวัคซีน' },
        },
        {
          id: 'chip',
          q: 'ฝังไมโครชิปและตรวจสุขภาพแล้วหรือยัง',
          a: 'ทุกตัวฝังไมโครชิปและผ่านการตรวจสุขภาพโดยสัตวแพทย์ก่อนส่งมอบ ถ้าสายพันธุ์นั้นมีการตรวจ DNA หาโรคทางพันธุกรรม หน้าข้อมูลของน้องจะแสดงผลตรวจไว้ด้วย',
        },
        {
          id: 'guarantee',
          q: 'มีรับประกันสุขภาพไหม',
          a: 'มี ร้านรับผิดชอบโรคติดเชื้อที่สัตวแพทย์ตรวจพบภายใน 7 วันหลังรับน้อง และโรคทางพันธุกรรมที่น้องตรวจแล้วไม่พบภายในปีแรก และโทรปรึกษาสัตวแพทย์ของร้านได้ฟรี 30 วัน',
          link: { to: '/care', label: 'อ่านเงื่อนไขการรับประกัน' },
        },
        {
          id: 'price',
          q: 'ทำไมสายพันธุ์เดียวกันราคาไม่เท่ากัน',
          a: 'ส่วนใหญ่ขึ้นกับเกรด เกรดเลี้ยงไปอยู่บ้านเป็นเพื่อน (ทำหมัน ไม่ทำพันธุ์) ส่วนเกรดประกวดมีใบเพ็ดดีกรีจากสมาคม สีขนและสายเลือดพ่อแม่ก็มีผลด้วย',
          link: { to: '/guide', label: 'ปัจจัยที่กำหนดราคา' },
        },
      ],
    },
    {
      id: 'buying',
      title: 'การชำระเงินและการรับน้อง',
      items: [
        {
          id: 'pay',
          q: 'ชำระเงินได้ทางไหนบ้าง',
          a: 'เงินสด พร้อมเพย์ บัตรเครดิตหรือเดบิต และโอนเงิน บัตรของธนาคารที่ร่วมรายการผ่อน 0% ได้ 3, 6 หรือ 10 เดือน',
          link: { to: '/cost', label: 'คำนวณยอดผ่อนต่อเดือน' },
        },
        {
          id: 'vat',
          q: 'ราคารวม VAT แล้วหรือยัง ขอใบเสร็จได้ไหม',
          a: 'ราคาที่แสดงรวม VAT 7% แล้ว ทุกการชำระได้ใบเสร็จรับเงินและใบกำกับภาษีอย่างย่อ',
        },
        {
          id: 'collect',
          q: 'ต้องมารับน้องที่ร้านไหม',
          a: 'เลือกได้ตอนจองว่าจะรับที่ร้านหรือให้ร้านจัดส่ง ถ้าจัดส่ง ร้านแจ้งค่าส่งตามระยะทางให้ทราบก่อนยืนยัน',
        },
        {
          id: 'visit',
          q: 'ขอไปดูน้องก่อนได้ไหม',
          a: 'ได้ นัดชมที่ร้านทางเว็บได้ฟรี ครั้งละ 1 ชั่วโมง ได้เจอลูกแมวและพ่อแม่พันธุ์ และดูสมุดวัคซีนกับผลตรวจสุขภาพจริง',
          link: { to: '/booking', label: 'นัดชมลูกแมว' },
        },
        {
          id: 'privacy',
          q: 'ข้อมูลที่กรอกไว้ร้านเอาไปใช้ทำอะไร',
          a: 'ร้านใช้เพื่อติดต่อกลับและจัดการการนัดหรือการจองของคุณเท่านั้น ขอดู แก้ไข หรือลบข้อมูลได้ทุกเมื่อ',
          link: { to: '/privacy', label: 'นโยบายความเป็นส่วนตัว' },
        },
      ],
    },
  ]
}

/** Every question and answer, for FAQPage structured data. */
export const faqItems = (lang: Lang) => faqGroups(lang).flatMap((g) => g.items.map((i) => ({ q: i.q, a: i.a })))

/**
 * The FAQPage JSON-LD (same shape as seo.ts faqJsonLd). Built here because routes.tsx can't import seo.ts:
 * seo.ts reads the route list at load time, and the two would import each other.
 */
export const faqSchema = (lang: Lang) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems(lang).map((x) => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })),
})

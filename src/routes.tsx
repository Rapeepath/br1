import type { ReactElement } from 'react'
import { breedIds, breeds, getBreed } from './data'
import type { DictKey, Lang } from './i18n'
import { localized } from './i18n/content'
import { formatNumber } from './lib/format'
import { BreedPage } from './pages/BreedPage'
import { ComparePage } from './pages/ComparePage'
import { GuidePage } from './pages/GuidePage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { SourcesPage } from './pages/SourcesPage'
import { BookingPage } from './pages/shop/BookingPage'
import { CarePage } from './pages/shop/CarePage'
import { ContactPage } from './pages/shop/ContactPage'
import { CostPage } from './pages/shop/CostPage'
import { FaqPage } from './pages/shop/FaqPage'
import { faqSchema } from './pages/shop/faqData'
import { KittenPage } from './pages/shop/KittenPage'
import { KittensPage } from './pages/shop/KittensPage'
import { PrivacyPage } from './pages/shop/PrivacyPage'
import { ReservationPage } from './pages/shop/ReservationPage'
import { ReservePage } from './pages/shop/ReservePage'

/**
 * Every public page in one list: its route, what to prerender, and its SEO entry. The same tree serves
 * Thai at "/" and English under the router basename "/en", so paths here never carry a language prefix.
 *
 * To add a page: add an entry (path, element, prerender, meta) — App renders the route, the prerender
 * script writes its HTML for both languages, the sitemap lists it, and Layout applies its meta.
 */
export interface MetaInput {
  /** Page name; null gives the site's own title (home) */
  title: string | null
  description: string
  /** Site path of the share image (defaults to the cover photo) */
  image?: string
  /** Structured data objects (schema.org), added as JSON-LD */
  jsonLd?: object[]
  /** Add the shop's Store/Organization JSON-LD (home, contact) */
  store?: boolean
  /** Kept out of search engines and the sitemap */
  noindex?: boolean
  /** Hero photo to preload in the prerendered HTML */
  preload?: { src: string; sizes: string }
  /** Thai/English crumbs for BreadcrumbList; the page itself last */
  breadcrumb?: { name: string; path: string }[]
}

export interface MetaContext {
  params: Record<string, string | undefined>
  lang: Lang
  t: (key: DictKey) => string
}

export interface PageDef {
  /** React Router path inside the language root ('' = index) */
  path: string
  element: ReactElement
  /** 'static' = this one path; a function lists concrete paths (one per breed…); 'none' = client-only */
  prerender: 'static' | 'none' | (() => string[])
  meta: (ctx: MetaContext) => MetaInput
}

const cover = breeds[0]
const th = (lang: Lang, thai: string, english: string) => (lang === 'en' ? english : thai)

const HOME_TH = 'แค็ตตาล็อกสายพันธุ์แมวยอดนิยมในไทย 12 สายพันธุ์ พร้อมนิสัย การดูแล สุขภาพ และราคาโดยประมาณ'
const HOME_EN =
  'Twelve cat breeds popular in Thailand: temperament, care, health and approximate prices, plus a buyer’s guide.'

function breedMeta(id: string | undefined, lang: Lang): MetaInput {
  const base = getBreed(id)
  if (!base) return { title: th(lang, 'ไม่พบหน้า', 'Page not found'), description: '', noindex: true }
  const b = localized(base, lang)
  const low = b.price?.min ?? null
  const high = b.price?.max ?? null
  const priceText = low != null ? formatNumber(low) : null
  const description =
    lang === 'en'
      ? `${b.nameEn} cats: temperament, care, health checks and kitten prices in Thailand${priceText ? ` from about THB ${priceText}` : ''}.`
      : `แมว${b.nameTh} (${b.nameEn}) ${b.tagline}${priceText ? ` ราคาลูกแมวประมาณ ${priceText}${high ? `–${formatNumber(high)}` : ''} บาท` : ''} นิสัย การดูแล และสุขภาพ`
  return {
    title: lang === 'en' ? b.nameEn : b.nameTh,
    description,
    image: b.image.src,
    preload: { src: b.image.src, sizes: '(max-width: 960px) 100vw, 50vw' },
    breadcrumb: [
      { name: th(lang, 'สายพันธุ์ทั้งหมด', 'All breeds'), path: '/' },
      { name: lang === 'en' ? b.nameEn : b.nameTh, path: `/breeds/${b.id}` },
    ],
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: `${lang === 'en' ? b.nameEn : `แมว${b.nameTh}`} kitten`,
        alternateName: [b.nameEn, b.nameTh],
        description: lang === 'en' ? description : b.summary,
        image: [b.image.src],
        category: 'Pet cat',
        ...(low != null
          ? { offers: { '@type': 'AggregateOffer', priceCurrency: 'THB', lowPrice: low, highPrice: high ?? low } }
          : {}),
      },
    ],
  }
}

export const PAGES: PageDef[] = [
  {
    path: '',
    element: <HomePage />,
    prerender: 'static',
    meta: ({ lang }) => ({
      title: null,
      description: th(lang, HOME_TH, HOME_EN),
      image: cover?.image.src,
      store: true,
    }),
  },
  {
    path: 'breeds/:id',
    element: <BreedPage />,
    prerender: () => breedIds.map((id) => `/breeds/${id}`),
    meta: ({ params, lang }) => breedMeta(params.id, lang),
  },
  {
    path: 'compare',
    element: <ComparePage />,
    prerender: 'static',
    meta: ({ lang }) => ({
      title: th(lang, 'เปรียบเทียบสายพันธุ์', 'Compare breeds'),
      description: th(
        lang,
        'เปรียบเทียบนิสัย ขนาด การดูแล สุขภาพ และราคาของแมวสูงสุด 3 สายพันธุ์ทีละหัวข้อ',
        'Put up to three cat breeds side by side: temperament, size, care, health and price.',
      ),
    }),
  },
  {
    path: 'guide',
    element: <GuidePage />,
    prerender: 'static',
    meta: ({ lang }) => ({
      title: th(lang, 'คู่มือก่อนซื้อลูกแมว', 'Kitten buyer’s guide'),
      description: th(
        lang,
        'สิ่งที่ควรตรวจก่อนรับลูกแมว ปัจจัยที่กำหนดราคา ตารางวัคซีน ค่าใช้จ่ายในการเลี้ยง กฎหมายที่เกี่ยวข้อง และแหล่งรับเลี้ยง',
        'What to check before taking a kitten home, what drives the price, the vaccine schedule, running costs, the law and adoption options.',
      ),
    }),
  },
  {
    path: 'sources',
    element: <SourcesPage />,
    prerender: 'static',
    meta: ({ lang }) => ({
      title: th(lang, 'แหล่งข้อมูล', 'Sources'),
      description: th(
        lang,
        'แหล่งอ้างอิงของข้อมูลสายพันธุ์ ราคา และสุขภาพแมว พร้อมเครดิตภาพ',
        'References for the breed, price and health information, with photo credits.',
      ),
    }),
  },
  // The shop: contact, visits, kittens and reservations (live from the POS), and the policy pages
  {
    path: 'contact',
    element: <ContactPage />,
    prerender: 'static',
    meta: ({ t, lang }) => ({
      title: t('page.contact'),
      description: th(
        lang,
        'ติดต่อ Maew Cat House สาขาอารีย์ ที่อยู่ เบอร์โทร LINE เวลาเปิดทำการ และแบบฟอร์มสอบถามเรื่องสายพันธุ์และลูกแมวที่พร้อมรับ',
        'Contact Maew Cat House in Ari: address, phone, LINE, opening hours and a form to ask about breeds and kittens.',
      ),
      store: true,
    }),
  },
  {
    path: 'booking',
    element: <BookingPage />,
    prerender: 'static',
    meta: ({ t, lang }) => ({
      title: t('page.booking'),
      description: th(
        lang,
        'นัดเวลาเข้ามาชมลูกแมวที่ร้าน ครั้งละ 1 ชั่วโมง ไม่มีค่าใช้จ่าย เลือกวันและเวลาที่ว่างได้ล่วงหน้า 21 วัน',
        'Book a free one-hour visit to meet the kittens at the shop; pick a free day and time up to 21 days ahead.',
      ),
    }),
  },
  {
    path: 'faq',
    element: <FaqPage />,
    prerender: 'static',
    meta: ({ t, lang }) => ({
      title: t('page.faq'),
      description: th(
        lang,
        'คำถามที่พบบ่อยเรื่องการจองลูกแมว มัดจำ วัคซีน การรับประกันสุขภาพ การชำระเงิน และการรับน้อง',
        'Questions about reserving a kitten, deposits, vaccines, the health guarantee, paying and collecting.',
      ),
      jsonLd: [faqSchema(lang)],
    }),
  },
  {
    path: 'privacy',
    element: <PrivacyPage />,
    prerender: 'static',
    meta: ({ t, lang }) => ({
      title: t('page.privacy'),
      description: th(
        lang,
        'ข้อมูลส่วนบุคคลที่ร้านเก็บ นำไปใช้เพื่ออะไร เก็บไว้นานเท่าไร และสิทธิ์ของคุณตาม PDPA พร้อมแบบฟอร์มคำขอ',
        'What personal data the shop keeps, why, for how long, and your rights under Thailand’s PDPA, with a request form.',
      ),
    }),
  },
  {
    path: 'care',
    element: <CarePage />,
    prerender: 'static',
    meta: ({ t, lang }) => ({
      title: t('page.care'),
      description: th(
        lang,
        'สิ่งที่ลูกแมวทุกตัวได้รับก่อนกลับบ้าน การดูแลเดือนแรก ตารางวัคซีน การตรวจสุขภาพแต่ละสายพันธุ์ และเงื่อนไขการรับประกันสุขภาพ',
        'What every kitten has before going home, the first month, the vaccine schedule, breed screening and the health guarantee.',
      ),
    }),
  },
  {
    path: 'cost',
    element: <CostPage />,
    prerender: 'static',
    meta: ({ t, lang }) => ({
      title: t('page.cost'),
      description: th(
        lang,
        'คำนวณค่าเลี้ยงแมวรายเดือนและปีแรกจากช่วงราคาในไทย พร้อมยอดผ่อนบัตร 0% 3, 6 และ 10 เดือน',
        'Work out the monthly and first-year cost of keeping a cat from Thai price ranges, with 0% card instalments over 3, 6 or 10 months.',
      ),
    }),
  },
  {
    path: 'kittens',
    element: <KittensPage />,
    prerender: 'static',
    meta: ({ t, lang }) => ({
      title: t('page.kittens'),
      description: th(
        lang,
        'ลูกแมวที่พร้อมรับและจองได้ที่ร้าน เลือกตามสายพันธุ์ เพศ สี และอายุ ทุกตัวตรวจสุขภาพ ฉีดวัคซีนตามอายุ และฝังไมโครชิปแล้ว',
        'Kittens you can reserve at the shop, by breed, sex, colour and age; each vet-checked, vaccinated for its age and microchipped.',
      ),
    }),
  },
  {
    path: 'kittens/:id',
    element: <KittenPage />,
    prerender: 'none',
    meta: ({ t, lang }) => ({
      title: t('page.kitten'),
      description: th(lang, 'ข้อมูลลูกแมว วัคซีน ผลตรวจสุขภาพ และการจอง', 'A kitten’s details, vaccines, health checks and reservation.'),
    }),
  },
  {
    path: 'reserve/:id',
    element: <ReservePage />,
    prerender: 'none',
    meta: ({ t, lang }) => ({ title: t('page.reserve'), description: th(lang, 'จองลูกแมวและชำระมัดจำ', 'Reserve a kitten and pay the deposit.'), noindex: true }),
  },
  {
    path: 'reservation/:no',
    element: <ReservationPage />,
    prerender: 'none',
    meta: ({ t, lang }) => ({ title: t('page.reservation'), description: th(lang, 'สถานะการจองลูกแมว', 'Kitten reservation status.'), noindex: true }),
  },
]

/** The catch-all; prerendered separately as 404.html */
export const NOT_FOUND: PageDef = {
  path: '*',
  element: <NotFoundPage />,
  prerender: 'none',
  meta: ({ t }) => ({ title: t('notFound.title'), description: t('notFound.body'), noindex: true }),
}

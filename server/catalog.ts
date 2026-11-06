// What this shop sells and how its simulated days go. Everything specific to Maew lives here; the rest of
// server/ is the same POS engine the Servo showroom runs.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { BookingSeed, LeadSeed } from './crm.ts'
import type { CartLineInput, Category, Customer, PaymentMethod, Product, Settings } from './types.ts'
import { shelfPrice, type Rng } from './util.ts'

export interface CatalogRecord {
  id: string
  [key: string]: unknown
}

export interface Catalog {
  /** Seeds the PRNG so every reset replays the same history */
  seed: number
  settings: Settings
  categories: Category[]
  staff: { id: string; name: string; title: string; role: 'manager' | 'staff'; pin: string; tone: string }[]
  customers: Omit<Customer, 'id' | 'createdAt'>[]
  /** Catalogue records (breeds) by id, returned with a product so the admin can show everything known */
  records: Map<string, CatalogRecord>
  products: (now: string) => Product[]
  /** How many units to have on the shelf after the simulated history */
  stockTarget: (p: Product, r: Rng) => number
  reorderLevel: (p: Product) => number
  openHour: number
  closeHour: number
  openingCash: number
  /** Bills on a given weekday (0 = Sunday) */
  ordersPerDay: (r: Rng, weekday: number) => number
  basket: (r: Rng, products: Product[]) => CartLineInput[]
  /** Share of bills rung up without a customer record */
  walkInRate: number
  payment: (r: Rng, total: number) => PaymentMethod
  /** Days (counted back from today) on which deliveries arrive */
  deliveryEvery: number
  /** Visits booked from the brochure: Maew books one-hour visits to meet the kittens */
  booking: { kind: 'visit' | 'demo'; label: string; durationMin: number; windowDays: number }
  /** Demo contacts for the admin's contact book (no reviews: those only come from real visitors) */
  crmSeed: { leads: LeadSeed[]; bookings: BookingSeed[] }
}

interface Breed {
  id: string
  nameTh: string
  nameEn: string
  group: 'thai' | 'international'
  origin: string
  size: 'small' | 'medium' | 'large'
  lifespanYears: [number, number] | null
  weightKg: { female: [number, number] | null; male: [number, number] | null }
  coat: { length: 'short' | 'medium' | 'long' | 'hairless' }
  price: { min: number | null; max: number | null } | null
  image: { srcSmall: string }
  [key: string]: unknown
}

const SIZE = { small: 'เล็ก', medium: 'กลาง', large: 'ใหญ่' } as const
const COAT = { short: 'ขนสั้น', medium: 'ขนยาวปานกลาง', long: 'ขนยาว', hairless: 'ไม่มีขน' } as const

const range = (r: [number, number] | null, unit: string) => (r ? `${r[0]}–${r[1]} ${unit}` : 'ไม่ระบุ')

function readBreeds(root: string): Breed[] {
  return JSON.parse(readFileSync(join(root, 'src/data/breeds.json'), 'utf8')) as Breed[]
}

const SKU_CODE: Record<string, string> = {
  siamese: 'SIA',
  korat: 'KOR',
  'khao-manee': 'KHM',
  'british-shorthair': 'BSH',
  'scottish-fold': 'SCF',
  persian: 'PER',
  'exotic-shorthair': 'EXO',
  'american-shorthair': 'ASH',
  'maine-coon': 'MCO',
  ragdoll: 'RAG',
  munchkin: 'MUN',
  bengal: 'BEN',
}

/** Food, supplies and clinic services, priced inside the ranges in the site's ownership-cost table. */
const EXTRAS: { id: string; sku: string; name: string; subtitle: string; categoryId: string; price: number; cost: number; facts: [string, string][] }[] = [
  { id: 'food-kitten-1500', sku: 'MW-FD-01', name: 'อาหารเม็ดลูกแมว', subtitle: 'ถุง 1.5 กก.', categoryId: 'supply', price: 590, cost: 395, facts: [['เหมาะกับ', 'ลูกแมว 2–12 เดือน'], ['ขนาด', '1.5 กก.']] },
  { id: 'food-adult-3000', sku: 'MW-FD-02', name: 'อาหารเม็ดแมวโต', subtitle: 'ถุง 3 กก.', categoryId: 'supply', price: 890, cost: 610, facts: [['เหมาะกับ', 'แมวอายุ 1 ปีขึ้นไป'], ['ขนาด', '3 กก.']] },
  { id: 'food-wet-12', sku: 'MW-FD-03', name: 'อาหารเปียกแมว', subtitle: 'แพ็ก 12 ซอง', categoryId: 'supply', price: 300, cost: 205, facts: [['ขนาด', '12 ซอง × 70 กรัม']] },
  { id: 'litter-10l', sku: 'MW-LT-01', name: 'ทรายแมวเต้าหู้', subtitle: 'ถุง 10 ลิตร', categoryId: 'supply', price: 220, cost: 140, facts: [['ขนาด', '10 ลิตร'], ['ชนิด', 'เต้าหู้ ทิ้งชักโครกได้']] },
  { id: 'starter-kit', sku: 'MW-KT-01', name: 'ชุดอุปกรณ์เริ่มต้นเลี้ยงแมว', subtitle: 'กระบะทราย ชาม ที่ลับเล็บ กระเป๋า', categoryId: 'supply', price: 2490, cost: 1590, facts: [['ในชุด', 'กระบะทราย ชาม 2 ใบ ที่ลับเล็บ กระเป๋าใส่แมว']] },
  { id: 'scratcher', sku: 'MW-AC-01', name: 'ที่ลับเล็บกระดาษลูกฟูก', subtitle: 'ขนาด 45 ซม.', categoryId: 'supply', price: 390, cost: 230, facts: [['ขนาด', '45 × 22 ซม.']] },
  { id: 'carrier', sku: 'MW-AC-02', name: 'กระเป๋าใส่แมว', subtitle: 'ระบายอากาศรอบด้าน', categoryId: 'supply', price: 890, cost: 560, facts: [['รับน้ำหนัก', 'ไม่เกิน 8 กก.']] },
  { id: 'flea-drop', sku: 'MW-MD-01', name: 'ยาหยอดป้องกันเห็บหมัดและพยาธิ', subtitle: '1 หลอด (1 เดือน)', categoryId: 'supply', price: 290, cost: 190, facts: [['ใช้', 'หยอดหลังคอเดือนละครั้ง']] },
  { id: 'svc-vaccine-set', sku: 'MW-SV-01', name: 'วัคซีนชุดลูกแมว', subtitle: 'วัคซีนรวม 3 เข็ม + พิษสุนัขบ้า', categoryId: 'service', price: 3200, cost: 1400, facts: [['ตารางฉีด', '8, 12 และ 16 สัปดาห์']] },
  { id: 'svc-booster', sku: 'MW-SV-02', name: 'วัคซีนกระตุ้นประจำปี', subtitle: 'วัคซีนรวม + พิษสุนัขบ้า', categoryId: 'service', price: 750, cost: 320, facts: [['ความถี่', 'ปีละครั้ง']] },
  { id: 'svc-spay', sku: 'MW-SV-03', name: 'ทำหมัน', subtitle: 'รวมยาและค่าดูแลหลังผ่าตัด', categoryId: 'service', price: 2200, cost: 1100, facts: [['อายุที่เหมาะ', '5–6 เดือนขึ้นไป']] },
  { id: 'svc-bloodtest', sku: 'MW-SV-04', name: 'ตรวจเลือดก่อนผ่าตัด', subtitle: 'CBC + ค่าตับไต', categoryId: 'service', price: 750, cost: 380, facts: [['รู้ผล', 'ภายใน 1 ชั่วโมง']] },
  { id: 'svc-microchip', sku: 'MW-SV-05', name: 'ฝังไมโครชิป', subtitle: 'พร้อมลงทะเบียนเจ้าของ', categoryId: 'service', price: 500, cost: 220, facts: [['มาตรฐาน', 'ISO 11784/11785']] },
  { id: 'svc-insurance', sku: 'MW-SV-06', name: 'ประกันสัตว์เลี้ยง 12 เดือน', subtitle: 'ค่ารักษาสูงสุด 20,000 บาท/ปี', categoryId: 'service', price: 3600, cost: 2700, facts: [['คุ้มครอง', '12 เดือน']] },
]

const GRADES = [
  { key: 'pet', label: 'เกรดเลี้ยง', code: 'P', note: 'มีสมุดวัคซีน ไม่รวมใบเพ็ดดีกรี', at: 0.35 },
  { key: 'show', label: 'เกรดประกวด', code: 'S', note: 'มีใบเพ็ดดีกรีจากสมาคม', at: 0.8 },
] as const

export function loadCatalog(root: string): Catalog {
  const breeds = readBreeds(root)
  const records = new Map<string, CatalogRecord>(breeds.map((b) => [b.id, b]))

  const products = (now: string): Product[] => {
    const kittens = breeds.flatMap((b) =>
      GRADES.map((g): Product => {
        const min = b.price?.min ?? 3000
        const max = b.price?.max ?? min * 4
        // Geometric interpolation: price ranges are wide and skewed (a pet Persian is nearer the bottom)
        const price = shelfPrice(min * Math.pow(max / min, g.at))
        return {
          id: `${b.id}-${g.key}`,
          sku: `MW-${SKU_CODE[b.id] ?? b.id.slice(0, 3).toUpperCase()}-${g.code}`,
          name: `ลูกแมว${b.nameTh.replace(/\s*\(.*\)/, '')} ${g.label}`,
          subtitle: b.nameEn,
          categoryId: 'kitten',
          refId: b.id,
          variant: g.label,
          price,
          cost: Math.round(price * 0.55),
          stock: 0,
          reorderLevel: 1,
          trackStock: true,
          active: true,
          image: b.image.srcSmall,
          facts: [
            { label: 'เกรด', value: `${g.label} (${g.note})` },
            { label: 'ถิ่นกำเนิด', value: b.origin },
            { label: 'ขนาดตัว', value: SIZE[b.size] },
            { label: 'ขน', value: COAT[b.coat.length] },
            { label: 'อายุขัย', value: range(b.lifespanYears, 'ปี') },
            { label: 'น้ำหนักโตเต็มวัย', value: range(b.weightKg.male ?? b.weightKg.female, 'กก.') },
            { label: 'ราคาตลาดไทย', value: b.price?.min ? `${b.price.min.toLocaleString('th-TH')}–${(b.price.max ?? b.price.min).toLocaleString('th-TH')} บาท` : 'ไม่ระบุ' },
          ],
          createdAt: now,
          updatedAt: now,
        }
      }),
    )
    const extras = EXTRAS.map(
      (e): Product => ({
        id: e.id,
        sku: e.sku,
        name: e.name,
        subtitle: e.subtitle,
        categoryId: e.categoryId,
        refId: null,
        variant: null,
        price: e.price,
        cost: e.cost,
        stock: 0,
        reorderLevel: e.categoryId === 'supply' ? 6 : 0,
        trackStock: e.categoryId === 'supply',
        active: true,
        image: null,
        facts: e.facts.map(([label, value]) => ({ label, value })),
        createdAt: now,
        updatedAt: now,
      }),
    )
    return [...kittens, ...extras]
  }

  const kittensOf = (ps: Product[]) => ps.filter((p) => p.categoryId === 'kitten')
  const supplies = (ps: Product[]) => ps.filter((p) => p.categoryId === 'supply')
  const services = (ps: Product[]) => ps.filter((p) => p.categoryId === 'service')

  return {
    seed: 20261106,
    settings: {
      storeName: 'Maew Cat House',
      branch: 'สาขาอารีย์',
      address: '88/8 ซอยอารีย์ 2 ถนนพหลโยธิน แขวงพญาไท เขตพญาไท กรุงเทพฯ 10400',
      phone: '02-123-4567',
      taxId: '0105569012345',
      vatRate: 7,
      receiptFooter: 'ขอบคุณที่รับน้องแมวไปดูแล โทรปรึกษาสัตวแพทย์ของร้านได้ฟรีตลอด 30 วันแรก',
      receiptPrefix: 'MW',
      email: 'hello@maew-cathouse.example',
      lineId: '@maewcathouse',
      lineUrl: 'https://line.me/R/ti/p/@maewcathouse',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('88/8 ซอยอารีย์ 2 ถนนพหลโยธิน แขวงพญาไท เขตพญาไท กรุงเทพฯ 10400'),
      hours: [0, 1, 2, 3, 4, 5, 6].map((day) => ({ day, open: '10:00', close: '20:00' })),
      siteUrl: 'https://maew-cathouse.example',
    },
    categories: [
      { id: 'kitten', label: 'ลูกแมว', unit: 'ตัว' },
      { id: 'supply', label: 'อาหารและอุปกรณ์', unit: 'ชิ้น' },
      { id: 'service', label: 'บริการสุขภาพ', unit: 'ครั้ง' },
    ],
    staff: [
      { id: 'st-1', name: 'ปวีณา ใจดี', title: 'ผู้จัดการร้าน', role: 'manager', pin: '1111', tone: 'peach' },
      { id: 'st-2', name: 'ธนกร มีสุข', title: 'แคชเชียร์', role: 'staff', pin: '2222', tone: 'mint' },
      { id: 'st-3', name: 'ศิริพร แสงทอง', title: 'พนักงานดูแลแมว', role: 'staff', pin: '3333', tone: 'sky' },
    ],
    customers: CUSTOMERS,
    records,
    products,
    stockTarget: (p, r) =>
      p.categoryId === 'kitten' ? (p.variant === 'เกรดเลี้ยง' ? r.int(0, 4) : r.int(0, 2)) : r.int(3, 30),
    reorderLevel: (p) => p.reorderLevel,
    openHour: 10,
    closeHour: 20,
    openingCash: 3000,
    ordersPerDay: (r, weekday) => (weekday === 0 || weekday === 6 ? r.int(6, 11) : r.int(3, 7)),
    // Only the seed calls this; it ignores stock on purpose (the seed sizes opening stock to fit what sold)
    basket: (r, ps) => {
      const lines: CartLineInput[] = []
      if (r.chance(0.3)) {
        const k = kittensOf(ps)
        if (k.length) {
          lines.push({ productId: r.pick(k).id, qty: 1 })
          // New owners usually leave with the basics
          if (r.chance(0.7)) lines.push({ productId: 'starter-kit', qty: 1 })
          if (r.chance(0.6)) lines.push({ productId: 'svc-vaccine-set', qty: 1 })
          if (r.chance(0.3)) lines.push({ productId: 'svc-microchip', qty: 1 })
        }
      }
      const n = lines.length ? r.int(0, 2) : r.int(1, 3)
      for (let i = 0; i < n; i++) {
        const pool = r.chance(0.75) ? supplies(ps) : services(ps)
        const p = r.pick(pool)
        if (!p || lines.some((l) => l.productId === p.id)) continue
        lines.push({ productId: p.id, qty: p.categoryId === 'supply' ? r.int(1, 3) : 1 })
      }
      if (!lines.length) lines.push({ productId: 'svc-booster', qty: 1 })
      return lines
    },
    walkInRate: 0.45,
    payment: (r, total) => {
      if (total > 20000) return r.weighted(['card', 'transfer', 'promptpay'] as const, (m) => (m === 'card' ? 5 : 3))
      return r.weighted(['cash', 'promptpay', 'card', 'transfer'] as const, (m) => ({ cash: 4, promptpay: 5, card: 2, transfer: 1 })[m])
    },
    deliveryEvery: 10,
    booking: { kind: 'visit', label: 'ชมลูกแมว', durationMin: 60, windowDays: 21 },
    crmSeed: CRM_SEED,
  }
}

const CRM_SEED: Catalog['crmSeed'] = {
  leads: [
    { kind: 'inquiry', name: 'คุณพลอยไพลิน ศรีสุข', phone: '081-447-2093', lineId: '@ploypailin', message: 'อยากได้ลูกแมวสก็อตติช โฟลด์ตัวเมีย สีครีม มีตัวไหนพร้อมรับเดือนนี้ไหมคะ', refIds: ['scottish-fold'], daysAgo: 0, status: 'new' },
    { kind: 'inquiry', name: 'คุณธนวัฒน์ ใจกว้าง', phone: '089-552-1187', email: 'thanawat.j@example.com', message: 'คอนโด 30 ตร.ม. เลี้ยงเมนคูนได้ไหม หรือควรเลือกสายพันธุ์ไหนดี', refIds: ['maine-coon', 'british-shorthair'], daysAgo: 2, status: 'contacted', note: 'แนะนำบริติช ช็อตแฮร์ นัดมาดูตัวจริงเสาร์นี้' },
    { kind: 'inquiry', name: 'คุณกมลวรรณ อินทร์แก้ว', phone: '062-318-7745', email: 'kamonwan@example.com', message: 'มีบริการส่งลูกแมวไปเชียงใหม่ไหมคะ ค่าส่งเท่าไร', refIds: ['ragdoll'], daysAgo: 4, status: 'contacted', note: 'แจ้งว่าส่งได้เฉพาะกรุงเทพฯ และปริมณฑลด้วยรถของร้าน' },
    { kind: 'inquiry', name: 'คุณอรรถสิทธิ์ เพชรดี', phone: '095-661-4402', message: 'ขอทราบผลตรวจ DNA HCM ของพ่อแม่พันธุ์เมนคูน', refIds: ['maine-coon'], daysAgo: 7, status: 'won', note: 'ส่งสำเนาผลตรวจให้ทาง LINE แล้ว ลูกค้าซื้อเกรดประกวด 1 ตัว' },
    { kind: 'inquiry', name: 'คุณสุนิสา แก้วมณี', phone: '086-904-2231', message: 'ราคาวิเชียรมาศเกรดเลี้ยงรวมวัคซีนแล้วหรือยัง', refIds: ['siamese'], daysAgo: 12, status: 'lost', note: 'ลูกค้าตัดสินใจรับเลี้ยงจากมูลนิธิแทน' },
    { kind: 'inquiry', name: 'คุณวรวุฒิ ทองดี', phone: '091-773-5018', email: 'worawut.t@example.com', message: 'สนใจเบงกอลตัวผู้ ลายจุดชัด ขอดูรูปเพิ่มเติม', refIds: ['bengal'], daysAgo: 1, status: 'new' },
    { kind: 'privacy', name: 'คุณจิตรลดา พรหมมา', phone: '084-215-9936', email: 'jitlada.p@example.com', message: 'ขอดูข้อมูล: อยากทราบว่าร้านเก็บข้อมูลอะไรของฉันไว้บ้างจากการซื้อเมื่อปีที่แล้ว', request: 'access', daysAgo: 3, status: 'new' },
  ],
  bookings: [
    { name: 'คุณนภัสสร วงศ์ใหญ่', phone: '081-338-2207', note: 'มากับลูก 2 คน', refId: 'british-shorthair', dayOffset: -9, slot: 2, status: 'done' },
    { name: 'คุณเอกพงษ์ ศรีวิไล', phone: '089-704-6631', refId: 'persian', dayOffset: -5, slot: 5, status: 'done' },
    { name: 'คุณปิยนุช แสงทอง', phone: '062-551-0942', refId: 'munchkin', dayOffset: -2, slot: 3, status: 'no-show' },
    { name: 'คุณชลธิชา บุญมี', phone: '094-188-3376', note: 'ติดธุระ ขอเลื่อนไปสัปดาห์หน้า', refId: 'ragdoll', dayOffset: -1, slot: 1, status: 'cancelled' },
    { name: 'คุณธนวัฒน์ ใจกว้าง', phone: '089-552-1187', email: 'thanawat.j@example.com', note: 'ดูบริติช ช็อตแฮร์ตัวผู้', refId: 'british-shorthair', dayOffset: 1, slot: 4, status: 'confirmed' },
    { name: 'คุณมัลลิกา ชัยวัฒน์', phone: '095-207-8813', refId: 'scottish-fold', dayOffset: 2, slot: 1, status: 'pending' },
    { name: 'คุณภาณุพงศ์ แก้วประเสริฐ', phone: '086-640-1159', note: 'แพ้ขนแมวเล็กน้อย อยากลองอยู่ใกล้ ๆ ก่อน', refId: 'siamese', dayOffset: 3, slot: 6, status: 'confirmed' },
    { name: 'คุณศศิธร มณีวงศ์', phone: '081-920-4471', refId: 'maine-coon', dayOffset: 6, slot: 2, status: 'pending' },
  ],
}

const CUSTOMERS: Omit<Customer, 'id' | 'createdAt'>[] = [
  ['ณัฐธิดา วงศ์สวัสดิ์', '081-234-5671', 'natthida.w@example.com'],
  ['กิตติพงษ์ ศรีสุข', '089-112-4432', null],
  ['พิมพ์ชนก อินทร์แก้ว', '086-554-1209', 'pimchanok@example.com'],
  ['อรุณี บุญมา', '062-781-3345', null],
  ['ชยพล ทองดี', '091-223-8890', 'chayaphon.t@example.com'],
  ['วรรณา แก้วประเสริฐ', '085-667-2213', null],
  ['ธีรวัฒน์ จันทร์เพ็ญ', '094-338-1176', 'teerawat@example.com'],
  ['สุภาวดี พรหมมา', '063-440-9981', null],
  ['ภูริช ศักดิ์สิทธิ์', '082-915-6624', 'purich.s@example.com'],
  ['กมลชนก รุ่งเรือง', '098-227-4410', null],
  ['ปิยะพงษ์ สายทอง', '087-660-3392', null],
  ['นันทนา เพชรรัตน์', '061-778-2045', 'nantana.p@example.com'],
  ['ศุภกร วิเศษศรี', '092-114-5587', null],
  ['จิราพร ใจงาม', '084-339-7702', 'jiraporn@example.com'],
  ['อนุชา มณีวงศ์', '080-552-8163', null],
  ['เบญจมาศ คำแก้ว', '095-661-2290', null],
  ['ณัฐพงศ์ เรืองศรี', '083-447-1938', 'nattapong.r@example.com'],
  ['สิริกาญจน์ ทองคำ', '066-882-5514', null],
  ['ปวริศ อุดมสุข', '097-330-6647', 'pawarit@example.com'],
  ['ลลิตา ศรีวงศ์', '088-219-4475', null],
  ['ธนพร สุขประเสริฐ', '090-775-3321', 'thanaporn.s@example.com'],
  ['วีรยุทธ ชัยมงคล', '064-118-9956', null],
  ['ชุติมา บุญเรือง', '093-552-7780', null],
  ['ศรัณย์ ภักดี', '081-664-2017', 'sarun.p@example.com'],
  ['ปาริชาติ นิลสุวรรณ', '086-903-4458', null],
  ['ภาณุวัฒน์ แสนดี', '089-447-1126', null],
  ['รัชนีกร มั่นคง', '062-339-8804', 'ratchaneekorn@example.com'],
  ['อภิสิทธิ์ เจริญผล', '091-880-2253', null],
  ['กัญญาณัฐ สมบูรณ์', '085-221-6639', 'kanyanat.s@example.com'],
  ['เอกชัย วัฒนา', '094-556-3378', null],
  ['ดวงกมล ศรีสวัสดิ์', '063-772-1194', null],
  ['ณัฐวุฒิ ประเสริฐสุข', '082-448-5502', 'nattawut.p@example.com'],
].map(([name, phone, email]) => ({
  name: name as string,
  phone: phone as string,
  email: email as string | null,
  kind: 'person' as const,
  taxId: null,
  address: null,
  note: null,
}))

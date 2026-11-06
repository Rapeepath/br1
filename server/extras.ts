// Maew's own part of the POS: every kitten as its own record (sex, colour, birth date, parents, vaccines,
// vet check, genetic tests), and reservations that hold a kitten against a deposit until it is collected.
// (Servo's extras.ts holds quotations instead; both export registerExtras and seedExtras.)
import type { Catalog } from './catalog.ts'
import { createLead, nextNo, personOf } from './crm.ts'
import { langOf, publicForm, publicRoute, requireManager, route, text } from './http.ts'
import { addUnit, getProduct, log, newUnitRecord, nextId, releaseUnit, reserveUnit, setUnitWithdrawn, type KittenFields } from './logic.ts'
import { publicStore } from './public.ts'
import type { Db, GeneticResult, KittenUnit, Product, Reservation, ReservationStatus, Sex, Staff } from './types.ts'
import { HttpError, addDays, dayKey, money, newToken, type Rng } from './util.ts'

/** Unpaid holds lapse after 2 hours; a paid deposit holds the kitten for 48 hours */
export const UNPAID_HOLD_MS = 2 * 3_600_000
export const PAID_HOLD_MS = 48 * 3_600_000

/** 2,000 baht, or 10% (rounded to the hundred) for kittens over 40,000 baht */
export const depositFor = (price: number) => (price > 40_000 ? Math.round((price * 0.1) / 100) * 100 : 2000)

interface BreedRecord {
  id: string
  nameTh: string
  coat?: { colors?: string[] }
  health?: { name: string; screening: string | null }[]
}

const breedOf = (catalog: Catalog, refId: string) => catalog.records.get(refId) as unknown as BreedRecord | undefined

/** Health problems the breed has a DNA test for (from the brochure's breed health data) */
export const dnaTests = (breed: BreedRecord | undefined) =>
  (breed?.health ?? []).filter((h) => h.screening && /DNA/i.test(h.screening)).map((h) => h.name)

export const unitPrice = (db: Db, u: KittenUnit) => u.price ?? getProduct(db, u.productId).price

export const ageWeeks = (birthDate: string, now: Date) => Math.floor((now.getTime() - new Date(`${birthDate}T00:00:00+07:00`).getTime()) / (7 * 86_400_000))

// ---------- Generating believable kittens ----------

/** Thai pet names (desserts, fruit, flowers, gems, drinks …); every seeded kitten gets its own */
const KITTEN_NAMES = [
  ...new Set([
    'ข้าวปั้น', 'โมจิ', 'มะลิ', 'ถุงทอง', 'ส้มจี๊ด', 'ชาไทย', 'นมเย็น', 'ขนมปัง', 'บัวลอย', 'มะขาม', 'ลูกชุบ', 'ข้าวหอม',
    'เต้าหู้', 'สายไหม', 'ฟักทอง', 'มะพร้าว', 'โกโก้', 'คาราเมล', 'ทองหยิบ', 'ขนุน', 'ลำไย', 'ข้าวตู', 'ปุยฝ้าย', 'น้ำผึ้ง',
    'ช็อกโก', 'วาฟเฟิล', 'มัฟฟิน', 'พุดดิ้ง', 'ซูชิ', 'ทาโร่', 'มิโซะ', 'อิคุระ', 'ลาเต้', 'มอคค่า', 'บิสกิต', 'เมฆ',
    'ทองแดง', 'ส้มโอ', 'มังคุด', 'เงาะ', 'ลิ้นจี่', 'มะม่วง', 'กล้วยหอม', 'แตงโม', 'ข้าวเหนียว', 'ขนมครก', 'ทองม้วน',
    'ฝอยทอง', 'สังขยา', 'ขนมชั้น', 'กะทิ', 'ใบเตย', 'ดอกแก้ว', 'ดอกรัก', 'จำปี', 'จำปา', 'พุดซ้อน', 'ราตรี', 'ชบา',
    'บุหงา', 'ลีลาวดี', 'ดาวเรือง', 'เพชร', 'ไพลิน', 'มรกต', 'ทับทิม', 'บุษบา', 'ไข่มุก', 'หยก', 'อำพัน', 'ปะการัง',
    'ทะเล', 'สายรุ้ง', 'ฟ้าใส', 'ดาว', 'จันทร์เพ็ญ', 'ปีโป้', 'เจลลี่', 'ขนมจีบ', 'ซาลาเปา', 'เกี๊ยว', 'ติ่มซำ', 'โจ๊ก',
    'ชาเขียว', 'โอวัลติน', 'กาแฟ', 'คาปูชิโน่', 'ครัวซองต์', 'โดนัท', 'บราวนี่', 'คุกกี้', 'ทาร์ต', 'ชีส', 'เนยสด',
    'นมสด', 'ฮันนี่', 'โทฟุ', 'ว้อนตัน', 'ปาท่องโก๋', 'มาการอง', 'ทิรามิสุ', 'แพนเค้ก', 'เครป', 'บลูเบอร์รี่',
    'สตรอว์เบอร์รี่', 'เชอร์รี่', 'พีช', 'แอปเปิล', 'กีวี่', 'เลมอน', 'มินต์', 'เมล่อน', 'ส้มแป้น', 'ลูกหว้า', 'กุ๊กไก่',
    'รวงข้าว', 'ใบบัว', 'ปลาทู', 'หมูหยอง', 'ไข่ตุ๋น', 'ข้าวผัด', 'ต้มยำ', 'ป๊อปคอร์น', 'ขนมผิง', 'ลอดช่อง',
    'ทับทิมกรอบ', 'กล้วยไข่', 'สละ', 'ละมุด', 'น้อยหน่า', 'ชมพู่', 'ฝรั่ง', 'พุทรา', 'มะปราง', 'ลองกอง', 'ส้มเขียวหวาน',
    'อัญชัน', 'กุหลาบ', 'ทานตะวัน', 'บัวหลวง', 'แก้วมังกร', 'มะนาว', 'ขิง', 'ข่า', 'พริกไทย', 'อบเชย', 'วานิลลา',
    'มาร์ชเมลโล่', 'คัสตาร์ด', 'ทองเอก', 'เม็ดขนุน', 'ขนมถ้วย', 'ข้าวเกรียบ', 'ไอติม', 'วุ้นมะพร้าว', 'สาคู',
  ]),
]
/** Added after a name only if the pool ever runs out (never digits) */
const NAME_SUFFIXES = ['น้อย', 'จิ๋ว', 'ทอง', 'แก้ว', 'เงิน', 'หอม', 'ใส', 'ใจดี']
const SIRES = ['เจ้าขุน', 'ทองแท้', 'ภูผา', 'สิงห์ทอง', 'มหาสมุทร', 'ขุนแผน', 'พายุ', 'ราชันย์']
const DAMS = ['มณีจันทร์', 'นวลจันทร์', 'ดาวเรือง', 'ไข่มุก', 'ส้มโอ', 'จันทร์เจ้า', 'น้ำค้าง', 'พิกุล']
/** The kitten vaccine course from the brochure's guide: 8, 12 and 16 weeks */
const VACCINES: [days: number, name: string][] = [
  [56, 'วัคซีนรวม (ไข้หัดแมว หวัดแมว) เข็มที่ 1'],
  [84, 'วัคซีนรวมเข็มที่ 2'],
  [112, 'วัคซีนรวมเข็มสุดท้าย และพิษสุนัขบ้าเข็มแรก'],
]

/** A kitten for a breed and grade, 9–16 weeks old, with a record that follows the breed's real health data */
export function makeKitten(catalog: Catalog, p: Product, r: Rng, now: Date, used: Set<string>): KittenFields {
  const breed = breedOf(catalog, p.refId ?? '')
  const colors = breed?.coat?.colors?.length ? breed.coat.colors : ['ไม่ระบุ']
  const today = dayKey(now)
  const ageDays = r.int(9 * 7, 16 * 7)
  const birthDate = addDays(today, -ageDays)
  const free = KITTEN_NAMES.filter((n) => !used.has(n))
  let name = free.length ? r.pick(free) : ''
  // Pool used up: a plain name with a word after it, still without numbers
  for (const suffix of NAME_SUFFIXES) {
    if (name) break
    const left = KITTEN_NAMES.map((n) => n + suffix).filter((n) => !used.has(n))
    if (left.length) name = r.pick(left)
  }
  if (!name) throw new Error('ชื่อลูกแมวในรายการไม่พอ')
  used.add(name)
  const show = p.variant === 'เกรดประกวด'
  return {
    name,
    sex: r.chance(0.5) ? 'male' : 'female',
    color: r.pick(colors),
    birthDate,
    microchip: true,
    vaccines: VACCINES.filter(([d]) => d <= ageDays).map(([d, n]) => ({ name: n, date: addDays(birthDate, d) })),
    vetCheckAt: addDays(today, -r.int(1, 10)),
    // Show-grade kittens come from tested parents; a few pet-grade litters weren't tested
    geneticTests: dnaTests(breed).map((t) => ({ name: t, result: (show || r.chance(0.85) ? 'negative' : 'not-tested') as GeneticResult })),
    sire: `${r.pick(SIRES)} (${r.pick(colors)})`,
    dam: `${r.pick(DAMS)} (${r.pick(colors)})`,
    photoIndex: r.int(0, 3),
    price: null,
    note: null,
  }
}

// ---------- Views ----------

export function publicKitten(db: Db, catalog: Catalog, u: KittenUnit, now: Date) {
  const p = getProduct(db, u.productId)
  const breed = breedOf(catalog, u.refId)
  return {
    id: u.id,
    code: u.code,
    productId: u.productId,
    refId: u.refId,
    breedName: breed?.nameTh ?? p.name,
    grade: u.grade,
    name: u.name,
    sex: u.sex,
    color: u.color,
    birthDate: u.birthDate,
    ageWeeks: ageWeeks(u.birthDate, now),
    microchip: u.microchip,
    vaccines: u.vaccines,
    vetCheckAt: u.vetCheckAt,
    geneticTests: u.geneticTests,
    sire: u.sire,
    dam: u.dam,
    photoIndex: u.photoIndex,
    image: p.image,
    price: unitPrice(db, u),
    deposit: depositFor(unitPrice(db, u)),
    status: u.status === 'withdrawn' ? 'sold' : u.status,
  }
}

const findUnit = (db: Db, id: string) => {
  const u = db.kittens.find((x) => x.id === id || x.code === id)
  if (!u) throw new HttpError(404, 'ไม่พบลูกแมวตัวนี้', 'NOT_FOUND', 'Kitten not found.')
  return u
}

export const findReservation = (db: Db, id: string) => {
  const r = db.reservations.find((x) => x.id === id || x.no === id)
  if (!r) throw new HttpError(404, 'ไม่พบการจองนี้', 'NOT_FOUND', 'Reservation not found.')
  return r
}

/** Status as of now, before housekeeping has caught up with a lapsed hold */
const statusNow = (r: Reservation, now: Date): ReservationStatus =>
  (r.status === 'pending-payment' || r.status === 'held') && r.holdUntil <= now.toISOString() ? 'expired' : r.status

function publicReservation(db: Db, catalog: Catalog, r: Reservation, now: Date) {
  const { token: _token, leadId: _leadId, ...rest } = r
  const unit = db.kittens.find((u) => u.id === r.unitId)
  return {
    ...rest,
    status: statusNow(r, now),
    kitten: unit ? publicKitten(db, catalog, unit, now) : null,
    // Simulated PromptPay: the reference is the reservation number; no money moves
    payment: { promptpayRef: r.no, amount: r.deposit.amount, simulated: true },
    store: publicStore(db),
  }
}

// ---------- Reservations ----------

export function createReservation(db: Db, body: any, now: Date): Reservation {
  const unit = findUnit(db, String(body?.unitId ?? ''))
  if (unit.status !== 'available') throw new HttpError(409, `น้อง${unit.name}ถูกจองหรือมีเจ้าของแล้ว`, 'UNIT_UNAVAILABLE', 'This kitten has already been reserved.')
  const person = personOf(body)
  const pickup = body?.pickup === 'delivery' ? 'delivery' : 'store'
  const address = text(body?.address, 'ที่อยู่จัดส่ง', { required: pickup === 'delivery', max: 300, en: 'a delivery address', key: 'address' })
  const note = text(body?.note, 'หมายเหตุ', { required: false, max: 500, en: 'a note', key: 'note' })
  const lang = langOf(body?.lang)
  const at = now.toISOString()
  const no = nextNo(db, 'RS', now)
  const price = unitPrice(db, unit)
  const p = getProduct(db, unit.productId)
  const lead = createLead(
    db,
    {
      kind: 'reservation',
      ...person,
      message: `จอง${p.name} น้อง${unit.name} (${unit.code}) ${pickup === 'delivery' ? 'จัดส่ง' : 'รับที่ร้าน'}${note ? ` | ${note}` : ''}`,
      refIds: [unit.refId],
      page: `/reserve/${unit.id}`,
      lang,
    },
    now,
  )
  const r: Reservation = {
    id: nextId(db, 'rs'),
    no,
    token: newToken(),
    unitId: unit.id,
    productId: unit.productId,
    createdAt: at,
    updatedAt: at,
    holdUntil: new Date(now.getTime() + UNPAID_HOLD_MS).toISOString(),
    deposit: { amount: depositFor(price), method: null, reference: null, paidAt: null },
    customer: { name: person.name, phone: person.phone, email: person.email, lineId: person.lineId, address },
    pickup,
    note,
    lang,
    status: 'pending-payment',
    leadId: lead.id,
    orderNo: null,
    cancelReason: null,
  }
  reserveUnit(db, unit, no, now, null)
  db.reservations.push(r)
  lead.linked.reservationNo = no
  log(db, 'sale', null, `จองน้อง${unit.name} (${unit.code}) ${no} รอชำระมัดจำ ${r.deposit.amount.toLocaleString('th-TH')} บาท (${person.name})`, no, now)
  return r
}

/** The deposit arrives (simulated PromptPay or transfer): the hold becomes 48 hours from now. */
export function payReservation(db: Db, r: Reservation, method: unknown, now: Date, staff: Staff | null = null): Reservation {
  if (method !== 'promptpay' && method !== 'transfer') throw new HttpError(400, 'เลือกวิธีชำระมัดจำ', 'VALIDATION', 'Choose how to pay the deposit.')
  const status = statusNow(r, now)
  if (status === 'held') return r
  if (status !== 'pending-payment') throw new HttpError(409, 'การจองนี้หมดเวลาชำระมัดจำหรือถูกยกเลิกแล้ว', 'EXPIRED', 'This reservation has expired or was cancelled.')
  r.deposit = { ...r.deposit, method, paidAt: now.toISOString(), reference: `${method === 'promptpay' ? 'PP' : 'TR'}${Math.random().toString(36).slice(2, 8).toUpperCase()}` }
  r.status = 'held'
  r.holdUntil = new Date(now.getTime() + PAID_HOLD_MS).toISOString()
  r.updatedAt = now.toISOString()
  const lead = r.leadId ? db.leads.find((l) => l.id === r.leadId) : undefined
  if (lead && (lead.status === 'new' || lead.status === 'contacted')) {
    lead.status = 'scheduled'
    lead.updatedAt = now.toISOString()
  }
  log(db, 'sale', staff, `รับมัดจำ ${r.no} ${r.deposit.amount.toLocaleString('th-TH')} บาท (${method === 'promptpay' ? 'พร้อมเพย์' : 'โอนเงิน'})`, r.no, now)
  return r
}

export function cancelReservation(db: Db, staff: Staff | null, r: Reservation, reason: string, now: Date): Reservation {
  if (r.status !== 'pending-payment' && r.status !== 'held') throw new HttpError(409, 'การจองนี้จบไปแล้ว')
  r.status = 'cancelled'
  r.cancelReason = reason
  r.updatedAt = now.toISOString()
  const unit = db.kittens.find((u) => u.id === r.unitId)
  if (unit) releaseUnit(db, unit, now, staff, `ยกเลิกการจอง ${r.no}`)
  const lead = r.leadId ? db.leads.find((l) => l.id === r.leadId) : undefined
  if (lead && lead.status !== 'won') {
    lead.status = 'lost'
    lead.updatedAt = now.toISOString()
  }
  log(db, 'sale', staff, `ยกเลิกการจอง ${r.no}: ${reason}${r.deposit.paidAt ? ` (คืนมัดจำ ${r.deposit.amount.toLocaleString('th-TH')} บาท)` : ''}`, r.no, now)
  return r
}

/** Cart lines that ring the reserved kitten up at the till; checkout takes the deposit off. */
export function reservationToCart(db: Db, id: string, now: Date) {
  const r = findReservation(db, id)
  const status = statusNow(r, now)
  if (status !== 'held') throw new HttpError(409, status === 'pending-payment' ? 'การจองนี้ยังไม่ได้ชำระมัดจำ' : 'การจองนี้ไม่อยู่ในสถานะรอรับลูกแมว')
  const digits = (s: string) => s.replace(/\D/g, '')
  const customer = db.customers.find((c) => r.customer.phone && digits(c.phone) === digits(r.customer.phone)) ?? null
  return { reservationNo: r.no, lines: [{ productId: r.productId, qty: 1, unitId: r.unitId }], depositApplied: r.deposit.amount, customer }
}

// ---------- Kitten records (admin) ----------

const SEXES: Sex[] = ['male', 'female']
const RESULTS: GeneticResult[] = ['negative', 'carrier', 'not-tested']
const isDay = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)

/** Validated kitten fields from the admin form; `base` fills what a PATCH leaves out. */
function kittenFields(body: any, now: Date, base?: KittenUnit): KittenFields {
  const pick = <K extends keyof KittenFields>(k: K): unknown => (body?.[k] !== undefined ? body[k] : base?.[k])
  const sex = pick('sex')
  if (!SEXES.includes(sex as Sex)) throw new HttpError(400, 'เลือกเพศของลูกแมว')
  const birthDate = pick('birthDate')
  if (!isDay(birthDate) || birthDate > dayKey(now)) throw new HttpError(400, 'วันเกิดไม่ถูกต้อง')
  const vaccines = pick('vaccines') ?? []
  if (!Array.isArray(vaccines) || vaccines.some((v) => !v || typeof v.name !== 'string' || !v.name.trim() || !isDay(v.date))) {
    throw new HttpError(400, 'ประวัติวัคซีนต้องมีชื่อวัคซีนและวันที่')
  }
  const tests = pick('geneticTests') ?? []
  if (!Array.isArray(tests) || tests.some((t) => !t || typeof t.name !== 'string' || !RESULTS.includes(t.result))) {
    throw new HttpError(400, 'ผลตรวจพันธุกรรมไม่ถูกต้อง')
  }
  const vet = pick('vetCheckAt')
  if (vet !== null && vet !== undefined && vet !== '' && !isDay(vet)) throw new HttpError(400, 'วันตรวจสุขภาพไม่ถูกต้อง')
  const price = pick('price')
  if (price !== null && price !== undefined && price !== '' && !(Number(price) > 0)) throw new HttpError(400, 'ราคาต้องมากกว่า 0')
  const photoIndex = Number(pick('photoIndex') ?? 0)
  return {
    name: text(pick('name'), 'ชื่อลูกแมว', { max: 40 })!,
    sex: sex as Sex,
    color: text(pick('color'), 'สี', { max: 80 })!,
    birthDate,
    microchip: Boolean(pick('microchip')),
    vaccines: vaccines.map((v: any) => ({ name: v.name.trim().slice(0, 120), date: v.date })),
    vetCheckAt: vet ? (vet as string) : null,
    geneticTests: tests.map((t: any) => ({ name: t.name.trim().slice(0, 160), result: t.result })),
    sire: text(pick('sire'), 'พ่อพันธุ์', { required: false, max: 80 }) ?? '',
    dam: text(pick('dam'), 'แม่พันธุ์', { required: false, max: 80 }) ?? '',
    photoIndex: Number.isInteger(photoIndex) && photoIndex >= 0 && photoIndex < 10 ? photoIndex : 0,
    price: price === null || price === undefined || price === '' ? null : money(Number(price)),
    note: text(pick('note'), 'หมายเหตุ', { required: false, max: 300 }),
  }
}

function updateKitten(db: Db, staff: Staff, id: string, body: any, now: Date): KittenUnit {
  const u = findUnit(db, id)
  if (u.status === 'sold') throw new HttpError(409, 'ลูกแมวตัวนี้มีเจ้าของแล้ว แก้ไขประวัติไม่ได้')
  if ((body?.price !== undefined && body.price !== u.price) || body?.status !== undefined) requireManager(staff)
  if (body?.status !== undefined) {
    if (body.status !== 'withdrawn' && body.status !== 'available') throw new HttpError(400, 'สถานะลูกแมวไม่ถูกต้อง')
    if (u.status === 'reserved') throw new HttpError(409, 'ลูกแมวตัวนี้ติดจองอยู่ ยกเลิกการจองก่อน')
    setUnitWithdrawn(db, u, body.status === 'withdrawn', now, staff, text(body.reason, 'เหตุผล', { required: false, max: 200 }) ?? (body.status === 'withdrawn' ? 'ถอนออกจากการขาย' : 'กลับมาเปิดขาย'))
  }
  Object.assign(u, kittenFields(body, now, u), { updatedAt: now.toISOString() })
  log(db, 'product', staff, `แก้ไขประวัติลูกแมว ${u.name} (${u.code})`, u.code, now)
  return u
}

// ---------- Routes ----------

export function registerExtras() {
  publicRoute('GET', '/api/public/kittens', ({ store, catalog, query, now }) => {
    const db = store.get()
    const breed = query.get('breed')
    const sex = query.get('sex')
    return db.kittens
      .filter((u) => (u.status === 'available' || u.status === 'reserved') && (!breed || u.refId === breed) && (!sex || u.sex === sex))
      .sort((a, b) => (a.status === b.status ? a.birthDate.localeCompare(b.birthDate) : a.status === 'available' ? -1 : 1))
      .map((u) => publicKitten(db, catalog, u, now))
  })

  publicRoute('GET', '/api/public/kittens/:id', ({ store, catalog, params, now }) => {
    const db = store.get()
    const u = findUnit(db, params.id)
    if (u.status === 'withdrawn') throw new HttpError(404, 'ไม่พบลูกแมวตัวนี้', 'NOT_FOUND', 'Kitten not found.')
    return publicKitten(db, catalog, u, now)
  })

  publicRoute('POST', '/api/public/reservations', ({ store, catalog, body, now }) => {
    publicForm(body)
    return store.write((db) => {
      const r = createReservation(db, body, now)
      return { ...publicReservation(db, catalog, r, now), token: r.token }
    })
  })

  const own = (db: Db, no: string, t: string | null) => {
    const r = db.reservations.find((x) => x.no === no)
    if (!r || !t || t !== r.token) throw new HttpError(404, 'ไม่พบการจองนี้', 'NOT_FOUND', 'Reservation not found.')
    return r
  }

  publicRoute('GET', '/api/public/reservations/:no', ({ store, catalog, params, query, now }) => {
    const db = store.get()
    return publicReservation(db, catalog, own(db, params.no, query.get('t')), now)
  })

  publicRoute('POST', '/api/public/reservations/:no/pay', ({ store, catalog, params, body, now }) => {
    publicForm(body, { consent: false })
    return store.write((db) => publicReservation(db, catalog, payReservation(db, own(db, params.no, body?.t ?? null), body?.method, now), now))
  })

  route('GET', '/api/kittens', ({ store, query, now }) => {
    const db = store.get()
    const status = query.get('status')
    const breed = query.get('breed')
    return {
      rows: db.kittens
        .filter((u) => (!status || u.status === status) && (!breed || u.refId === breed))
        .sort((a, b) => a.refId.localeCompare(b.refId) || a.birthDate.localeCompare(b.birthDate))
        .map((u) => ({ ...u, productName: getProduct(db, u.productId).name, effectivePrice: unitPrice(db, u), ageWeeks: ageWeeks(u.birthDate, now) })),
    }
  })

  route('GET', '/api/kittens/:id', ({ store, params, now }) => {
    const db = store.get()
    const u = findUnit(db, params.id)
    return {
      kitten: { ...u, productName: getProduct(db, u.productId).name, effectivePrice: unitPrice(db, u), ageWeeks: ageWeeks(u.birthDate, now) },
      reservations: db.reservations.filter((r) => r.unitId === u.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    }
  })

  route('POST', '/api/kittens', ({ store, body, staff, now }) => {
    requireManager(staff)
    return store.write((db) => {
      const p = getProduct(db, String(body?.productId ?? ''))
      if (!p.unitTracked) throw new HttpError(400, `${p.name} ไม่ได้ขายเป็นรายตัว`)
      const u = addUnit(db, p, kittenFields(body, now), now, staff, null)
      log(db, 'stock', staff, `รับลูกแมวใหม่ ${u.name} (${u.code}) ${p.name}`, u.code, now)
      return u
    })
  })

  route('PATCH', '/api/kittens/:id', ({ store, params, body, staff, now }) => store.write((db) => updateKitten(db, staff, params.id, body ?? {}, now)))

  route('GET', '/api/reservations', ({ store, query, now }) => {
    const db = store.get()
    const status = query.get('status')
    return {
      rows: db.reservations
        .map((r) => ({ ...r, status: statusNow(r, now), kitten: db.kittens.find((u) => u.id === r.unitId) ?? null }))
        .filter((r) => !status || r.status === status)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    }
  })

  route('GET', '/api/reservations/:id', ({ store, params, now }) => {
    const db = store.get()
    const r = findReservation(db, params.id)
    return {
      reservation: { ...r, status: statusNow(r, now) },
      kitten: db.kittens.find((u) => u.id === r.unitId) ?? null,
      lead: r.leadId ? (db.leads.find((l) => l.id === r.leadId) ?? null) : null,
      publicPath: `/reservation/${r.no}?t=${r.token}`,
    }
  })

  route('PATCH', '/api/reservations/:id', ({ store, params, body, staff, now }) =>
    store.write((db) => {
      const r = findReservation(db, params.id)
      const action = body?.action
      if (action === 'cancel') return cancelReservation(db, staff, r, text(body.reason, 'เหตุผลที่ยกเลิก', { max: 200 })!, now)
      if (action === 'mark-paid') return payReservation(db, r, body.method ?? 'transfer', now, staff)
      if (action === 'extend') {
        if (statusNow(r, now) !== 'held') throw new HttpError(409, 'ขยายเวลาได้เฉพาะการจองที่ชำระมัดจำแล้ว')
        r.holdUntil = new Date(new Date(r.holdUntil).getTime() + 24 * 3_600_000).toISOString()
        r.updatedAt = now.toISOString()
        log(db, 'sale', staff, `ขยายเวลาจอง ${r.no} ถึง ${new Date(r.holdUntil).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`, r.no, now)
        return r
      }
      throw new HttpError(400, 'เลือกการดำเนินการ: cancel, mark-paid หรือ extend')
    }),
  )

  route('POST', '/api/reservations/:id/to-cart', ({ store, params, now }) => reservationToCart(store.get(), params.id, now))
}

// ---------- Seed ----------

/**
 * Kittens for every kitten on the shelf after the simulated history (stock and records agree), then two
 * reservations: one waiting for its deposit, one paid and waiting to be collected.
 */
export function seedExtras(db: Db, catalog: Catalog, r: Rng, now: Date) {
  const used = new Set<string>()
  for (const p of db.products.filter((x) => x.categoryId === 'kitten')) {
    p.unitTracked = true
    for (let i = 0; i < p.stock; i++) newUnitRecord(db, p, makeKitten(catalog, p, r, now, used), now)
  }
  const available = () => db.kittens.filter((u) => u.status === 'available')
  const people = db.customers.filter((c) => c.kind === 'person')
  const first = available()[r.int(0, Math.max(0, available().length - 1))]
  if (first && people[0]) {
    const at = new Date(now.getTime() - 30 * 60_000)
    createReservation(db, { unitId: first.id, name: people[0].name, phone: people[0].phone, email: people[0].email, pickup: 'store' }, at)
  }
  const second = available().find((u) => u.productId !== first?.productId)
  if (second && people[1]) {
    const at = new Date(now.getTime() - 20 * 3_600_000)
    const res = createReservation(db, { unitId: second.id, name: people[1].name, phone: people[1].phone, email: people[1].email, pickup: 'delivery', address: '55/12 ถนนประดิพัทธ์ แขวงพญาไท เขตพญาไท กรุงเทพฯ 10400' }, at)
    payReservation(db, res, 'promptpay', new Date(at.getTime() + 15 * 60_000))
  }
}

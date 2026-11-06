// @vitest-environment node
// Maew's kittens and reservations: records agree with stock, holds lapse, deposits come off the bill,
// refunds put a kitten back on sale.
import { mkdtempSync } from 'node:fs'
import { createServer, type Server } from 'node:http'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { createApi } from './api.ts'
import { loadCatalog } from './catalog.ts'
import { crmCounts, housekeepDb } from './crm.ts'
import { cancelReservation, createReservation, depositFor, dnaTests, makeKitten, payReservation, reservationToCart } from './extras.ts'
import { addUnit, checkout, quote, receiveStock, refund, salesReport, setUnitWithdrawn } from './logic.ts'
import { seed } from './seed.ts'
import type { Db, Product, Staff } from './types.ts'
import { bkkTime, rng } from './util.ts'

const root = resolve(import.meta.dirname, '..')
const catalog = loadCatalog(root)
const NOW = bkkTime('2026-11-06', 15, 30)
const later = (min: number) => new Date(NOW.getTime() + min * 60_000)
const buyer = { name: 'คุณผู้จอง', phone: '081-234-5678', email: 'buyer@example.com', pickup: 'store' }

let db: Db
let staff: Staff
let manager: Staff
const kittenProducts = () => db.products.filter((p) => p.categoryId === 'kitten')
const available = (p: Product) => db.kittens.filter((u) => u.productId === p.id && u.status === 'available')
const stockedKitten = () => kittenProducts().find((p) => available(p).length >= 2)!

beforeEach(() => {
  db = seed(catalog, NOW)
  staff = db.staff.find((s) => s.role === 'staff')!
  manager = db.staff.find((s) => s.role === 'manager')!
})

/** Stock of every kitten product = its available records */
const inSync = () => kittenProducts().every((p) => p.stock === available(p).length)

describe('kitten records', () => {
  it('match the stock of every kitten product after seeding', () => {
    expect(kittenProducts().every((p) => p.unitTracked)).toBe(true)
    expect(db.kittens.length).toBeGreaterThan(5)
    expect(inSync()).toBe(true)
    expect(new Set(db.kittens.map((u) => u.code)).size).toBe(db.kittens.length)
  })

  it('have plain, unique names (no numbers)', () => {
    expect(new Set(db.kittens.map((u) => u.name)).size).toBe(db.kittens.length)
    expect(db.kittens.every((u) => !/\d/.test(u.name))).toBe(true)
  })

  it('are 9–16 weeks old with vaccines by age, parents and the breed\'s own DNA tests', () => {
    for (const u of db.kittens) {
      const weeks = (NOW.getTime() - new Date(`${u.birthDate}T00:00:00+07:00`).getTime()) / (7 * 86_400_000)
      expect(weeks).toBeGreaterThanOrEqual(9)
      expect(weeks).toBeLessThan(17)
      expect(u.vaccines.length).toBeGreaterThanOrEqual(1)
      expect(u.vaccines.every((v) => v.date <= '2026-11-06')).toBe(true)
      expect(u.sire && u.dam).toBeTruthy()
      const breed = catalog.records.get(u.refId)
      expect(u.geneticTests.map((t) => t.name)).toEqual(dnaTests(breed as never))
      expect((breed as unknown as { coat: { colors: string[] } }).coat.colors).toContain(u.color)
    }
  })

  it('come in one at a time: bulk receiving and counting are refused for kittens', () => {
    const p = stockedKitten()
    expect(() => receiveStock(db, manager, p.id, 2, null, NOW)).toThrow(/รายตัว/)
    const before = p.stock
    const u = addUnit(db, p, makeKitten(catalog, p, rng(1), NOW, new Set()), NOW, manager, null)
    expect(u.code).toMatch(/^K-[A-Z]+-\d{4}$/)
    expect(p.stock).toBe(before + 1)
    setUnitWithdrawn(db, u, true, NOW, manager, 'ย้ายไปสาขาอื่น')
    expect(p.stock).toBe(before)
    expect(inSync()).toBe(true)
  })
})

describe('selling kittens', () => {
  it('sells the kitten asked for, or the oldest one, and a refund puts it back on sale', () => {
    const p = stockedKitten()
    const [oldest, other] = available(p).sort((a, b) => a.birthDate.localeCompare(b.birthDate))
    const chosen = checkout(db, staff, { lines: [{ productId: p.id, qty: 1, unitId: other.id }], payment: { method: 'card' } }, later(1))
    expect(chosen.lines[0].unitIds).toEqual([other.id])
    expect(other).toMatchObject({ status: 'sold', orderNo: chosen.no })
    if (available(p).length) {
      const auto = checkout(db, staff, { lines: [{ productId: p.id, qty: 1 }], payment: { method: 'card' } }, later(2))
      expect(auto.lines[0].unitIds).toEqual([oldest.id])
    }
    refund(db, staff, manager, chosen.id, 'ลูกค้าเปลี่ยนใจ', later(3))
    expect(other).toMatchObject({ status: 'available', orderNo: null })
    expect(inSync()).toBe(true)
  })
})

describe('pricing kitten by kitten', () => {
  it('charges each named kitten its own price, qty = kittens, margins on the product cost', () => {
    const p = stockedKitten()
    const [u1, u2] = available(p)
    u1.price = p.price + 5000
    const q = quote(db, { lines: [{ productId: p.id, qty: 2, unitIds: [u1.id, u2.id] }] })
    expect(q.lines[0]).toMatchObject({ qty: 2, unitIds: [u1.id, u2.id], unitCost: p.cost, total: 2 * p.price + 5000 })
    expect(q.subtotal).toBe(2 * p.price + 5000)
    // qty may be left out; it then comes from the kittens named
    expect(quote(db, { lines: [{ productId: p.id, unitIds: [u1.code] } as never] }).lines[0]).toMatchObject({ qty: 1, total: p.price + 5000, unitIds: [u1.id] })
    expect(() => quote(db, { lines: [{ productId: p.id, qty: 1, unitIds: [u1.id, u2.id] }] })).toThrow(/ไม่ตรง/)
    expect(() => quote(db, { lines: [{ productId: p.id, qty: 1, unitIds: [u1.id] }, { productId: p.id, qty: 1, unitId: u1.id }] })).toThrow(/ซ้ำ/)

    const order = checkout(db, staff, { lines: [{ productId: p.id, qty: 2, unitIds: [u1.id, u2.id] }], payment: { method: 'card' } }, later(1))
    expect(order.total).toBe(2 * p.price + 5000)
    expect([u1.status, u2.status]).toEqual(['sold', 'sold'])
    const row = salesReport(db, '2026-11-06', '2026-11-06').byProduct.find((x) => x.productId === p.id)!
    expect(row.cost).toBeGreaterThanOrEqual(2 * p.cost)
    expect(inSync()).toBe(true)
  })

  it('prices a line that names no kitten at the price of the oldest one it takes', () => {
    const p = stockedKitten()
    const oldest = [...available(p)].sort((a, b) => a.birthDate.localeCompare(b.birthDate) || a.code.localeCompare(b.code))[0]
    oldest.price = p.price - 1000
    const q = quote(db, { lines: [{ productId: p.id, qty: 1 }] })
    expect(q.lines[0]).toMatchObject({ unitIds: [oldest.id], total: p.price - 1000, unitPrice: p.price - 1000 })
    const order = checkout(db, staff, { lines: [{ productId: p.id, qty: 1 }], payment: { method: 'card' } }, later(1))
    expect(order.lines[0].unitIds).toEqual([oldest.id])
    expect(order.total).toBe(p.price - 1000)
  })
})

describe('reservations', () => {
  it('hold a kitten for 2 hours, then 48 hours once the deposit is paid', () => {
    const p = stockedKitten()
    const u = available(p)[0]
    const stock = p.stock
    const r = createReservation(db, { unitId: u.id, ...buyer }, NOW)
    expect(r.no).toMatch(/^RS691106-\d{4}$/)
    expect(r.deposit.amount).toBe(depositFor(p.price))
    expect(u.status).toBe('reserved')
    expect(p.stock).toBe(stock - 1)
    expect(() => createReservation(db, { unitId: u.id, ...buyer }, NOW)).toThrow()
    expect(new Date(r.holdUntil).getTime() - NOW.getTime()).toBe(2 * 3_600_000)
    payReservation(db, r, 'promptpay', later(30))
    expect(r.status).toBe('held')
    expect(new Date(r.holdUntil).getTime() - later(30).getTime()).toBe(48 * 3_600_000)
    expect(db.leads.find((l) => l.id === r.leadId)).toMatchObject({ kind: 'reservation', status: 'scheduled' })
    expect(inSync()).toBe(true)
  })

  it('lapse when unpaid in time, putting the kitten back', () => {
    const p = stockedKitten()
    const u = available(p)[0]
    const r = createReservation(db, { unitId: u.id, ...buyer }, NOW)
    housekeepDb(db, later(121))
    expect(r.status).toBe('expired')
    expect(u.status).toBe('available')
    expect(() => payReservation(db, r, 'promptpay', later(122))).toThrow()
    expect(inSync()).toBe(true)
  })

  it('take the deposit off the bill when the kitten is collected', () => {
    const p = stockedKitten()
    const u = available(p)[0]
    const r = createReservation(db, { unitId: u.id, ...buyer }, NOW)
    expect(() => reservationToCart(db, r.id, NOW)).toThrow()
    payReservation(db, r, 'transfer', later(5))
    const cart = reservationToCart(db, r.id, later(60))
    const order = checkout(db, staff, { lines: cart.lines, reservationNo: cart.reservationNo, payment: { method: 'cash', tendered: p.price } }, later(60))
    expect(order.depositApplied).toBe(r.deposit.amount)
    expect(order.payment.amount).toBe(order.total - r.deposit.amount)
    expect(order.payment.change).toBe(r.deposit.amount)
    expect(u).toMatchObject({ status: 'sold', orderNo: order.no })
    expect(r).toMatchObject({ status: 'completed', orderNo: order.no })
    expect(db.leads.find((l) => l.id === r.leadId)!.status).toBe('won')
    expect(inSync()).toBe(true)
  })

  it('price the reserved kitten at the till even when it is the last one, with the deposit shown', () => {
    const p = stockedKitten()
    const [last, ...rest] = available(p)
    for (const u of rest) setUnitWithdrawn(db, u, true, NOW, manager, 'ทดสอบ')
    const r = createReservation(db, { unitId: last.id, ...buyer }, NOW)
    expect(p.stock).toBe(0)
    expect(() => quote(db, { lines: [{ productId: p.id, qty: 1 }], reservationNo: r.no })).toThrow(/มัดจำ/)
    payReservation(db, r, 'promptpay', later(5))

    expect(() => quote(db, { lines: [{ productId: p.id, qty: 1 }] })).toThrow(/ไม่พอ/)
    expect(() => quote(db, { lines: [{ productId: p.id, qty: 1, unitIds: [last.id] }] })).toThrow(/ไม่พร้อมขาย/)
    const q = quote(db, { lines: [{ productId: p.id, qty: 1 }], reservationNo: r.no })
    expect(q).toMatchObject({ reservationNo: r.no, depositApplied: r.deposit.amount, amountDue: q.total - r.deposit.amount })
    expect(q.lines[0].unitIds).toEqual([last.id])
    expect(quote(db, { lines: [{ productId: p.id, qty: 1, unitIds: [last.id] }], reservationNo: r.no }).total).toBe(q.total)
    expect(() => quote(db, { lines: [{ productId: 'food-kitten-1500', qty: 1 }], reservationNo: r.no })).toThrow(/ตัวที่จองไว้/)

    const order = checkout(db, staff, { lines: [{ productId: p.id, qty: 1, unitIds: [last.id] }], reservationNo: r.no, payment: { method: 'transfer' } }, later(30))
    expect(order.payment.amount).toBe(q.amountDue)
    expect(order).toMatchObject({ depositApplied: r.deposit.amount, reservationNo: r.no })
    expect(last.status).toBe('sold')
    expect(p.stock).toBe(0)
    expect(inSync()).toBe(true)
  })

  it('are cancelled by staff with the kitten released', () => {
    const p = stockedKitten()
    const u = available(p)[0]
    const r = createReservation(db, { unitId: u.id, ...buyer, pickup: 'delivery', address: '1 ถนนสุขุมวิท' }, NOW)
    cancelReservation(db, staff, r, 'ลูกค้าขอยกเลิก', later(10))
    expect(r.status).toBe('cancelled')
    expect(u.status).toBe('available')
    expect(inSync()).toBe(true)
    expect(() => createReservation(db, { unitId: available(p)[0].id, ...buyer, pickup: 'delivery' }, NOW)).toThrow()
  })

  it('seeds one reservation awaiting its deposit and one paid', () => {
    expect(db.reservations.map((r) => r.status).sort()).toEqual(['held', 'pending-payment'])
    expect(crmCounts(db, NOW).reservationsHeld).toBe(2)
  })
})

describe('public kittens and reservations over HTTP', () => {
  let server: Server
  let base = ''
  const call = async (method: string, path: string, body?: unknown, token?: string) => {
    const r = await fetch(base + path, {
      method,
      headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    })
    return { status: r.status, data: (await r.json()) as any }
  }

  beforeAll(async () => {
    const api = createApi(root, join(mkdtempSync(join(tmpdir(), 'pos-maew-')), 'db.json'), { rateLimit: 100 })
    server = createServer((req, res) => {
      api.handle(req, res).then((h) => {
        if (!h) res.writeHead(404).end()
      })
    })
    await new Promise<void>((ok) => server.listen(0, ok))
    base = `http://localhost:${(server.address() as { port: number }).port}`
  })

  afterAll(() => new Promise<void>((ok) => server.close(() => ok())))

  it('lists kittens, reserves one, pays the deposit and shows the hold to its owner only', async () => {
    const kittens = (await call('GET', '/api/public/kittens')).data
    const kitten = kittens.find((k: any) => k.status === 'available')
    expect(kitten).toMatchObject({ breedName: expect.any(String), deposit: expect.any(Number) })
    expect(kitten.ageWeeks).toBeGreaterThanOrEqual(9)

    const noConsent = await call('POST', '/api/public/reservations', { unitId: kitten.id, ...buyer })
    expect(noConsent.data.code).toBe('CONSENT_REQUIRED')
    const made = await call('POST', '/api/public/reservations', { unitId: kitten.id, ...buyer, consent: true })
    expect(made.status).toBe(200)
    expect(made.data).toMatchObject({ status: 'pending-payment', payment: { simulated: true } })
    const { no, token } = made.data

    expect((await call('GET', `/api/public/reservations/${no}?t=wrong`)).status).toBe(404)
    const paid = await call('POST', `/api/public/reservations/${no}/pay`, { t: token, method: 'promptpay' })
    expect(paid.data.status).toBe('held')
    expect((await call('GET', `/api/public/kittens/${kitten.id}`)).data.status).toBe('reserved')
    const again = await call('POST', '/api/public/reservations', { unitId: kitten.id, ...buyer, consent: true })
    expect(again).toMatchObject({ status: 409, data: { code: 'UNIT_UNAVAILABLE' } })

    const login = await call('POST', '/api/auth/login', { staffId: 'st-1', pin: '1111' })
    const admin = login.data.token
    const list = (await call('GET', '/api/reservations?status=held', undefined, admin)).data.rows
    expect(list.some((r: any) => r.no === no)).toBe(true)
    const cart = (await call('POST', `/api/reservations/${no}/to-cart`, {}, admin)).data
    expect(cart).toMatchObject({ reservationNo: no, lines: [{ unitId: kitten.id, qty: 1 }] })
    const priced = (await call('POST', '/api/quote', { lines: cart.lines, reservationNo: no }, admin)).data
    expect(priced).toMatchObject({ reservationNo: no, depositApplied: kitten.deposit, amountDue: kitten.price - kitten.deposit })
    expect(priced.lines[0].unitIds).toEqual([kitten.id])
    const rows = (await call('GET', '/api/kittens', undefined, admin)).data.rows
    expect(rows.length).toBeGreaterThan(5)
  })
})

import { dueOf } from './pages/Pos'
import { amountDue, cartReducer, emptyCart, estimate, qtyInCart, toCheckout, toQuote, type Cart } from './cart'
import {
  ageText,
  bookingActions,
  countdown,
  hoursSummary,
  hoursToRows,
  kittenBody,
  kittenProblems,
  lineHref,
  nextLeadSteps,
  rowsToHours,
  telHref,
  weekDays,
  weekStart,
  type KittenDraft,
} from './crm'

describe('lead and booking workflow', () => {
  it('offers the usual next step first and nothing after a lead is closed', () => {
    expect(nextLeadSteps('new', 'inquiry')[0]).toBe('contacted')
    expect(nextLeadSteps('won', 'booking')).toEqual(['closed'])
    expect(nextLeadSteps('closed', 'inquiry')).toEqual([])
    // A PDPA request is handled and closed, never "won"
    expect(nextLeadSteps('new', 'privacy')).toEqual(['contacted', 'closed'])
    expect(nextLeadSteps('closed', 'privacy')).toEqual([])
  })

  it('lets a booking move forward but not back from a final state', () => {
    expect(bookingActions('pending')).toEqual(['confirmed', 'cancelled'])
    expect(bookingActions('confirmed')).toContain('no-show')
    expect(bookingActions('done')).toEqual([])
  })

  it('builds dialable phone and LINE links', () => {
    expect(telHref('02-123 4567')).toBe('tel:021234567')
    expect(telHref('+66 81 234 5678')).toBe('tel:+66812345678')
    expect(lineHref('@maewcathouse')).toBe('https://line.me/R/ti/p/%40maewcathouse')
    expect(lineHref('somchai.k')).toBe('https://line.me/R/ti/p/~somchai.k')
  })
})

describe('time', () => {
  const now = new Date('2026-11-06T08:00:00Z')

  it('counts down a hold in hours and minutes, then days', () => {
    expect(countdown('2026-11-06T09:20:00Z', now)).toEqual({ text: 'เหลือ 1 ชม. 20 นาที', urgent: true, over: false })
    expect(countdown('2026-11-06T08:00:30Z', now).text).toBe('เหลือไม่ถึง 1 นาที')
    expect(countdown('2026-11-07T11:00:00Z', now)).toEqual({ text: 'เหลือ 1 วัน 3 ชม.', urgent: false, over: false })
    expect(countdown('2026-11-06T07:00:00Z', now)).toEqual({ text: 'หมดเวลาแล้ว', urgent: true, over: true })
  })

  it('gives a kitten age in weeks, then months', () => {
    expect(ageText('2026-08-21', now)).toBe('11 สัปดาห์')
    expect(ageText('2026-05-01', now)).toBe('6 เดือน')
    expect(ageText('2026-11-03', now)).toBe('3 วัน')
  })

  it('starts weeks on Monday', () => {
    // 6 Nov 2026 is a Friday
    expect(weekStart('2026-11-06')).toBe('2026-11-02')
    expect(weekStart('2026-11-08')).toBe('2026-11-02')
    expect(weekStart('2026-11-09')).toBe('2026-11-09')
    expect(weekDays('2026-11-02')).toEqual(['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08'])
  })
})

describe('opening hours', () => {
  it('round-trips the stored hours through the weekly editor', () => {
    const hours = [
      { day: 1, open: '10:00', close: '20:00' },
      { day: 6, open: '09:00', close: '18:00' },
    ]
    const rows = hoursToRows(hours)
    expect(rows.map((r) => r.day)).toEqual([1, 2, 3, 4, 5, 6, 0])
    expect(rows.filter((r) => r.open).map((r) => r.day)).toEqual([1, 6])
    expect(rowsToHours(rows)).toEqual({ hours, error: null })
  })

  it('refuses a close time before the open time and a week with no open day', () => {
    const rows = hoursToRows([{ day: 2, open: '10:00', close: '19:00' }]).map((r) => (r.day === 2 ? { ...r, to: '09:00' } : r))
    expect(rowsToHours(rows).error).toContain('อังคาร')
    expect(rowsToHours(hoursToRows([])).error).toBeTruthy()
  })

  it('summarises runs of equal days', () => {
    const week = [1, 2, 3, 4, 5].map((day) => ({ day, open: '10:00', close: '20:00' }))
    expect(hoursSummary([...week, { day: 6, open: '10:00', close: '18:00' }])).toBe('จันทร์–ศุกร์ 10:00–20:00, เสาร์ 10:00–18:00, อาทิตย์ ปิด')
  })
})

describe('kitten form', () => {
  const draft: KittenDraft = {
    productId: 'korat-pet',
    name: ' โมจิ ',
    sex: 'female',
    color: 'สีสวาด',
    birthDate: '2026-08-20',
    microchip: true,
    vaccines: [
      { name: 'วัคซีนรวมเข็มที่ 1', date: '2026-10-15' },
      { name: '', date: '' },
    ],
    vetCheckAt: '',
    geneticTests: [{ name: 'GM1', result: 'negative' }],
    sire: 'ขุนแผน',
    dam: '',
    price: '',
    note: '',
  }

  it('sends trimmed fields, drops empty rows and clears optional ones', () => {
    expect(kittenBody(draft)).toMatchObject({
      name: 'โมจิ',
      vaccines: [{ name: 'วัคซีนรวมเข็มที่ 1', date: '2026-10-15' }],
      vetCheckAt: null,
      price: null,
      note: null,
    })
    expect(kittenBody({ ...draft, price: '12,500' }).price).toBe(12500)
  })

  it('points at the fields the server would refuse', () => {
    expect(kittenProblems(draft, '2026-11-06')).toEqual({})
    const bad = kittenProblems({ ...draft, name: '', birthDate: '2026-12-01', price: '-5', vaccines: [{ name: 'เข็ม 1', date: '' }] }, '2026-11-06')
    expect(Object.keys(bad).sort()).toEqual(['birthDate', 'name', 'price', 'vaccines'])
  })
})

describe('kittens and reservations at the till', () => {
  const unit = (c: Cart, unitId: string, unitPrice = 3500) =>
    cartReducer(c, { type: 'addUnit', productId: 'korat-pet', unitId, unitCode: `K-KOR-${unitId}`, unitName: 'โมจิ', unitPrice })

  it('rings each kitten up as its own line, once, at its own price', () => {
    let c = unit(emptyCart, 'k1')
    c = unit(c, 'k2', 4200)
    c = unit(c, 'k2')
    expect(c.lines.map((l) => [l.unitId, l.qty, l.unitPrice, l.discount])).toEqual([
      ['k1', 1, 3500, 0],
      ['k2', 1, 4200, 0],
    ])
    // Before the server answers, the estimate uses each kitten's price, not the SKU's
    expect(estimate(c, () => 3500, 7).subtotal).toBe(7700)
    // The quote names each kitten, so the server prices and sells exactly those
    expect(toQuote(c).lines).toEqual([
      { productId: 'korat-pet', qty: 1, unitIds: ['k1'] },
      { productId: 'korat-pet', qty: 1, unitIds: ['k2'] },
    ])
    expect(qtyInCart(c, 'korat-pet')).toBe(2)
    // A kitten line never changes quantity
    expect(cartReducer(c, { type: 'qty', productId: 'korat-pet', qty: 3, max: null, unitId: 'k1' })).toBe(c)
    c = cartReducer(c, { type: 'discount', productId: 'korat-pet', unitId: 'k1', discount: 200 })
    expect(c.lines[0].discount).toBe(200)
    expect(c.lines[1].discount).toBe(0)
    c = cartReducer(c, { type: 'remove', productId: 'korat-pet', unitId: 'k1' })
    expect(c.lines.map((l) => l.unitId)).toEqual(['k2'])
  })

  it('collects a reservation: the kitten, the buyer, the reservation number and the deposit off what is due', () => {
    let c = cartReducer(emptyCart, {
      type: 'reservation',
      reservation: { no: 'RS691106-0001', deposit: 2000, unitId: 'k9' },
      line: { productId: 'korat-pet', unitId: 'k9', unitCode: 'K-KOR-0009', unitName: 'ทองหยิบ', unitPrice: 3500 },
      customerId: 'c00003',
    })
    c = cartReducer(c, { type: 'add', productId: 'food-kitten-1500', max: null })
    // The quote carries the reservation, so the server prices the held kitten and takes the deposit off
    expect(toQuote(c)).toEqual({
      lines: [{ productId: 'korat-pet', qty: 1, unitIds: ['k9'] }, { productId: 'food-kitten-1500', qty: 1 }],
      billDiscount: undefined,
      reservationNo: 'RS691106-0001',
    })
    expect(toCheckout(c, { method: 'transfer' })).toEqual({
      lines: [{ productId: 'korat-pet', qty: 1, unitIds: ['k9'] }, { productId: 'food-kitten-1500', qty: 1 }],
      billDiscount: undefined,
      customerId: 'c00003',
      payment: { method: 'transfer' },
      note: null,
      reservationNo: 'RS691106-0001',
    })
    expect(amountDue(4090, 2000)).toBe(2090)
    expect(amountDue(1500, 2000)).toBe(0)
    // Taking the reserved kitten off the bill ends the collection
    c = cartReducer(c, { type: 'remove', productId: 'korat-pet', unitId: 'k9' })
    expect(c.reservation).toBeNull()
  })
})

describe('what is due at the till', () => {
  const cart: Cart = { ...emptyCart, reservation: { no: 'RS691106-0002', deposit: 2000, unitId: 'k1' } }
  const q = { lines: [], subtotal: 4090, lineDiscount: 0, billDiscount: 0, total: 4090, vat: 267.57, beforeVat: 3822.43, vatRate: 7 }

  it("charges the server's amount due once it has priced the bill", () => {
    expect(dueOf({ ...q, reservationNo: 'RS691106-0002', depositApplied: 2000, amountDue: 2090 }, 9999, cart)).toBe(2090)
    // A bill without a reservation: the total
    expect(dueOf(q, 9999, emptyCart)).toBe(4090)
  })

  it('estimates the deposit off the on-screen total until then', () => {
    expect(dueOf(null, 4090, cart)).toBe(2090)
    expect(dueOf(null, 4090, emptyCart)).toBe(4090)
  })
})
import { cartReducer, emptyCart, estimate, itemCount, tenderOptions, toCheckout, type Cart } from './cart'
import { addDays, baht, bkkDay, change, dateTime, dayLabel, initial, isReceiptNo, signedBaht } from './format'

describe('formatting', () => {
  it('shows satang only when there are some', () => {
    expect(baht(1234)).toBe('1,234')
    expect(baht(1234.5)).toBe('1,234.50')
    expect(baht(0.1 + 0.2)).toBe('0.30')
    expect(signedBaht(20)).toBe('+20')
    expect(signedBaht(-40)).toBe('−40')
    expect(signedBaht(0)).toBe('0')
  })

  it('uses Bangkok days and the Buddhist era', () => {
    expect(bkkDay('2026-11-05T17:30:00Z')).toBe('2026-11-06')
    expect(bkkDay('2026-11-05T16:59:00Z')).toBe('2026-11-05')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(dateTime('2026-11-06T08:30:00Z')).toContain('2569')
    expect(dateTime('2026-11-06T08:30:00Z')).toContain('15:30')
    expect(dayLabel('2026-11-06', 'long')).toContain('พฤศจิกายน 2569')
  })

  it('compares against a figure only when there is one', () => {
    expect(change(120, 100)).toEqual({ pct: 20, dir: 'up' })
    expect(change(80, 100)?.dir).toBe('down')
    expect(change(50, 0)).toBeNull()
  })

  it('takes a readable initial from Thai names', () => {
    expect(initial('ปวีณา ใจดี')).toBe('ป')
    expect(initial('เอกชัย วัฒนา')).toBe('อ')
    expect(isReceiptNo('MW691106-0007')).toBe(true)
    expect(isReceiptNo('st-1')).toBe(false)
  })
})

describe('the bill at the till', () => {
  const add = (c: Cart, id: string, max: number | null = null) => cartReducer(c, { type: 'add', productId: id, max })

  it('adds, counts and never goes past the stock on hand', () => {
    let c = add(emptyCart, 'kitten', 2)
    c = add(c, 'kitten', 2)
    c = add(c, 'kitten', 2)
    c = add(c, 'food')
    expect(c.lines).toEqual([
      { productId: 'kitten', qty: 2, discount: 0 },
      { productId: 'food', qty: 1, discount: 0 },
    ])
    expect(itemCount(c)).toBe(3)
    c = cartReducer(c, { type: 'qty', productId: 'food', qty: 9, max: 5 })
    expect(c.lines[1].qty).toBe(5)
    c = cartReducer(c, { type: 'qty', productId: 'food', qty: 0, max: 5 })
    expect(c.lines[1].qty).toBe(1)
    c = cartReducer(c, { type: 'remove', productId: 'kitten' })
    expect(c.lines.map((l) => l.productId)).toEqual(['food'])
  })

  it('works out the same totals as the server', () => {
    let c = add(add(add(emptyCart, 'a'), 'a'), 'b')
    c = cartReducer(c, { type: 'discount', productId: 'a', discount: 100 })
    c = cartReducer(c, { type: 'billDiscount', value: { type: 'percent', value: 10 } })
    const prices: Record<string, number> = { a: 3500, b: 590 }
    const e = estimate(c, (id) => prices[id], 7)
    expect(e.subtotal).toBe(7590)
    expect(e.lineDiscount).toBe(100)
    expect(e.billDiscount).toBe(749)
    expect(e.total).toBe(6741)
    expect(e.vat).toBe(441)
    expect(e.beforeVat).toBe(6300)
  })

  it('sends only what the server needs', () => {
    let c = add(emptyCart, 'a')
    c = cartReducer(c, { type: 'customer', customerId: 'c00001' })
    c = cartReducer(c, { type: 'note', note: '  ฝากรับวันเสาร์ ' })
    expect(toCheckout(c, { method: 'cash', tendered: 500 })).toEqual({
      lines: [{ productId: 'a', qty: 1 }],
      billDiscount: undefined,
      customerId: 'c00001',
      payment: { method: 'cash', tendered: 500 },
      note: 'ฝากรับวันเสาร์',
    })
    expect(cartReducer(c, { type: 'clear' })).toEqual(emptyCart)
  })

  it('offers the exact amount and the next round notes as quick cash', () => {
    expect(tenderOptions(9395.5)).toEqual([9395.5, 9400, 9500, 10000, 11000])
    expect(tenderOptions(300)).toEqual([300, 500, 1000, 2000])
    expect(tenderOptions(0)).toEqual([])
  })
})

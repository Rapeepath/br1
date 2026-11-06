// The bill being rung up at the till. Pure state + maths so it can be unit-tested; the server re-prices
// everything on /api/quote and /api/orders, these figures only bridge the moment before its answer arrives.
import type { CartLineInput, CheckoutInput } from '../../server/types.ts'

export interface CartLine {
  productId: string
  qty: number
  /** Baht off the whole line */
  discount: number
  /** A kitten sold as itself: one line per kitten, qty 1 */
  unitId?: string
  /** Shown on the line and the receipt ("K-SIA-0003 น้องโมจิ") */
  unitCode?: string
  unitName?: string
  /** This kitten's own price (a kitten may be priced above or below its SKU); the server re-prices it */
  unitPrice?: number
}

export interface BillDiscount {
  type: 'amount' | 'percent'
  value: number
}

/** A paid reservation being collected: its kitten is on the bill and its deposit comes off what is due. */
export interface CartReservation {
  no: string
  deposit: number
  unitId: string
}

export interface Cart {
  lines: CartLine[]
  customerId: string | null
  billDiscount: BillDiscount
  note: string
  reservation: CartReservation | null
}

export const emptyCart: Cart = { lines: [], customerId: null, billDiscount: { type: 'amount', value: 0 }, note: '', reservation: null }

export type CartAction =
  | { type: 'add'; productId: string; max: number | null }
  | { type: 'addUnit'; productId: string; unitId: string; unitCode: string; unitName: string; unitPrice: number }
  | { type: 'qty'; productId: string; qty: number; max: number | null; unitId?: string }
  | { type: 'remove'; productId: string; unitId?: string }
  | { type: 'discount'; productId: string; discount: number; unitId?: string }
  | { type: 'customer'; customerId: string | null }
  | { type: 'billDiscount'; value: BillDiscount }
  | { type: 'note'; note: string }
  | { type: 'reservation'; reservation: CartReservation; line: { productId: string; unitId: string; unitCode: string; unitName: string; unitPrice?: number }; customerId: string | null }
  | { type: 'clear' }

const clampQty = (qty: number, max: number | null) => Math.max(1, Math.min(Math.floor(qty), max ?? Infinity))

/** The line an action is about: a kitten line by its kitten, any other line by its product. */
const same = (l: CartLine, productId: string, unitId?: string) => l.productId === productId && (l.unitId ?? undefined) === (unitId ?? undefined)

/** Stable key for React lists and labels */
export const lineKey = (l: Pick<CartLine, 'productId' | 'unitId'>) => (l.unitId ? `${l.productId}@${l.unitId}` : l.productId)

export function cartReducer(cart: Cart, action: CartAction): Cart {
  switch (action.type) {
    case 'add': {
      const found = cart.lines.find((l) => same(l, action.productId))
      if (action.max !== null && (found?.qty ?? 0) >= action.max) return cart
      if (found) {
        return { ...cart, lines: cart.lines.map((l) => (l === found ? { ...l, qty: l.qty + 1 } : l)) }
      }
      return { ...cart, lines: [...cart.lines, { productId: action.productId, qty: 1, discount: 0 }] }
    }
    case 'addUnit': {
      if (cart.lines.some((l) => l.unitId === action.unitId)) return cart
      const line: CartLine = {
        productId: action.productId,
        qty: 1,
        discount: 0,
        unitId: action.unitId,
        unitCode: action.unitCode,
        unitName: action.unitName,
        unitPrice: action.unitPrice,
      }
      return { ...cart, lines: [...cart.lines, line] }
    }
    case 'qty':
      // A kitten line is always one kitten
      if (!Number.isFinite(action.qty) || action.unitId) return cart
      return {
        ...cart,
        lines: cart.lines.map((l) => (same(l, action.productId) ? { ...l, qty: clampQty(action.qty, action.max) } : l)),
      }
    case 'remove': {
      const lines = cart.lines.filter((l) => !same(l, action.productId, action.unitId))
      // Taking the reserved kitten off the bill ends the collection; the reservation itself stays as it was
      const reservation = cart.reservation && lines.some((l) => l.unitId === cart.reservation!.unitId) ? cart.reservation : null
      return { ...cart, lines, reservation }
    }
    case 'discount':
      return {
        ...cart,
        lines: cart.lines.map((l) =>
          same(l, action.productId, action.unitId) ? { ...l, discount: Math.max(0, Number.isFinite(action.discount) ? action.discount : 0) } : l,
        ),
      }
    case 'customer':
      return { ...cart, customerId: action.customerId }
    case 'billDiscount':
      return { ...cart, billDiscount: { type: action.value.type, value: Math.max(0, Number.isFinite(action.value.value) ? action.value.value : 0) } }
    case 'note':
      return { ...cart, note: action.note }
    case 'reservation':
      // A collection starts a fresh bill: the reserved kitten, the buyer, and room to add supplies
      return {
        ...emptyCart,
        customerId: action.customerId,
        reservation: action.reservation,
        lines: [{ productId: action.line.productId, qty: 1, discount: 0, unitId: action.line.unitId, unitCode: action.line.unitCode, unitName: action.line.unitName, unitPrice: action.line.unitPrice }],
      }
    case 'clear':
      return emptyCart
  }
}

export const itemCount = (cart: Cart) => cart.lines.reduce((s, l) => s + l.qty, 0)

/** How many of a product are on the bill (kittens count one line each). */
export const qtyInCart = (cart: Cart, productId: string) => cart.lines.filter((l) => l.productId === productId).reduce((s, l) => s + l.qty, 0)

/** Kitten lines name their kitten (unitIds), so the server prices and sells exactly that one. */
export function toLines(cart: Cart): CartLineInput[] {
  return cart.lines.map((l) => ({
    productId: l.productId,
    qty: l.qty,
    ...(l.discount ? { discount: l.discount } : {}),
    ...(l.unitId ? { unitIds: [l.unitId] } : {}),
  }))
}

/** What /api/quote prices: the lines, the bill discount and a reservation being collected. */
export function toQuote(cart: Cart) {
  return {
    lines: toLines(cart),
    billDiscount: cart.billDiscount.value ? cart.billDiscount : undefined,
    ...(cart.reservation ? { reservationNo: cart.reservation.no } : {}),
  }
}

export function toCheckout(cart: Cart, payment: CheckoutInput['payment']): CheckoutInput {
  return {
    lines: toLines(cart),
    billDiscount: cart.billDiscount.value ? cart.billDiscount : undefined,
    customerId: cart.customerId,
    payment,
    note: cart.note.trim() || null,
    ...(cart.reservation ? { reservationNo: cart.reservation.no } : {}),
  }
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

/** The same sums the server makes, from the prices on screen (a kitten at its own price). */
export function estimate(cart: Cart, priceOf: (id: string) => number, vatRate: number) {
  const subtotal = round2(cart.lines.reduce((s, l) => s + (l.unitPrice ?? priceOf(l.productId)) * l.qty, 0))
  const lineDiscount = round2(cart.lines.reduce((s, l) => s + l.discount, 0))
  const afterLines = round2(subtotal - lineDiscount)
  const bd = cart.billDiscount
  const billDiscount = round2(bd.type === 'percent' ? (afterLines * Math.min(bd.value, 100)) / 100 : Math.min(bd.value, afterLines))
  const total = round2(afterLines - billDiscount)
  const vat = round2((total * vatRate) / (100 + vatRate))
  return { subtotal, lineDiscount, billDiscount, total, vat, beforeVat: round2(total - vat), vatRate }
}

/** What the customer still pays today: the bill less a deposit already paid (the estimate before the server answers). */
export const amountDue = (total: number, deposit: number) => round2(Math.max(0, total - deposit))

/** Quick-tender buttons: the exact amount, then the next round notes a customer is likely to hand over. */
export function tenderOptions(total: number): number[] {
  if (total <= 0) return []
  const out = new Set<number>([round2(total)])
  for (const step of [20, 100, 500, 1000]) {
    const up = Math.ceil(total / step) * step
    if (up > total) out.add(up)
  }
  out.add(Math.ceil(total / 1000) * 1000 + 1000)
  return [...out].sort((a, b) => a - b).slice(0, 5)
}

const STORAGE_KEY = 'maew.pos.cart'

/** The bill survives a reload or a trip to another admin screen. */
export function loadCart(): Cart {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyCart
    const c = JSON.parse(raw) as Cart
    if (!Array.isArray(c.lines)) return emptyCart
    return { ...emptyCart, ...c }
  } catch {
    return emptyCart
  }
}

export function saveCart(cart: Cart) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
  } catch {
    // Not kept; the bill still works for this visit
  }
}

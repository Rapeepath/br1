// Talks to the simulated POS server (/api, same origin). Every call carries the signed-in staff member's
// token; a 401 anywhere signs the screen out with a message.
import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  Booking,
  Category,
  Customer,
  KittenUnit,
  Lead,
  LeadStatus,
  Order,
  OrderLine,
  PaymentMethod,
  Product,
  PublicStaff,
  Reservation,
  SalesSummary,
  Settings,
  Shift,
  StockMovement,
} from '../../server/types.ts'

export type * from '../../server/types.ts'

const TOKEN_KEY = 'maew.pos.token'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export const tokenStore = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set(token: string) {
    try {
      localStorage.setItem(TOKEN_KEY, token)
    } catch {
      // Private mode: the session lasts as long as the tab
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      // Nothing stored
    }
  },
}

let unauthorized: ((message: string) => void) | null = null
/** The auth provider registers how to sign the screen out when the server rejects the token. */
export const onUnauthorized = (fn: ((message: string) => void) | null) => {
  unauthorized = fn
}

interface CallOptions {
  method?: 'GET' | 'POST' | 'PATCH'
  body?: unknown
  signal?: AbortSignal
}

async function request(path: string, { method = 'GET', body, signal }: CallOptions = {}): Promise<Response> {
  const token = tokenStore.get()
  let res: Response
  try {
    res = await fetch(`/api${path}`, {
      method,
      signal,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err
    throw new ApiError(0, 'ติดต่อเซิร์ฟเวอร์ไม่ได้ ตรวจว่าเปิด npm run dev หรือ npm run server อยู่')
  }
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null
    const message = data?.error ?? `เซิร์ฟเวอร์ตอบกลับผิดพลาด (${res.status})`
    if (res.status === 401 && path !== '/auth/login') {
      tokenStore.clear()
      unauthorized?.(message)
    }
    throw new ApiError(res.status, message)
  }
  return res
}

export async function api<T>(path: string, options?: CallOptions): Promise<T> {
  const res = await request(path, options)
  return (await res.json()) as T
}

/** Fetches a file with the token (a plain link can't send it) and hands it to the browser to save. */
export async function download(path: string, fallbackName: string): Promise<void> {
  const res = await request(path)
  const blob = await res.blob()
  const name = /filename="([^"]+)"/.exec(res.headers.get('Content-Disposition') ?? '')?.[1] ?? fallbackName
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export interface Loaded<T> {
  data: T | undefined
  error: string | null
  loading: boolean
  reload: () => void
  setData: (value: T) => void
}

/**
 * Loads a GET endpoint and reloads it when the path changes. The previous data stays on screen while the
 * next one loads, so filters never flash an empty page.
 */
export function useApi<T>(path: string | null): Loaded<T> {
  const [data, setData] = useState<T>()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(path !== null)
  const [nonce, setNonce] = useState(0)
  const live = useRef(true)

  useEffect(() => {
    live.current = true
    return () => {
      live.current = false
    }
  }, [])

  useEffect(() => {
    if (path === null) return
    const ctrl = new AbortController()
    setLoading(true)
    api<T>(path, { signal: ctrl.signal })
      .then((d) => {
        setData(d)
        setError(null)
      })
      .catch((err: Error) => {
        if (err.name !== 'AbortError') setError(err.message)
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false)
      })
    return () => ctrl.abort()
  }, [path, nonce])

  const reload = useCallback(() => setNonce((n) => n + 1), [])
  const set = useCallback((value: T) => {
    if (live.current) setData(value)
  }, [])
  return { data, error, loading, reload, setData: set }
}

// ---------- Response shapes the server builds on top of the stored records ----------

export interface Meta {
  settings: Settings
  categories: Category[]
  staff: PublicStaff[]
  paymentMethods: { id: PaymentMethod; label: string }[]
  seededAt: string
  file: string
}

export type ListedProduct = Product & { unit: string; sold: number; revenue: number; lastSoldAt: string | null }

export interface ProductDetail {
  product: ListedProduct
  movements: StockMovement[]
  sales: { id: string; no: string; createdAt: string; status: Order['status']; customerName: string | null; line: OrderLine }[]
  record: Record<string, unknown> | null
}

export type ListedCustomer = Customer & { orders: number; spent: number; lastOrderAt: string | null }

export interface ShiftView extends Shift {
  expectedNow: number
  cashSales: number
  cashRefunds: number
  summary: SalesSummary
  byPayment: { method: PaymentMethod; orders: number; revenue: number }[]
}

export interface OrderList {
  from: string
  to: string
  total: number
  revenue: number
  rows: Order[]
}

export interface Paged<T> {
  total: number
  rows: T[]
}

// ---------- Customer relations ----------

export type LeadView = Lead & { assignee: PublicStaff | null }

export interface LeadList {
  total: number
  counts: Record<LeadStatus, number>
  rows: LeadView[]
}

export interface LeadDetail {
  lead: LeadView
  booking: Booking | null
  quotation: unknown
  reservation: Reservation | null
}

export type KittenRow = KittenUnit & { productName: string; effectivePrice: number; ageWeeks: number }

export interface KittenDetail {
  kitten: KittenRow
  reservations: Reservation[]
}

export type ReservationRow = Reservation & { kitten: KittenUnit | null }

export interface ReservationDetail {
  reservation: Reservation
  kitten: KittenUnit | null
  lead: Lead | null
  publicPath: string
}

/** What /reservations/:id/to-cart hands the till */
export interface ReservationCart {
  reservationNo: string
  lines: { productId: string; qty: 1; unitId: string }[]
  depositApplied: number
  customer: Customer | null
}

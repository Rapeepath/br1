// App-wide state for the back office: who is signed in, the shop's settings, the open shift, the bill being
// rung up, and toast messages.
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { api, onUnauthorized, tokenStore, type Meta, type PublicStaff, type ShiftView } from './api'
import { cartReducer, loadCart, saveCart, type Cart, type CartAction } from './cart'

interface Auth {
  staff: PublicStaff | null
  isManager: boolean
  /** Why the screen was signed out (expired session, reset by a manager) */
  notice: string | null
  booting: boolean
  meta: Meta | null
  shift: ShiftView | null
  login: (staffId: string, pin: string) => Promise<void>
  logout: () => Promise<void>
  /** Takes over a new token (after the demo data is regenerated) */
  adopt: (token: string) => Promise<void>
  refreshMeta: () => Promise<void>
  refreshShift: () => Promise<void>
}

const AuthContext = createContext<Auth | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<PublicStaff | null>(null)
  const [meta, setMeta] = useState<Meta | null>(null)
  const [shift, setShift] = useState<ShiftView | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [booting, setBooting] = useState(true)

  const refreshMeta = useCallback(async () => setMeta(await api<Meta>('/meta')), [])
  const refreshShift = useCallback(async () => setShift(await api<ShiftView | null>('/shifts/current')), [])

  const start = useCallback(async () => {
    const [me, m, s] = await Promise.all([api<PublicStaff>('/auth/me'), api<Meta>('/meta'), api<ShiftView | null>('/shifts/current')])
    setStaff(me)
    setMeta(m)
    setShift(s)
  }, [])

  useEffect(() => {
    onUnauthorized((message) => {
      setStaff(null)
      setNotice(message)
    })
    if (!tokenStore.get()) {
      setBooting(false)
      return () => onUnauthorized(null)
    }
    start()
      .catch(() => tokenStore.clear())
      .finally(() => setBooting(false))
    return () => onUnauthorized(null)
  }, [start])

  const login = useCallback(
    async (staffId: string, pin: string) => {
      const { token } = await api<{ token: string; staff: PublicStaff }>('/auth/login', { method: 'POST', body: { staffId, pin } })
      tokenStore.set(token)
      setNotice(null)
      await start()
    },
    [start],
  )

  const logout = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST' })
    } catch {
      // Signed out locally either way
    }
    tokenStore.clear()
    setStaff(null)
    setNotice(null)
  }, [])

  const adopt = useCallback(
    async (token: string) => {
      tokenStore.set(token)
      await start()
    },
    [start],
  )

  const value = useMemo<Auth>(
    () => ({ staff, isManager: staff?.role === 'manager', notice, booting, meta, shift, login, logout, adopt, refreshMeta, refreshShift }),
    [staff, notice, booting, meta, shift, login, logout, adopt, refreshMeta, refreshShift],
  )
  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth(): Auth {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth outside AuthProvider')
  return ctx
}

/** Signed-in screens only: staff and meta are always there. */
export function useSession() {
  const auth = useAuth()
  return auth as Auth & { staff: PublicStaff; meta: Meta }
}

// ---------- The bill at the till ----------

const CartContext = createContext<{ cart: Cart; dispatch: (a: CartAction) => void } | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, undefined, loadCart)
  useEffect(() => saveCart(cart), [cart])
  const value = useMemo(() => ({ cart, dispatch }), [cart])
  return <CartContext value={value}>{children}</CartContext>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart outside CartProvider')
  return ctx
}

// ---------- Toasts ----------

interface Toast {
  id: number
  message: string
  tone: 'ok' | 'error'
}

const ToastContext = createContext<(message: string, tone?: Toast['tone']) => void>(() => {})

/*
  While a modal <dialog> is open, everything outside it is inert: not clickable and dropped from the
  accessibility tree, so a page-level live region is never announced. Each open Dialog therefore registers
  an empty live region at its foot, and messages are rendered into the topmost one (the last opened).
*/
const slots: HTMLElement[] = []
const slotListeners = new Set<() => void>()
const slotsChanged = () => slotListeners.forEach((l) => l())

/** Called by Dialog once it is open; returns the unregister function. */
export function registerToastSlot(el: HTMLElement): () => void {
  slots.push(el)
  slotsChanged()
  return () => {
    const i = slots.indexOf(el)
    if (i >= 0) slots.splice(i, 1)
    slotsChanged()
  }
}

const subscribeSlots = (cb: () => void) => {
  slotListeners.add(cb)
  return () => {
    slotListeners.delete(cb)
  }
}
const topSlot = () => slots[slots.length - 1] ?? null

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const next = useRef(1)
  const slot = useSyncExternalStore(subscribeSlots, topSlot, () => null)
  const push = useCallback((message: string, tone: Toast['tone'] = 'ok') => {
    const id = next.current++
    setToasts((t) => [...t.slice(-2), { id, message, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500)
  }, [])
  const list = toasts.map((t) => (
    <p key={t.id} className={`toast toast--${t.tone}`}>
      {t.message}
    </p>
  ))
  return (
    <ToastContext value={push}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {slot ? null : list}
      </div>
      {slot && createPortal(list, slot)}
    </ToastContext>
  )
}

export const useToast = () => useContext(ToastContext)
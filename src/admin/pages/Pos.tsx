// The till: pick products, build the bill, take payment, hand over the receipt.
import { useEffect, useId, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { Banknote, CreditCard, Landmark, Minus, Package, Plus, Printer, QrCode, Search, Stethoscope, Trash2, UserRound } from 'lucide-react'
import { api, useApi, type KittenRow, type ListedCustomer, type ListedProduct, type Order, type PaymentMethod, type Quote } from '../api'
import { amountDue, estimate, itemCount, lineKey, qtyInCart, tenderOptions, toCheckout, toQuote, type Cart, type CartLine } from '../cart'
import { useCart, useSession, useToast } from '../context'
import { SEX_LABEL, ageText } from '../crm'
import { PAYMENT_LABEL, baht, bahtText } from '../format'
import { printReceipt, Receipt, type UnitNames } from '../Receipt'
import { OpenShiftForm } from '../ShiftForms'
import { Dialog, ErrorNote, Field, Loading, Segmented, Words, parseAmount, useDebounced, useMedia, useTitle } from '../ui'
import '../crm.css'

export function Pos() {
  useTitle('ขายหน้าร้าน')
  const { shift, meta } = useSession()
  const products = useApi<ListedProduct[]>('/products')
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('all')
  const [sheet, setSheet] = useState(false)
  const [paying, setPaying] = useState(false)
  const [done, setDone] = useState<{ order: Order; units: UnitNames } | null>(null)
  const [picking, setPicking] = useState<ListedProduct | null>(null)
  const phone = useMedia('(max-width: 1023px)')
  const { cart } = useCart()

  const byId = useMemo(() => new Map((products.data ?? []).map((p) => [p.id, p])), [products.data])
  const quote = useQuote(cart)

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase()
    return (products.data ?? [])
      .filter((p) => p.active)
      .filter((p) => cat === 'all' || p.categoryId === cat)
      .filter((p) => !t || `${p.name} ${p.subtitle} ${p.sku}`.toLowerCase().includes(t))
  }, [products.data, q, cat])

  const est = estimate(cart, (id) => byId.get(id)?.price ?? 0, meta.settings.vatRate)
  const total = dueOf(quote.quote, est.total, cart)
  // The kitten being collected is already off the shelf, so it doesn't use up the tile's stock
  const reservedProduct = cart.reservation ? cart.lines.find((l) => l.unitId === cart.reservation!.unitId)?.productId : undefined
  const count = itemCount(cart)

  const panel = <CartPanel byId={byId} quote={quote} onPay={() => setPaying(true)} />

  return (
    <section className="page page--pos">
      <div className="pos">
        <div className="pos__browse">
          <div className="pos__head">
            <h1>ขายหน้าร้าน</h1>
            <div className="pos__search">
              <Search size={18} aria-hidden />
              <label htmlFor="pos-q" className="visually-hidden">
                ค้นหาสินค้า
              </label>
              <input id="pos-q" className="input input--search" type="search" placeholder="ค้นหาชื่อ สายพันธุ์ หรือรหัส SKU" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </div>
          <Segmented
            label="หมวดสินค้า"
            value={cat}
            onChange={setCat}
            options={[{ value: 'all', label: 'ทั้งหมด' }, ...meta.categories.map((c) => ({ value: c.id, label: c.label }))]}
            className="pos__cats"
          />

          {!shift && <OpenShiftForm />}
          {products.error && <ErrorNote message={products.error} onRetry={products.reload} />}
          {!products.data && !products.error && <Loading label="กำลังโหลดสินค้า" />}
          {products.data && shown.length === 0 && <p className="pos__none">ไม่พบสินค้าที่ตรงกับ "{q}" ลองคำอื่นหรือเลือกหมวดทั้งหมด</p>}
          <ul className="tiles" aria-label="สินค้า">
            {shown.map((p) => (
              <li key={p.id}>
                <Tile p={p} inCart={qtyInCart(cart, p.id)} held={reservedProduct === p.id ? 1 : 0} disabled={!shift} onPickUnit={() => setPicking(p)} />
              </li>
            ))}
          </ul>
        </div>

        {!phone && <aside className="pos__cart" aria-label="บิลปัจจุบัน">{panel}</aside>}
      </div>

      {phone && (
        <div className="cart-bar">
          <p className="cart-bar__sum" aria-live="polite">
            <span>{count ? `${count} ชิ้นในบิล` : 'บิลว่าง'}</span>
            <strong>{bahtText(total)}</strong>
          </p>
          <button type="button" className="btn btn-primary" onClick={() => setSheet(true)} aria-haspopup="dialog">
            ดูบิลและชำระเงิน
          </button>
        </div>
      )}
      {phone && (
        <Dialog open={sheet} onClose={() => setSheet(false)} title="บิลปัจจุบัน" className="dialog--sheet">
          {panel}
        </Dialog>
      )}

      {paying && quote.quote && (
        <PayDialog
          total={total}
          onClose={() => setPaying(false)}
          onPaid={(o) => {
            setPaying(false)
            setSheet(false)
            setDone({ order: o, units: unitNames(cart.lines) })
            products.reload()
          }}
        />
      )}
      {done && <DoneDialog order={done.order} units={done.units} onClose={() => setDone(null)} />}
      {picking && <UnitPicker product={picking} onClose={() => setPicking(null)} />}
    </section>
  )
}

/** Kitten id → its code and name, for the receipt of a bill being rung up. */
const unitNames = (lines: CartLine[]): UnitNames =>
  Object.fromEntries(lines.filter((l) => l.unitId).map((l) => [l.unitId!, { code: l.unitCode ?? '', name: l.unitName ?? '' }]))

function Tile({ p, inCart, held, disabled, onPickUnit }: { p: ListedProduct; inCart: number; held: number; disabled: boolean; onPickUnit: () => void }) {
  const { dispatch } = useCart()
  const out = p.trackStock && p.stock - (inCart - held) <= 0
  const Icon = p.categoryId === 'service' ? Stethoscope : Package
  return (
    <button
      type="button"
      className={`tile ${p.image ? 'tile--photo' : ''}`}
      disabled={disabled || out}
      aria-haspopup={p.unitTracked ? 'dialog' : undefined}
      onClick={() => (p.unitTracked ? onPickUnit() : dispatch({ type: 'add', productId: p.id, max: p.trackStock ? p.stock : null }))}
    >
      {p.image ? (
        <img className="tile__img" src={`/${p.image}`} alt="" width={160} height={120} loading="lazy" />
      ) : (
        <span className={`tile__icon bubble ${p.categoryId === 'service' ? 'tone-mint' : 'tone-peach'}`} aria-hidden="true">
          <Icon size={22} />
        </span>
      )}
      <span className="tile__name">
        <Words text={p.name} />
      </span>
      <span className="tile__sub">
        <Words text={p.subtitle} />
      </span>
      <span className="tile__foot">
        <span className="tile__price">{baht(p.price)} บาท</span>
        {p.trackStock ? (
          <span className={`tile__stock ${p.stock === 0 ? 'is-out' : p.stock <= p.reorderLevel ? 'is-low' : ''}`}>
            {p.stock === 0 ? 'หมด' : `เหลือ ${p.stock}`}
          </span>
        ) : (
          <span className="tile__stock">บริการ</span>
        )}
      </span>
      {inCart > 0 && <span className="tile__in">ในบิล {inCart}</span>}
    </button>
  )
}

interface QuoteState {
  quote: Quote | null
  error: string | null
  pending: boolean
}

/**
 * What is due today: the server's amount once it has priced the bill (a collected reservation's deposit
 * already off), the on-screen estimate less the deposit until then.
 */
export function dueOf(quote: Quote | null, estimateTotal: number, cart: Cart): number {
  if (quote) return quote.amountDue ?? quote.total
  return amountDue(estimateTotal, cart.reservation?.deposit ?? 0)
}

/** Asks the server to price the bill whenever it settles; its answer is the one that gets charged. */
function useQuote(cart: Cart): QuoteState {
  const key = JSON.stringify(toQuote(cart))
  const settled = useDebounced(key, 220)
  const [state, setState] = useState<{ key: string; quote: Quote | null; error: string | null }>({ key: '', quote: null, error: null })

  useEffect(() => {
    const body = JSON.parse(settled) as ReturnType<typeof toQuote>
    if (!body.lines.length) {
      setState({ key: settled, quote: null, error: null })
      return
    }
    const ctrl = new AbortController()
    api<Quote>('/quote', { method: 'POST', body, signal: ctrl.signal })
      .then((quote) => setState({ key: settled, quote, error: null }))
      .catch((e: Error) => {
        if (e.name !== 'AbortError') setState({ key: settled, quote: null, error: e.message })
      })
    return () => ctrl.abort()
  }, [settled])

  const pending = state.key !== key
  return { quote: pending ? null : state.quote, error: pending ? null : state.error, pending }
}
/** Kittens of one breed and grade that are free to sell, to pick the one the customer chose. */
function UnitPicker({ product, onClose }: { product: ListedProduct; onClose: () => void }) {
  const { cart, dispatch } = useCart()
  const { data, error, reload } = useApi<{ rows: KittenRow[] }>(`/kittens?status=available&breed=${encodeURIComponent(product.refId ?? '')}`)
  const taken = new Set(cart.lines.map((l) => l.unitId).filter(Boolean))
  const rows = (data?.rows ?? []).filter((k) => k.productId === product.id && !taken.has(k.id))
  return (
    <Dialog open onClose={onClose} title={`เลือกลูกแมว ${product.name}`}>
      {error && <ErrorNote message={error} onRetry={reload} />}
      {!data && !error && <Loading label="กำลังโหลดลูกแมว" />}
      {data && rows.length === 0 && <p className="empty-line">ไม่มีลูกแมวของ SKU นี้ที่พร้อมขายแล้ว ลองเลือกเกรดอื่นหรือดูการจองที่รอรับ</p>}
      {rows.length > 0 && (
        <ul className="unit-list" aria-label="ลูกแมวที่พร้อมขาย">
          {rows.map((k) => {
            const special = k.effectivePrice !== product.price
            return (
              <li key={k.id}>
                <button
                  type="button"
                  className="unit-pick"
                  onClick={() => {
                    dispatch({ type: 'addUnit', productId: product.id, unitId: k.id, unitCode: k.code, unitName: k.name, unitPrice: k.effectivePrice })
                    onClose()
                  }}
                >
                  <span className="unit-pick__name">
                    น้อง{k.name} <span className="line__unit-code">{k.code}</span>
                  </span>
                  <span className="unit-pick__meta">
                    {SEX_LABEL[k.sex]} {k.color} อายุ {ageText(k.birthDate)}
                    {special && ` ราคาเฉพาะตัวนี้ (ราคาปกติ ${baht(product.price)} บาท)`}
                  </span>
                  <span className="unit-pick__price">{baht(k.effectivePrice)} บาท</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </Dialog>
  )
}

function CartPanel({ byId, quote, onPay }: { byId: Map<string, ListedProduct>; quote: QuoteState; onPay: () => void }) {
  const { cart, dispatch } = useCart()
  const { meta, shift } = useSession()
  const [picking, setPicking] = useState(false)
  const [customerName, setCustomerName] = useState<string | null>(null)
  const est = estimate(cart, (id) => byId.get(id)?.price ?? 0, meta.settings.vatRate)
  const shown = quote.quote ?? est
  // The server's deposit and amount due once it has priced the bill; the estimate until then
  const deposit = quote.quote ? (quote.quote.depositApplied ?? 0) : (cart.reservation?.deposit ?? 0)
  const due = dueOf(quote.quote, est.total, cart)
  const priced = !!quote.quote
  const discountId = useId()
  const noteId = useId()

  // The name of a customer picked earlier (the bill survives reloads; the name is looked up again)
  useEffect(() => {
    if (!cart.customerId) {
      setCustomerName(null)
      return
    }
    if (customerName) return
    api<{ customer: ListedCustomer }>(`/customers/${cart.customerId}`)
      .then((r) => setCustomerName(r.customer.name))
      .catch(() => dispatch({ type: 'customer', customerId: null }))
  }, [cart.customerId, customerName, dispatch])

  return (
    <div className="cart">
      <div className="cart__head">
        <h2 className="h3">บิลปัจจุบัน</h2>
        {cart.lines.length > 0 && (
          <button type="button" className="text-btn" onClick={() => dispatch({ type: 'clear' })}>
            ล้างบิล
          </button>
        )}
      </div>

      {cart.reservation && (
        <div className="collect-box">
          <p className="collect-box__title">รับลูกแมวตามการจอง {cart.reservation.no}</p>
          <p>หักเงินมัดจำที่ชำระแล้ว {bahtText(cart.reservation.deposit)} ออกจากยอดที่ต้องชำระวันนี้ เพิ่มอาหารหรืออุปกรณ์ในบิลเดียวกันได้</p>
          <button type="button" className="text-btn" onClick={() => dispatch({ type: 'clear' })}>
            ยกเลิกบิลรับลูกแมวนี้
          </button>
        </div>
      )}

      <button type="button" className="cart__customer" onClick={() => setPicking(true)} aria-haspopup="dialog">
        <UserRound size={18} aria-hidden />
        <span>
          <span className="cart__customer-label">ลูกค้า</span>
          <span className="cart__customer-name"><Words text={cart.customerId ? (customerName ?? 'กำลังโหลด') : 'ลูกค้าทั่วไป (ไม่ระบุชื่อ)'} /></span>
        </span>
        <span className="cart__customer-change">เปลี่ยน</span>
      </button>

      {cart.lines.length === 0 ? (
        <p className="cart__empty">{shift ? 'แตะสินค้าทางซ้ายเพื่อเพิ่มลงบิล' : 'เปิดกะก่อน แล้วแตะสินค้าเพื่อเพิ่มลงบิล'}</p>
      ) : (
        <ul className="lines">
          {cart.lines.map((l) => {
            const p = byId.get(l.productId)
            if (!p) return null
            return <Line key={lineKey(l)} p={p} line={l} reserved={!!cart.reservation && l.unitId === cart.reservation.unitId} />
          })}
        </ul>
      )}

      {cart.lines.length > 0 && (
        <div className="cart__extras">
          <div className="bill-discount">
            <Segmented
              label="ชนิดส่วนลดท้ายบิล"
              value={cart.billDiscount.type}
              onChange={(type) => dispatch({ type: 'billDiscount', value: { type, value: cart.billDiscount.value } })}
              options={[
                { value: 'amount', label: 'บาท' },
                { value: 'percent', label: '%' },
              ]}
            />
            <div className="bill-discount__field">
              <label htmlFor={discountId}>ส่วนลดท้ายบิล</label>
              <input
                id={discountId}
                className="input input--sm"
                inputMode="decimal"
                value={cart.billDiscount.value || ''}
                placeholder="0"
                onChange={(e) => {
                  const v = parseAmount(e.target.value)
                  dispatch({ type: 'billDiscount', value: { type: cart.billDiscount.type, value: Number.isFinite(v) ? v : 0 } })
                }}
              />
            </div>
          </div>
          <div className="cart__note">
            <label htmlFor={noteId}>หมายเหตุในบิล</label>
            <input id={noteId} className="input input--sm" value={cart.note} maxLength={120} onChange={(e) => dispatch({ type: 'note', note: e.target.value })} />
          </div>
        </div>
      )}

      <dl className={`totals ${quote.pending ? 'is-pending' : ''}`} aria-live="polite">
        <div>
          <dt>รวมสินค้า</dt>
          <dd>{baht(shown.subtotal)}</dd>
        </div>
        {shown.lineDiscount > 0 && (
          <div>
            <dt>ส่วนลดรายการ</dt>
            <dd>−{baht(shown.lineDiscount)}</dd>
          </div>
        )}
        {shown.billDiscount > 0 && (
          <div>
            <dt>ส่วนลดท้ายบิล</dt>
            <dd>−{baht(shown.billDiscount)}</dd>
          </div>
        )}
        {deposit > 0 ? (
          <>
            <div>
              <dt>ยอดบิล</dt>
              <dd>{baht(shown.total)}</dd>
            </div>
            <div>
              <dt>หักมัดจำที่ชำระแล้ว</dt>
              <dd>−{baht(deposit)}</dd>
            </div>
            <div className="totals__grand">
              <dt>ชำระวันนี้</dt>
              <dd>{bahtText(due)}</dd>
            </div>
          </>
        ) : (
          <div className="totals__grand">
            <dt>ยอดชำระ</dt>
            <dd>{bahtText(shown.total)}</dd>
          </div>
        )}
        <div className="totals__vat">
          <dt>
            รวม VAT {shown.vatRate}% แล้ว
          </dt>
          <dd>{baht(shown.vat)} บาท</dd>
        </div>
      </dl>
      {quote.error && (
        <p className="cart__error" role="alert">
          {quote.error}
        </p>
      )}
      <button type="button" className="btn btn-primary cart__pay" disabled={!shift || !priced || cart.lines.length === 0} onClick={onPay}>
        รับชำระ {priced ? bahtText(due) : ''}
      </button>
      {!shift && (
        <p className="cart__hint">
          ต้องเปิดกะก่อนรับชำระ <Link to="/shifts">ไปหน้ากะและเงินสด</Link>
        </p>
      )}

      {picking && (
        <CustomerPicker
          onClose={() => setPicking(false)}
          onPick={(c) => {
            dispatch({ type: 'customer', customerId: c?.id ?? null })
            setCustomerName(c?.name ?? null)
            setPicking(false)
          }}
        />
      )}
    </div>
  )
}

function Line({ p, line, reserved }: { p: ListedProduct; line: CartLine; reserved: boolean }) {
  const { dispatch } = useCart()
  const { qty, discount, unitId } = line
  const [showDiscount, setShowDiscount] = useState(discount > 0)
  const [text, setText] = useState(discount ? String(discount) : '')
  const max = p.trackStock ? p.stock : null
  const qtyId = useId()
  const discId = useId()
  // A kitten at its own price (the server prices it the same way)
  const price = line.unitPrice ?? p.price
  const gross = price * qty
  const label = unitId ? `${p.name} น้อง${line.unitName ?? ''}` : p.name
  return (
    <li className="line">
      <div className="line__top">
        <div className="line__what">
          <p className="line__name">
            <Words text={p.name} />
          </p>
          {unitId ? (
            <p className="line__unit">
              <span className="line__unit-code">{line.unitCode}</span> น้อง{line.unitName} {baht(price)} บาท{reserved && ' (ตัวที่จองไว้)'}
            </p>
          ) : (
            <p className="line__unit">
              {baht(p.price)} บาท ต่อ{p.unit}
              {max !== null && ` (มี ${max})`}
            </p>
          )}
        </div>
        <p className="line__total">{baht(gross - discount)}</p>
      </div>
      <div className="line__controls">
        {unitId ? (
          <span className="line__unit">1 {p.unit}</span>
        ) : (
        <div className="stepper">
          <button type="button" onClick={() => (qty <= 1 ? dispatch({ type: 'remove', productId: p.id }) : dispatch({ type: 'qty', productId: p.id, qty: qty - 1, max }))} aria-label={`ลดจำนวน ${p.name}`}>
            <Minus size={16} aria-hidden />
          </button>
          <label htmlFor={qtyId} className="visually-hidden">
            จำนวน {p.name}
          </label>
          <input
            id={qtyId}
            inputMode="numeric"
            value={qty}
            onChange={(e) => {
              const n = Number(e.target.value.replace(/\D/g, ''))
              if (n > 0) dispatch({ type: 'qty', productId: p.id, qty: n, max })
            }}
          />
          <button type="button" disabled={max !== null && qty >= max} onClick={() => dispatch({ type: 'qty', productId: p.id, qty: qty + 1, max })} aria-label={`เพิ่มจำนวน ${p.name}`}>
            <Plus size={16} aria-hidden />
          </button>
        </div>
        )}
        <button type="button" className="text-btn" aria-expanded={showDiscount} onClick={() => setShowDiscount((s) => !s)}>
          ลดราคา
        </button>
        <button type="button" className="icon-btn icon-btn--sm" onClick={() => dispatch({ type: 'remove', productId: p.id, unitId })} aria-label={`เอา ${label} ออกจากบิล`}>
          <Trash2 size={17} aria-hidden />
        </button>
      </div>
      {showDiscount && (
        <div className="line__discount">
          <label htmlFor={discId}>ส่วนลดรายการนี้ (บาท)<span className="visually-hidden"> {label}</span></label>
          <input
            id={discId}
            className="input input--sm"
            inputMode="decimal"
            value={text}
            placeholder="0"
            onChange={(e) => {
              setText(e.target.value)
              const v = parseAmount(e.target.value)
              dispatch({ type: 'discount', productId: p.id, discount: Number.isFinite(v) ? v : 0, unitId })
            }}
          />
        </div>
      )}
    </li>
  )
}

function CustomerPicker({ onClose, onPick }: { onClose: () => void; onPick: (c: ListedCustomer | null) => void }) {
  const [q, setQ] = useState('')
  const term = useDebounced(q, 200)
  const list = useApi<ListedCustomer[]>(`/customers?q=${encodeURIComponent(term)}`)
  const [adding, setAdding] = useState(false)
  const qId = useId()

  return (
    <Dialog open onClose={onClose} title="เลือกลูกค้า">
      {adding ? (
        <QuickAdd onCancel={() => setAdding(false)} onAdded={(c) => onPick(c)} />
      ) : (
        <>
          <div className="picker__search">
            <label htmlFor={qId}>ค้นหาด้วยชื่อหรือเบอร์โทร</label>
            <input id={qId} className="input" type="search" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
          </div>
          <div className="picker__actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onPick(null)}>
              ลูกค้าทั่วไป
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAdding(true)}>
              <Plus size={16} aria-hidden /> เพิ่มลูกค้าใหม่
            </button>
          </div>
          {list.error && <ErrorNote message={list.error} onRetry={list.reload} />}
          <ul className="picker__list">
            {(list.data ?? []).slice(0, 30).map((c) => (
              <li key={c.id}>
                <button type="button" onClick={() => onPick(c)}>
                  <span className="picker__name">
                    <Words text={c.name} />
                  </span>
                  <span className="picker__meta">
                    {c.phone}
                    {c.orders > 0 && `, ซื้อแล้ว ${c.orders} บิล`}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {list.data && list.data.length === 0 && <p className="picker__none">ไม่พบลูกค้าชื่อหรือเบอร์นี้ กดเพิ่มลูกค้าใหม่ได้เลย</p>}
        </>
      )}
    </Dialog>
  )
}

function QuickAdd({ onCancel, onAdded }: { onCancel: () => void; onAdded: (c: ListedCustomer) => void }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const toast = useToast()
  const nId = useId()
  const pId = useId()
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const c = await api<ListedCustomer>('/customers', { method: 'POST', body: { name, phone } })
      toast(`เพิ่มลูกค้า ${c.name} แล้ว`)
      onAdded({ ...c, orders: 0, spent: 0, lastOrderAt: null })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <form className="form" onSubmit={submit}>
      <Field label="ชื่อลูกค้า" htmlFor={nId}>
        <input id={nId} className="input" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
      </Field>
      <Field label="เบอร์โทร" htmlFor={pId} hint="ใช้ค้นหาลูกค้าครั้งต่อไป">
        <input id={pId} className="input" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
      </Field>
      {error && (
        <p className="form__error" role="alert">
          {error}
        </p>
      )}
      <div className="form__actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          กลับไปค้นหา
        </button>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          เพิ่มและเลือกลูกค้านี้
        </button>
      </div>
    </form>
  )
}

const METHOD_ICON = { cash: Banknote, promptpay: QrCode, card: CreditCard, transfer: Landmark } as const

function PayDialog({ total, onClose, onPaid }: { total: number; onClose: () => void; onPaid: (o: Order) => void }) {
  const { cart } = useCart()
  const { refreshShift } = useSession()
  const toast = useToast()
  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [tendered, setTendered] = useState('')
  const [last4, setLast4] = useState('')
  const [stage, setStage] = useState<'idle' | 'approving' | 'saving'>('idle')
  const [error, setError] = useState<string | null>(null)
  const tId = useId()
  const cId = useId()

  const given = tendered === '' ? total : parseAmount(tendered)
  const change = Number.isFinite(given) ? Math.round((given - total) * 100) / 100 : Number.NaN
  const short = method === 'cash' && !(change >= 0)

  const pay = async () => {
    if (short) {
      setError(`รับเงินมาไม่พอ ขาดอีก ${bahtText(Math.abs(change))}`)
      return
    }
    if (method === 'card' && last4 && !/^\d{4}$/.test(last4)) {
      setError('เลขท้ายบัตรต้องเป็นตัวเลข 4 หลัก หรือเว้นว่างไว้')
      return
    }
    setError(null)
    if (method === 'card') {
      setStage('approving')
      await new Promise((r) => setTimeout(r, 900))
    }
    setStage('saving')
    try {
      const order = await api<Order>('/orders', {
        method: 'POST',
        body: toCheckout(cart, { method, tendered: method === 'cash' ? given : null, cardLast4: method === 'card' && last4 ? last4 : null }),
      })
      await refreshShift()
      toast(`บันทึกการขาย ${order.no} แล้ว`)
      onPaid(order)
    } catch (err) {
      setError((err as Error).message)
      setStage('idle')
    }
  }

  return (
    <Dialog open onClose={stage === 'idle' ? onClose : () => {}} title={`รับชำระ ${bahtText(total)}`}>
      <div className="pay">
        <fieldset className="pay__methods">
          <legend className="field__label">วิธีชำระเงิน</legend>
          <div className="pay__grid">
            {(['cash', 'promptpay', 'card', 'transfer'] as const).map((m) => {
              const Icon = METHOD_ICON[m]
              return (
                <label key={m} className="pay__method">
                  <input type="radio" name="method" value={m} checked={method === m} onChange={() => setMethod(m)} />
                  <Icon size={22} aria-hidden />
                  <span>{PAYMENT_LABEL[m]}</span>
                </label>
              )
            })}
          </div>
        </fieldset>

        {method === 'cash' && (
          <div className="pay__panel">
            <Field label="รับเงินมา (บาท)" htmlFor={tId} hint="เว้นว่างไว้ถ้าลูกค้าจ่ายพอดี">
              <input id={tId} className="input input--lg" inputMode="decimal" value={tendered} placeholder={baht(total)} onChange={(e) => setTendered(e.target.value)} />
            </Field>
            <div className="pay__quick" role="group" aria-label="จำนวนเงินที่รับบ่อย">
              {tenderOptions(total).map((v) => (
                <button key={v} type="button" className="chip-btn" aria-pressed={given === v} onClick={() => setTendered(String(v))}>
                  {baht(v)}
                </button>
              ))}
            </div>
            <p className={`pay__change ${short ? 'is-short' : ''}`} aria-live="polite">
              {short ? (Number.isFinite(change) ? `ขาดอีก ${bahtText(Math.abs(change))}` : 'ใส่จำนวนเงินเป็นตัวเลข') : <>เงินทอน <strong>{bahtText(change)}</strong></>}
            </p>
          </div>
        )}

        {method === 'promptpay' && (
          <div className="pay__panel pay__qr">
            <FakeQr seed={`${total}`} />
            <div>
              <p className="pay__qr-amount">{bahtText(total)}</p>
              <p className="pay__sim">QR จำลองสำหรับทดสอบ สแกนจ่ายจริงไม่ได้ เมื่อลูกค้าแสดงสลิปแล้วกดยืนยันได้เลย</p>
            </div>
          </div>
        )}

        {method === 'card' && (
          <div className="pay__panel">
            <Field label="เลขท้ายบัตร 4 หลัก (ไม่บังคับ)" htmlFor={cId} hint="เครื่องรูดบัตรจำลองจะอนุมัติทุกรายการ">
              <input id={cId} className="input" inputMode="numeric" maxLength={4} value={last4} onChange={(e) => setLast4(e.target.value.replace(/\D/g, ''))} />
            </Field>
          </div>
        )}

        {method === 'transfer' && (
          <div className="pay__panel">
            <p className="pay__sim">ตรวจยอดเงินเข้าในแอปธนาคารของร้านก่อนกดยืนยัน ระบบจะออกเลขอ้างอิงจำลองให้</p>
          </div>
        )}

        {error && (
          <p className="form__error" role="alert">
            {error}
          </p>
        )}
        {stage === 'approving' && (
          <p className="pay__wait" role="status">
            กำลังขออนุมัติจากธนาคารจำลอง
          </p>
        )}

        <div className="form__actions">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={stage !== 'idle'}>
            กลับไปแก้บิล
          </button>
          <button type="button" className="btn btn-primary" onClick={pay} disabled={stage !== 'idle'}>
            {method === 'cash' ? 'รับเงินและออกใบเสร็จ' : method === 'card' ? 'รูดบัตรและออกใบเสร็จ' : 'ยืนยันรับเงินและออกใบเสร็จ'}
          </button>
        </div>
      </div>
    </Dialog>
  )
}

/** A QR-looking pattern (finder squares + seeded modules). Deliberately not a real PromptPay code. */
function FakeQr({ seed }: { seed: string }) {
  const n = 25
  let h = 2166136261
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  const cells: [number, number][] = []
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const finder = (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8)
      if (finder) continue
      h = Math.imul(h ^ (x * 31 + y), 2654435761)
      if (((h >>> 13) & 3) === 0 || ((h >>> 7) & 5) === 1) cells.push([x, y])
    }
  const finder = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={7} height={7} fill="currentColor" />
      <rect x={x + 1} y={y + 1} width={5} height={5} fill="#fff" />
      <rect x={x + 2} y={y + 2} width={3} height={3} fill="currentColor" />
    </g>
  )
  return (
    <svg className="fake-qr" viewBox={`-2 -2 ${n + 4} ${n + 4}`} width={168} height={168} aria-hidden="true" focusable="false">
      <rect x={-2} y={-2} width={n + 4} height={n + 4} fill="#fff" />
      {cells.map(([x, y]) => (
        <rect key={`${x}.${y}`} x={x} y={y} width={1} height={1} fill="currentColor" />
      ))}
      {finder(0, 0)}
      {finder(n - 7, 0)}
      {finder(0, n - 7)}
    </svg>
  )
}

function DoneDialog({ order, units, onClose }: { order: Order; units: UnitNames; onClose: () => void }) {
  const { meta } = useSession()
  const { dispatch } = useCart()
  const finish = () => {
    dispatch({ type: 'clear' })
    onClose()
  }
  return (
    <Dialog open onClose={finish} title={`ขายสำเร็จ ${order.no}`} className="dialog--receipt" closeLabel="ปิดและเริ่มบิลใหม่">
      {order.payment.change !== null && order.payment.change > 0 && (
        <p className="done__change">
          ทอนเงินลูกค้า <strong>{bahtText(order.payment.change)}</strong>
        </p>
      )}
      <div className="print-target">
        <Receipt order={order} settings={meta.settings} units={units} />
      </div>
      <div className="form__actions">
        <button type="button" className="btn btn-ghost" onClick={printReceipt}>
          <Printer size={18} aria-hidden /> พิมพ์ใบเสร็จ
        </button>
        <button type="button" className="btn btn-primary" onClick={finish} autoFocus>
          บิลใหม่
        </button>
      </div>
    </Dialog>
  )
}

// The till-roll slip: ใบเสร็จรับเงิน/ใบกำกับภาษีอย่างย่อ. Printing sends only this slip to the printer.
import type { Customer, Order, Settings } from './api'
import { PAYMENT_LABEL, baht, dateTimeLong } from './format'
import { Words } from './ui'

/** Kitten id → its code and name, so a kitten's line names the kitten */
export type UnitNames = Record<string, { code: string; name: string }>

export function Receipt({ order, settings, customer, units }: { order: Order; settings: Settings; customer?: Customer | null; units?: UnitNames }) {
  const items = order.lines.reduce((s, l) => s + l.qty, 0)
  const p = order.payment
  return (
    <article className="receipt" aria-label={`ใบเสร็จ ${order.no}`}>
      <header className="receipt__head">
        <p className="receipt__store">{settings.storeName}</p>
        <p>{settings.branch}</p>
        <p>{settings.address}</p>
        <p>โทร {settings.phone}</p>
        <p>เลขประจำตัวผู้เสียภาษี {settings.taxId}</p>
      </header>

      <p className="receipt__kind">ใบเสร็จรับเงิน/ใบกำกับภาษีอย่างย่อ</p>
      {order.status === 'refunded' && <p className="receipt__void">คืนเงินแล้ว</p>}

      <dl className="receipt__meta">
        <div>
          <dt>เลขที่</dt>
          <dd className="receipt__no">{order.no}</dd>
        </div>
        <div>
          <dt>วันที่</dt>
          <dd>{dateTimeLong(order.createdAt)}</dd>
        </div>
        <div>
          <dt>พนักงาน</dt>
          <dd>{order.staffName}</dd>
        </div>
        <div>
          <dt>ลูกค้า</dt>
          <dd>
            <Words text={order.customerName ?? 'ลูกค้าทั่วไป'} />
          </dd>
        </div>
        {customer?.taxId && (
          <div>
            <dt>เลขผู้เสียภาษีลูกค้า</dt>
            <dd>{customer.taxId}</dd>
          </div>
        )}
      </dl>

      <table className="receipt__lines">
        <caption className="visually-hidden">รายการสินค้า</caption>
        <thead>
          <tr>
            <th scope="col">รายการ</th>
            <th scope="col" className="num">
              จำนวนเงิน
            </th>
          </tr>
        </thead>
        <tbody>
          {order.lines.map((l, i) => (
            <tr key={`${l.productId}-${i}`}>
              <td>
                <span className="receipt__item">
                  <Words text={l.name} />
                </span>
                {l.unitIds?.map((u) => (
                  <span key={u} className="receipt__qty">
                    ลูกแมว {units?.[u] ? `${units[u].code} น้อง${units[u].name}` : `รหัส ${u}`}
                  </span>
                ))}
                <span className="receipt__qty">
                  {l.qty} × {baht(l.unitPrice)}
                  {l.discount > 0 && <> ลด {baht(l.discount)}</>}
                </span>
              </td>
              <td className="num">{baht(l.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="receipt__sum">
        <div>
          <dt>รวม {items} ชิ้น</dt>
          <dd>{baht(order.subtotal)}</dd>
        </div>
        {order.lineDiscount > 0 && (
          <div>
            <dt>ส่วนลดรายการ</dt>
            <dd>−{baht(order.lineDiscount)}</dd>
          </div>
        )}
        {order.billDiscount > 0 && (
          <div>
            <dt>ส่วนลดท้ายบิล</dt>
            <dd>−{baht(order.billDiscount)}</dd>
          </div>
        )}
        <div className="receipt__total">
          <dt>ยอดสุทธิ</dt>
          <dd>{baht(order.total)}</dd>
        </div>
        {order.depositApplied ? (
          <>
            <div>
              <dt>หักเงินมัดจำ{order.reservationNo ? ` (การจอง ${order.reservationNo})` : ''}</dt>
              <dd>−{baht(order.depositApplied)}</dd>
            </div>
            <div>
              <dt>ชำระครั้งนี้</dt>
              <dd>{baht(p.amount)}</dd>
            </div>
          </>
        ) : null}
        <div>
          <dt>มูลค่าก่อน VAT</dt>
          <dd>{baht(order.beforeVat)}</dd>
        </div>
        <div>
          <dt>VAT {order.vatRate}% (รวมในราคาแล้ว)</dt>
          <dd>{baht(order.vat)}</dd>
        </div>
      </dl>

      <dl className="receipt__sum receipt__pay">
        <div>
          <dt>ชำระด้วย</dt>
          <dd>{PAYMENT_LABEL[p.method]}</dd>
        </div>
        {p.tendered !== null && (
          <div>
            <dt>รับเงิน</dt>
            <dd>{baht(p.tendered)}</dd>
          </div>
        )}
        {p.change !== null && (
          <div>
            <dt>เงินทอน</dt>
            <dd>{baht(p.change)}</dd>
          </div>
        )}
        {p.cardLast4 && (
          <div>
            <dt>บัตร</dt>
            <dd>**** {p.cardLast4}</dd>
          </div>
        )}
        {p.reference && (
          <div>
            <dt>{p.method === 'card' ? 'รหัสอนุมัติ' : 'เลขอ้างอิง'}</dt>
            <dd>{p.reference}</dd>
          </div>
        )}
      </dl>

      {order.refund && (
        <p className="receipt__note">
          คืนเงินเมื่อ {dateTimeLong(order.refund.at)} โดย {order.refund.staffName} อนุมัติโดย {order.refund.approvedBy} เหตุผล: {order.refund.reason}
        </p>
      )}
      {order.note && <p className="receipt__note">หมายเหตุ: {order.note}</p>}
      <p className="receipt__foot">{settings.receiptFooter}</p>
      <p className="receipt__sim">ระบบจำลอง ไม่ใช่เอกสารทางภาษีจริง</p>
    </article>
  )
}

/** Prints only the slip: the print stylesheet hides everything outside .print-target. */
export function printReceipt() {
  document.documentElement.classList.add('printing-receipt')
  const done = () => {
    document.documentElement.classList.remove('printing-receipt')
    window.removeEventListener('afterprint', done)
  }
  window.addEventListener('afterprint', done)
  window.print()
}

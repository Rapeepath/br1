// The back-office frame: an apricot sidebar on desktop, a five-tab bar on phones (the rest under "เมนู").
import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import {
  CalendarDays,
  Cat,
  ChartColumn,
  ExternalLink,
  History,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareQuote,
  Moon,
  Package,
  ReceiptText,
  Settings,
  ShoppingBasket,
  Sun,
  Users,
  Wallet,
} from 'lucide-react'
import { OddEyes } from '../components/OddEyes'
import { useTheme } from '../lib/theme'
import { useApi, type Dashboard } from './api'
import { useSession } from './context'
import { ROLE_LABEL, timeOnly } from './format'
import { Avatar, Dialog } from './ui'

type CrmKey = 'newLeads' | 'bookingsToday' | 'reservationsHeld' | 'pendingReviews'

/** The menu in three groups; CRM items carry a count of what is waiting for someone. */
export const NAV_GROUPS: { title: string; items: { to: string; label: string; short: string; end: boolean; Icon: typeof LayoutDashboard; count?: CrmKey; countLabel?: string }[] }[] = [
  {
    title: 'หน้าร้าน',
    items: [
      { to: '/', label: 'ภาพรวม', short: 'ภาพรวม', end: true, Icon: LayoutDashboard },
      { to: '/pos', label: 'ขายหน้าร้าน', short: 'ขาย', end: false, Icon: ShoppingBasket },
      { to: '/orders', label: 'รายการขาย', short: 'บิลขาย', end: false, Icon: ReceiptText },
      { to: '/products', label: 'สินค้าและสต็อก', short: 'สินค้า', end: false, Icon: Package },
      { to: '/customers', label: 'ลูกค้า', short: 'ลูกค้า', end: false, Icon: Users },
    ],
  },
  {
    title: 'ลูกค้าสัมพันธ์',
    items: [
      { to: '/leads', label: 'ลูกค้าที่สนใจ', short: 'สนใจ', end: false, Icon: Inbox, count: 'newLeads', countLabel: 'รายใหม่' },
      { to: '/bookings', label: 'นัดหมาย', short: 'นัด', end: false, Icon: CalendarDays, count: 'bookingsToday', countLabel: 'นัดวันนี้' },
      { to: '/kittens', label: 'ลูกแมวและการจอง', short: 'ลูกแมว', end: false, Icon: Cat, count: 'reservationsHeld', countLabel: 'การจองที่ยังเปิดอยู่' },
      { to: '/reviews', label: 'รีวิว', short: 'รีวิว', end: false, Icon: MessageSquareQuote, count: 'pendingReviews', countLabel: 'รอตรวจ' },
    ],
  },
  {
    title: 'หลังบ้าน',
    items: [
      { to: '/shifts', label: 'กะและเงินสด', short: 'กะ', end: false, Icon: Wallet },
      { to: '/reports', label: 'รายงาน', short: 'รายงาน', end: false, Icon: ChartColumn },
      { to: '/activity', label: 'บันทึกกิจกรรม', short: 'บันทึก', end: false, Icon: History },
      { to: '/settings', label: 'ตั้งค่า', short: 'ตั้งค่า', end: false, Icon: Settings },
    ],
  },
]

export const NAV = NAV_GROUPS.flatMap((g) => g.items)

/** Phones keep the four screens used most at the till in the tab bar. */
const TABS = NAV.slice(0, 4)

const sectionOf = (pathname: string) => (pathname.startsWith('/stock') ? '/products' : pathname.startsWith('/reservations') ? '/kittens' : pathname)

/** What is waiting in the CRM screens, refreshed on every move between screens. */
function useCrmCounts() {
  const { pathname } = useLocation()
  // The query string only makes each screen change ask again; the server ignores it
  const { data } = useApi<Dashboard>(`/dashboard?for=${encodeURIComponent(pathname)}`)
  return data?.crm
}

function NavList({ onPick }: { onPick?: () => void }) {
  const { pathname } = useLocation()
  const counts = useCrmCounts()
  const section = sectionOf(pathname)
  return (
    <>
      {NAV_GROUPS.map((g) => (
        <div key={g.title} role="group" aria-label={g.title}>
          <p className="side-nav__group" aria-hidden="true">
            {g.title}
          </p>
          <ul className="side-nav__list">
            {g.items.map(({ to, label, end, Icon, count, countLabel }) => {
              const n = count ? (counts?.[count] ?? 0) : 0
              return (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    onClick={onPick}
                    className={({ isActive }) => (isActive || (to !== '/' && section === to) ? 'active' : undefined)}
                  >
                    <Icon size={19} strokeWidth={2.2} aria-hidden />
                    <span>{label}</span>
                    {n > 0 && (
                      <span className="nav-count">
                        {n}
                        <span className="visually-hidden"> {countLabel}</span>
                      </span>
                    )}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </>
  )
}

function ShiftPill() {
  const { shift } = useSession()
  return (
    <Link to="/shifts" className={`shift-pill ${shift ? 'shift-pill--open' : 'shift-pill--closed'}`}>
      <span className="shift-pill__dot" aria-hidden="true" />
      {shift ? (
        <span>
          กะ #{shift.no} เปิดอยู่<span className="shift-pill__since"> ตั้งแต่ {timeOnly(shift.openedAt)}</span>
        </span>
      ) : (
        <span>ยังไม่เปิดกะ</span>
      )}
    </Link>
  )
}

function StaffCard() {
  const { staff, logout } = useSession()
  return (
    <div className="staff-card">
      <Avatar name={staff.name} tone={staff.tone} size={40} />
      <div className="staff-card__who">
        <p className="staff-card__name">{staff.name}</p>
        <p className="staff-card__role">
          {staff.title} ({ROLE_LABEL[staff.role]})
        </p>
      </div>
      <button type="button" className="icon-btn" onClick={logout} aria-label="ออกจากระบบ" title="ออกจากระบบ">
        <LogOut size={19} aria-hidden />
      </button>
    </div>
  )
}

function useRouteFocus() {
  const { pathname } = useLocation()
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    window.scrollTo({ top: 0 })
    const h1 = document.querySelector<HTMLElement>('#main h1')
    if (h1) {
      h1.setAttribute('tabindex', '-1')
      h1.focus({ preventScroll: true })
    }
  }, [pathname])
}

export function Shell() {
  const { meta, staff } = useSession()
  const { theme, toggle } = useTheme()
  const [menu, setMenu] = useState(false)
  const { pathname } = useLocation()
  useRouteFocus()

  const skip = (e: MouseEvent) => {
    e.preventDefault()
    document.getElementById('main')?.focus()
  }

  const themeButton = (
    <button type="button" className="icon-btn icon-btn--butter" onClick={toggle} aria-label={theme === 'dark' ? 'เปลี่ยนเป็นธีมสว่าง' : 'เปลี่ยนเป็นธีมมืด'}>
      {theme === 'dark' ? <Sun size={19} aria-hidden /> : <Moon size={19} aria-hidden />}
    </button>
  )

  return (
    <div className={`admin ${pathname === '/pos' ? 'admin--pos' : ''}`}>
      <a className="skip-link" href="#main" onClick={skip}>
        ข้ามไปยังเนื้อหา
      </a>

      <aside className="side" aria-label="เมนูหลังร้าน">
        <Link to="/" className="side__brand">
          <OddEyes size={20} />
          <span>
            <span className="side__name">Maew</span>
            <span className="side__sub">หลังร้าน</span>
          </span>
        </Link>
        <nav className="side-nav" aria-label="เมนูหลัก">
          <NavList />
        </nav>
        <div className="side__foot">
          <StaffCard />
          <a className="side__site" href="../">
            <ExternalLink size={16} aria-hidden /> ไปหน้าเว็บไซต์
          </a>
        </div>
      </aside>

      <header className="topbar">
        <Link to="/" className="topbar__brand" aria-label="Maew หลังร้าน หน้าภาพรวม">
          <OddEyes size={16} />
        </Link>
        <div className="topbar__store">
          <p className="topbar__name">{meta.settings.storeName}</p>
          <p className="topbar__branch">{meta.settings.branch}</p>
        </div>
        <ShiftPill />
        <div className="topbar__me">
          <Avatar name={staff.name} tone={staff.tone} size={34} />
          <span className="topbar__me-name">{staff.name}</span>
        </div>
        {themeButton}
      </header>

      <main id="main" tabIndex={-1} className="main">
        <Outlet />
      </main>

      <nav className="tabbar" aria-label="เมนูลัด">
        <ul>
          {TABS.map(({ to, short, end, Icon }) => (
            <li key={to}>
              <NavLink to={to} end={end} className={({ isActive }) => (isActive || (to === '/products' && sectionOf(pathname) === '/products') ? 'active' : undefined)}>
                <Icon size={21} strokeWidth={2.2} aria-hidden />
                <span>{short}</span>
              </NavLink>
            </li>
          ))}
          <li>
            <button type="button" onClick={() => setMenu(true)} aria-haspopup="dialog">
              <Menu size={21} strokeWidth={2.2} aria-hidden />
              <span>เมนู</span>
            </button>
          </li>
        </ul>
      </nav>

      <Dialog open={menu} onClose={() => setMenu(false)} title="เมนูหลังร้าน" className="dialog--sheet">
        <nav className="side-nav side-nav--sheet" aria-label="เมนูทั้งหมด">
          <NavList onPick={() => setMenu(false)} />
        </nav>
        <StaffCard />
        <a className="side__site" href="../">
          <ExternalLink size={16} aria-hidden /> ไปหน้าเว็บไซต์
        </a>
      </Dialog>
    </div>
  )
}

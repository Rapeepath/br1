import { HashRouter, Link, Route, Routes } from 'react-router'
import { AuthProvider, CartProvider, ToastProvider, useAuth } from './context'
import { Activity } from './pages/Activity'
import { Bookings } from './pages/Bookings'
import { CustomerPage, Customers } from './pages/Customers'
import { Dashboard } from './pages/Dashboard'
import { KittenPage, Kittens } from './pages/Kittens'
import { LeadPage, Leads } from './pages/Leads'
import { Login } from './pages/Login'
import { OrderPage, Orders } from './pages/Orders'
import { Pos } from './pages/Pos'
import { ProductPage, Products, StockMovements } from './pages/Products'
import { Reports } from './pages/Reports'
import { ReservationPage, Reservations } from './pages/Reservations'
import { Reviews } from './pages/Reviews'
import { SettingsPage } from './pages/Settings'
import { Shifts } from './pages/Shifts'
import { Shell } from './Shell'
import { Loading, PageHead } from './ui'

function NotFound() {
  return (
    <section className="page">
      <PageHead title="ไม่พบหน้านี้" lead="ลิงก์อาจพิมพ์ผิดหรือหน้านี้ถูกย้ายแล้ว" />
      <Link className="btn btn-primary" to="/">
        กลับไปหน้าภาพรวม
      </Link>
    </section>
  )
}

function Gate() {
  const { staff, booting } = useAuth()
  if (booting) {
    return (
      <main className="boot" id="main">
        <Loading label="กำลังเปิดระบบหลังร้าน" />
      </main>
    )
  }
  if (!staff) return <Login />
  return (
    <CartProvider>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<Dashboard />} />
          <Route path="pos" element={<Pos />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderPage />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductPage />} />
          <Route path="stock" element={<StockMovements />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/:id" element={<CustomerPage />} />
          <Route path="leads" element={<Leads />} />
          <Route path="leads/:id" element={<LeadPage />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="kittens" element={<Kittens />} />
          <Route path="kittens/:id" element={<KittenPage />} />
          <Route path="reservations" element={<Reservations />} />
          <Route path="reservations/:id" element={<ReservationPage />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="shifts" element={<Shifts />} />
          <Route path="reports" element={<Reports />} />
          <Route path="activity" element={<Activity />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </CartProvider>
  )
}

export default function AdminApp() {
  return (
    <HashRouter useTransitions={false}>
      <ToastProvider>
        <AuthProvider>
          <Gate />
        </AuthProvider>
      </ToastProvider>
    </HashRouter>
  )
}

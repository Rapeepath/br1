import { useEffect, useRef, type MouseEvent } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { Cat, ClipboardCheck, LibraryBig, Moon, Scale, Sun } from 'lucide-react'
import { market } from '../data'
import { localePath, useLang, useT, type DictKey } from '../i18n'
import { useCompare } from '../lib/compare'
import { formatMonthTh } from '../lib/format'
import { useRouteMeta } from '../lib/seo'
import { useTheme } from '../lib/theme'
import { CompareTray } from './CompareTray'
import { OddEyes } from './OddEyes'
import { FloatingContact, FooterShopLinks, FooterStore } from './shop/SiteShop'
import './Layout.css'

// Icons only show on phones, where the menu becomes an icon-over-label tab row (see Layout.css)
const NAV: { to: string; label: DictKey; end: boolean; Icon: typeof Cat }[] = [
  { to: '/', label: 'nav.models', end: true, Icon: Cat },
  { to: '/compare', label: 'nav.compare', end: false, Icon: Scale },
  { to: '/guide', label: 'nav.guide', end: false, Icon: ClipboardCheck },
  { to: '/sources', label: 'nav.sources', end: false, Icon: LibraryBig },
]

const monthEn = (yyyyMm: string) =>
  new Date(`${yyyyMm}-01T00:00:00Z`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })

/** The same page in the other language: a plain link, since the language is set when a page loads. */
function LangSwitch() {
  const lang = useLang()
  const t = useT()
  const { pathname, search } = useLocation()
  const other = lang === 'en' ? 'th' : 'en'
  return (
    <a className="lang-switch" href={localePath(pathname, other) + search} hrefLang={other} lang={other} title={t('shell.langSwitchLabel')}>
      {t('shell.langSwitch')}
    </a>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    window.scrollTo({ top: 0 })
    // Start keyboard and screen reader users at the new page's heading (falls back to <main>).
    const main = document.getElementById('main')
    const h1 = main?.querySelector<HTMLElement>('h1')
    if (h1) {
      h1.setAttribute('tabindex', '-1')
      h1.focus({ preventScroll: true })
    } else {
      main?.focus({ preventScroll: true })
    }
  }, [pathname])
  return null
}

export function Layout() {
  const { theme, toggle } = useTheme()
  const { ids } = useCompare()
  const { pathname } = useLocation()
  const lang = useLang()
  const t = useT()
  useRouteMeta()

  const skipToMain = (e: MouseEvent) => {
    e.preventDefault()
    document.getElementById('main')?.focus()
  }

  return (
    <>
      <a className="skip-link" href="#main" onClick={skipToMain}>
        {t('shell.skip')}
      </a>
      <ScrollToTop />

      <header className="site-header">
        <div className="container site-header__inner">
          <Link to="/" className="wordmark">
            <OddEyes />
            <span className="wordmark__text">
              <span className="wordmark__name">Maew</span>
              <span className="wordmark__sub" lang="en">
                {t('site.wordmarkSub')}
              </span>
            </span>
          </Link>

          <nav className="site-nav" aria-label={t('shell.menu')}>
            <ul>
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    // Breed pages belong to the catalogue section, so keep "สายพันธุ์" highlighted there.
                    className={({ isActive }) =>
                      isActive || (item.to === '/' && pathname.startsWith('/breeds/')) ? 'active' : undefined
                    }
                  >
                    <span className="site-nav__icon" aria-hidden="true">
                      <item.Icon size={18} strokeWidth={2.25} />
                    </span>
                    <span className="site-nav__label">{t(item.label)}</span>
                    {/* After the label in reading order; phones only draw it on the icon's corner */}
                    {item.to === '/compare' && ids.length > 0 && (
                      <span className="site-nav__count" aria-label={t('shell.compareCount', { count: ids.length })}>
                        {ids.length}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <button
            type="button"
            className="theme-toggle"
            onClick={toggle}
            aria-label={theme === 'dark' ? t('shell.themeToLight') : t('shell.themeToDark')}
          >
            {theme === 'dark' ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
          </button>

          <LangSwitch />

          <Link to="/contact" className="btn btn-primary btn-sm site-header__cta">
            {t('shell.cta')}
          </Link>
        </div>
      </header>

      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="site-footer__inner">
            <div className="site-footer__brand">
              <Link to="/" className="wordmark wordmark--lg" aria-label={t('shell.home')}>
                <OddEyes size={26} />
                <span className="wordmark__name">Maew</span>
              </Link>
              <p>{t('footer.blurb')}</p>
            </div>
            <nav aria-labelledby="footer-nav-title">
              <p id="footer-nav-title" className="site-footer__title">
                {t('footer.menu')}
              </p>
              <ul className="site-footer__links">
                {NAV.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to}>{t(item.label)}</Link>
                  </li>
                ))}
              </ul>
            </nav>
            <FooterShopLinks />
            <FooterStore />
          </div>
          <p className="site-footer__note">{t('footer.simulation')}</p>
          <div className="site-footer__bottom">
            {lang === 'en' ? (
              <p>
                {t('footer.photos')} <Link to="/sources">{t('nav.sources')}</Link> page.
              </p>
            ) : (
              <p>
                ภาพจาก Wikimedia Commons ดูเครดิตที่หน้า <Link to="/sources">แหล่งข้อมูล</Link>
              </p>
            )}
            <p>{t('footer.updated', { date: lang === 'en' ? monthEn(market.asOf) : formatMonthTh(market.asOf) })}</p>
          </div>
        </div>
      </footer>

      <CompareTray />
      <FloatingContact />
    </>
  )
}

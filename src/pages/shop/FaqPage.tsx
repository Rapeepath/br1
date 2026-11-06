import { Link } from 'react-router'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { useLang } from '../../i18n'
import { ShopHead } from '../../components/shop/ShopHead'
import { ContactButtons } from '../../components/shop/StoreDetails'
import { faqGroups } from './faqData'
import './shop-pages.css'
import './faq.css'

const COPY = {
  th: {
    title: 'คำถามที่พบบ่อย',
    tint: 'ก่อนรับน้องกลับบ้าน',
    lede: 'เรื่องการจอง มัดจำ วัคซีน การรับประกัน การชำระเงิน และการรับน้อง ไม่เจอคำตอบที่ต้องการ ถามร้านได้โดยตรง',
    notFound: 'ยังมีคำถามอีกไหม',
    notFoundBody: 'ส่งคำถามถึงร้าน หรือโทรและทัก LINE ได้ในเวลาเปิดทำการ',
    ask: 'ส่งคำถามถึงร้าน',
    groups: 'หมวดคำถาม',
  },
  en: {
    title: 'Frequently asked questions',
    tint: 'Before your kitten comes home',
    lede: 'Reserving, deposits, vaccines, the health guarantee, paying and collecting. Can’t find your answer? Ask the shop directly.',
    notFound: 'Still have a question?',
    notFoundBody: 'Send the shop a question, or call or message us on LINE during opening hours.',
    ask: 'Ask the shop',
    groups: 'Topics',
  },
}

export function FaqPage() {
  const lang = useLang()
  const c = COPY[lang]
  const groups = faqGroups(lang)
  return (
    <>
      <ShopHead title={c.title} tint={c.tint} lede={c.lede} />
      <section className="shop-band">
        <div className="container faq-layout">
          <nav className="faq-toc shop-sheet" aria-label={c.groups}>
            <ul>
              {groups.map((g) => (
                <li key={g.id}>
                  <a href={`#faq-${g.id}`}>{g.title}</a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="faq-groups">
            {groups.map((g) => (
              <section key={g.id} id={`faq-${g.id}`} className="faq-group" aria-labelledby={`faq-${g.id}-title`}>
                <h2 id={`faq-${g.id}-title`}>{g.title}</h2>
                <div className="faq-list">
                  {g.items.map((item) => (
                    <details key={item.id} className="faq-item" id={`faq-${g.id}-${item.id}`}>
                      <summary>
                        <span>{item.q}</span>
                        <ChevronDown size={20} aria-hidden className="faq-item__chev" />
                      </summary>
                      <div className="faq-item__body">
                        <p>{item.a}</p>
                        {item.link && (
                          <Link to={item.link.to} className="link-arrow">
                            {item.link.label}
                            <ArrowRight size={16} aria-hidden />
                          </Link>
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            ))}
            <div className="shop-sheet shop-sheet--mint faq-more">
              <h2>{c.notFound}</h2>
              <p>{c.notFoundBody}</p>
              <div className="btn-row">
                <Link to="/contact" className="btn btn-primary">
                  {c.ask}
                </Link>
              </div>
              <ContactButtons />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

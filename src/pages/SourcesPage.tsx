import { Picture } from '../components/Picture'
import { Link } from 'react-router'
import { ArrowUpRight, Plus, Video } from 'lucide-react'
import { breeds, en, market as thaiMarket } from '../data'
import { useLang } from '../i18n'
import { localized } from '../i18n/content'
import { formatNumber } from '../lib/format'
import { month, pick, textLang } from '../lib/locale'
import './SourcesPage.css'

const COPY = {
  th: {
    h1a: 'แหล่งข้อมูล',
    h1b: 'และเครดิตภาพ',
    breedsTitle: 'ข้อมูลรายสายพันธุ์',
    breedsMeta: (b: number, r: string) => `${b} สายพันธุ์ รวม ${r} แหล่งอ้างอิง`,
    count: (n: number) => `${n} แหล่ง`,
    goTo: (name: string) => `ไปหน้า${name}`,
    marketTitle: 'ราคา ค่าใช้จ่าย วัคซีน และกฎหมาย',
    refs: (n: number) => `${n} แหล่งอ้างอิง`,
    photosTitle: 'เครดิตภาพถ่าย',
    photosLede: 'ภาพทั้งหมดจาก Wikimedia Commons ใช้ตามสัญญาอนุญาตที่ระบุ ภาพอาจถูกครอปเพื่อจัดวาง',
    by: 'ผู้ถ่าย',
    licence: 'สัญญาอนุญาต',
    galleryTitle: 'ภาพและวิดีโอในแกลเลอรี',
    galleryLede: (p: number, v: number) =>
      `ภาพเพิ่มเติม ${p} ภาพ และวิดีโอ ${v} คลิปในหน้าสายพันธุ์ จาก Wikimedia Commons ตามสัญญาอนุญาตของผู้สร้างแต่ละราย วิดีโอเปิดดูจาก Commons โดยตรง`,
    items: (n: number) => `${n} รายการ`,
    photo: 'ภาพ',
    video: 'วิดีโอ',
  },
  en: {
    h1a: 'Sources',
    h1b: 'and photo credits',
    breedsTitle: 'By breed',
    breedsMeta: (b: number, r: string) => `${b} breeds, ${r} references in all`,
    count: (n: number) => `${n} ${n === 1 ? 'source' : 'sources'}`,
    goTo: (name: string) => `Go to the ${name} page`,
    marketTitle: 'Prices, costs, vaccines and the law',
    refs: (n: number) => `${n} references`,
    photosTitle: 'Photo credits',
    photosLede: 'All photos are from Wikimedia Commons, used under the licences shown; some are cropped to fit the layout.',
    by: 'Photographer',
    licence: 'Licence',
    galleryTitle: 'Gallery photos and videos',
    galleryLede: (p: number, v: number) =>
      `${p} more photos and ${v} videos on the breed pages, from Wikimedia Commons under each creator’s licence. Videos stream straight from Commons.`,
    items: (n: number) => `${n} ${n === 1 ? 'item' : 'items'}`,
    photo: 'Photo',
    video: 'Video',
  },
}



export function SourcesPage() {
  const lang = useLang()
  const c = pick(COPY, lang)
  const market = lang === 'en' ? en.market : thaiMarket
  const list = breeds.map((b) => localized(b, lang))
  const nameOf = (b: (typeof list)[number]) => (lang === 'en' ? b.nameEn : b.nameTh)
  const breedRefs = breeds.reduce((n, b) => n + b.sources.length, 0)
  const galleryItems = breeds.flatMap((b) => b.gallery ?? [])
  const galleryVideos = galleryItems.filter((g) => g.kind === 'video').length

  return (
    <div className="sources">
      <header className="sources-head">
        <div className="container sources-head__inner">
          <div>
            <h1>
              {c.h1a}
              <br />
              <span className="tint">{c.h1b}</span>
            </h1>
          </div>
          {lang === 'en' ? (
            <p className="sources-head__lede">
              Breed information is compiled from international cat associations (CFA, TICA, FIFe, GCCF, WCF), research
              and veterinary sources; prices and costs come from Thai catteries, online marketplaces and media, as of{' '}
              {month(market.asOf, lang)}.
            </p>
          ) : (
            <p className="sources-head__lede">
              ข้อมูลสายพันธุ์เรียบเรียงจาก<wbr />
              <span className="nowrap">สมาคมแมวสากล</span> (CFA, TICA, FIFe, GCCF, WCF)
              งานวิจัยและแหล่งข้อมูลทางสัตวแพทย์
              ส่วนราคาและค่าใช้จ่ายรวบรวมจากฟาร์ม ตลาดออนไลน์ และสื่อในไทย ณ {month(market.asOf, lang)}
            </p>
          )}
        </div>
      </header>

      <section aria-labelledby="src-breeds" className="section section--band sources-sheet">
        <div className="container sources-split">
          <div className="sources-split__head">
            <h2 id="src-breeds">{c.breedsTitle}</h2>
            <p className="sources-split__meta">{c.breedsMeta(breeds.length, formatNumber(breedRefs))}</p>
          </div>
          <div className="sources-acc">
            {list.map((b) => (
              <details key={b.id}>
                <summary>
                  <Picture className="sources-acc__thumb" src={b.image.srcSmall} alt="" sizes="56px" style={b.image.focus ? { objectPosition: b.image.focus } : undefined} />
                  <span className="sources-acc__name">
                    {nameOf(b)}
                    <span className="sources-acc__en" lang={lang === 'en' ? 'th' : 'en'}>
                      {lang === 'en' ? breeds.find((x) => x.id === b.id)?.nameTh : b.nameEn}
                    </span>
                  </span>
                  <span className="chip sources-acc__count">{c.count(b.sources.length)}</span>
                  <span className="sources-acc__icon" aria-hidden="true">
                    <Plus size={16} />
                  </span>
                </summary>
                <div className="sources-acc__panel">
                  <ol>
                    {b.sources.map((s) => (
                      <li key={s.url}>
                        <a href={s.url} target="_blank" rel="noreferrer" lang={textLang(s.title, lang)}>
                          {s.title}
                        </a>
                      </li>
                    ))}
                  </ol>
                  <Link to={`/breeds/${b.id}`} className="link-arrow sources-acc__back">
                    {c.goTo(nameOf(b))}
                    <ArrowUpRight size={16} aria-hidden />
                  </Link>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="src-market" className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2 id="src-market">{c.marketTitle}</h2>
            </div>
            <p className="sources-count">{c.refs(market.sources.length)}</p>
          </div>
          <ol className="sources-list">
            {market.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noreferrer" lang={textLang(s.title, lang)}>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="src-images" className="section section--band sources-sheet">
        <div className="container">
          <div className="section-head">
            <div>
              <h2 id="src-images">{c.photosTitle}</h2>
            </div>
            <p>{c.photosLede}</p>
          </div>
          <ul className="credits">
            {list.map((b) => (
              <li key={b.id}>
                <div className="credits__media">
                  <Picture src={b.image.srcSmall} alt="" sizes="(max-width: 560px) 50vw, 200px" style={b.image.focus ? { objectPosition: b.image.focus } : undefined} />
                </div>
                <p className="credits__name">{nameOf(b)}</p>
                <dl className="credits__spec">
                  <div>
                    <dt>{c.by}</dt>
                    <dd lang={textLang(b.image.author, lang)}>{b.image.author}</dd>
                  </div>
                  <div>
                    <dt>{c.licence}</dt>
                    <dd>
                      <a href={b.image.page} target="_blank" rel="noreferrer">
                        {b.image.license}
                      </a>
                    </dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {galleryItems.length > 0 && (
        <section aria-labelledby="src-gallery" className="section">
          <div className="container sources-split">
            <div className="sources-split__head">
              <h2 id="src-gallery">{c.galleryTitle}</h2>
              <p className="sources-split__meta">{c.galleryLede(galleryItems.length - galleryVideos, galleryVideos)}</p>
            </div>
            <div className="sources-acc">
              {list
                .filter((b) => b.gallery?.length)
                .map((b) => (
                  <details key={b.id}>
                    <summary>
                      <Picture className="sources-acc__thumb" src={b.gallery[0].srcSmall} alt="" sizes="56px" style={b.gallery[0].focus ? { objectPosition: b.gallery[0].focus } : undefined} />
                      <span className="sources-acc__name">{nameOf(b)}</span>
                      <span className="chip sources-acc__count">{c.items(b.gallery.length)}</span>
                      <span className="sources-acc__icon" aria-hidden="true">
                        <Plus size={16} />
                      </span>
                    </summary>
                    <div className="sources-acc__panel">
                      <ol className="gallery-credits">
                        {b.gallery.map((g) => (
                          <li key={g.src}>
                            <span className="gallery-credits__kind">
                              {g.kind === 'video' && <Video size={14} aria-hidden />}
                              {g.kind === 'video' ? c.video : c.photo}
                            </span>{' '}
                            <span className="gallery-credits__alt">{g.alt}</span>{' '}
                            <span className="gallery-credits__by">
                              <span lang={textLang(g.author, lang)}>{g.author}</span>,{' '}
                              <a href={g.page} target="_blank" rel="noreferrer">
                                {g.license}
                              </a>
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </details>
                ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

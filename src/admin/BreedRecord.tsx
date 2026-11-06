// Everything the brochure knows about a breed, laid out for the shop floor (from GET /api/products/:id).
import { COAT_LABEL, CONFIDENCE_LABEL, GROUP_LABEL, RATING_GROUPS, RATING_LABEL, SIZE_LABEL, formatPrice, formatRange, overallWeight } from '../lib/format'
import { RATING_KEYS, type Breed } from '../lib/types'

function List({ items }: { items: string[] }) {
  if (!items.length) return <p className="empty-line">ไม่มีข้อมูล</p>
  return (
    <ul className="bullets">
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  )
}

export function BreedRecord({ record }: { record: Record<string, unknown> }) {
  const b = record as unknown as Breed
  if (!b.nameTh || !Array.isArray(b.health)) return null
  return (
    <section className="record" aria-labelledby="record-title">
      <div className="block__head">
        <h2 id="record-title">ข้อมูลสายพันธุ์{b.nameTh}</h2>
        <a href={`../#/breeds/${b.id}`}>เปิดหน้านี้ในเว็บไซต์</a>
      </div>
      <p className="record__tagline">{b.tagline}</p>

      <div className="grid-2">
        <div className="panel pad">
          <h3>ข้อมูลหลัก</h3>
          <dl className="facts">
            <div>
              <dt>ชื่อ</dt>
              <dd>
                {b.nameTh} <span lang="en">({b.nameEn})</span>
              </dd>
            </div>
            <div>
              <dt>กลุ่ม</dt>
              <dd>{GROUP_LABEL[b.group]}</dd>
            </div>
            <div>
              <dt>ถิ่นกำเนิด</dt>
              <dd>{b.origin}</dd>
            </div>
            <div>
              <dt>สมาคมที่รับรอง</dt>
              <dd>{b.recognizedBy.length ? b.recognizedBy.join(', ') : 'ยังไม่มีสมาคมรับรอง'}</dd>
            </div>
            <div>
              <dt>ขนาด</dt>
              <dd>{SIZE_LABEL[b.size]}</dd>
            </div>
            <div>
              <dt>น้ำหนักเพศเมีย</dt>
              <dd>{formatRange(b.weightKg.female, 'กก.') ?? 'ไม่ระบุ'}</dd>
            </div>
            <div>
              <dt>น้ำหนักเพศผู้</dt>
              <dd>{formatRange(b.weightKg.male, 'กก.') ?? formatRange(overallWeight(b.weightKg), 'กก.') ?? 'ไม่ระบุ'}</dd>
            </div>
            <div>
              <dt>อายุขัย</dt>
              <dd>{formatRange(b.lifespanYears, 'ปี') ?? 'ไม่ระบุ'}</dd>
            </div>
            <div>
              <dt>ขน</dt>
              <dd>
                {COAT_LABEL[b.coat.length]} {b.coat.texture}
              </dd>
            </div>
            <div>
              <dt>สีขน</dt>
              <dd>{b.coat.colors.join(', ')}</dd>
            </div>
            {b.price && (
              <>
                <div>
                  <dt>ราคาตลาดในไทย</dt>
                  <dd>{formatPrice(b.price.min, b.price.max) ?? 'ไม่ระบุ'}</dd>
                </div>
                <div>
                  <dt>ความน่าเชื่อถือของราคา</dt>
                  <dd>{CONFIDENCE_LABEL[b.price.confidence]}</dd>
                </div>
              </>
            )}
          </dl>
          {b.price?.note && <p className="record__note">{b.price.note}</p>}
        </div>

        <div className="panel pad">
          <h3>คะแนนนิสัยและการดูแล</h3>
          {RATING_GROUPS.map((g) => (
            <div key={g.title} className="ratings">
              <p className="ratings__group">{g.title}</p>
              <ul>
                {g.keys
                  .filter((k) => RATING_KEYS.includes(k))
                  .map((k) => (
                    <li key={k}>
                      <span className="ratings__label">{RATING_LABEL[k]}</span>
                      <span className="ratings__meter" aria-hidden="true">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span key={i} className={i <= b.ratings[k] ? 'on' : undefined} />
                        ))}
                      </span>
                      <span className="ratings__value">{b.ratings[k]} จาก 5</span>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="panel pad prose-block">
        <h3>ภาพรวม</h3>
        <p>{b.summary}</p>
        <h3>ประวัติ</h3>
        <p>{b.history}</p>
        {b.funFact && (
          <>
            <h3>เกร็ดน่ารู้</h3>
            <p>{b.funFact}</p>
          </>
        )}
      </div>

      <div className="grid-2">
        <div className="panel pad">
          <h3>ลักษณะภายนอก</h3>
          <List items={b.appearance} />
          <h3>นิสัย</h3>
          <List items={b.temperament} />
        </div>
        <div className="panel pad">
          <h3>การดูแล</h3>
          <dl className="facts facts--stack">
            <div>
              <dt>การแปรงขน</dt>
              <dd>{b.care.grooming}</dd>
            </div>
            <div>
              <dt>การออกกำลัง</dt>
              <dd>{b.care.exercise}</dd>
            </div>
            <div>
              <dt>อาหาร</dt>
              <dd>{b.care.diet}</dd>
            </div>
            <div>
              <dt>สภาพแวดล้อม</dt>
              <dd>{b.care.environment}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="panel pad">
        <h3>สุขภาพที่ต้องระวัง</h3>
        {b.welfareNote && <p className="record__welfare">{b.welfareNote}</p>}
        <ul className="health">
          {b.health.map((h) => (
            <li key={h.name}>
              <p className="health__name">{h.name}</p>
              <p>{h.detail}</p>
              {h.screening && <p className="health__screen">การตรวจคัดกรอง: {h.screening}</p>}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid-2">
        <div className="panel pad">
          <h3>เหมาะกับใคร</h3>
          <List items={b.idealFor} />
        </div>
        <div className="panel pad">
          <h3>ข้อควรพิจารณาก่อนรับเลี้ยง</h3>
          <List items={b.considerations} />
        </div>
      </div>

      <div className="panel pad">
        <h3>แหล่งข้อมูลและเครดิตภาพ</h3>
        <ul className="bullets">
          {b.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.title}
              </a>
            </li>
          ))}
        </ul>
        <p className="record__note">
          ภาพโดย {b.image.author} สัญญาอนุญาต {b.image.license}{' '}
          <a href={b.image.page} target="_blank" rel="noreferrer">
            ดูต้นฉบับบน Wikimedia Commons
          </a>
        </p>
      </div>
    </section>
  )
}

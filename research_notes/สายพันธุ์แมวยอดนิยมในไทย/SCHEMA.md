# โครงสร้างข้อมูลการค้นคว้า (research_notes/สายพันธุ์แมวยอดนิยมในไทย)

`npm run data` (scripts/build-data.mjs) อ่านไฟล์ในโฟลเดอร์นี้ ตรวจ schema แล้วเขียน `src/data/breeds.json`,
`src/data/market.json` และ `src/data/en.json` ห้ามแก้ไฟล์ใน `src/data/*.json` ด้วยมือ ให้แก้ที่นี่แล้วรันคำสั่งใหม่
(การตรวจซ้ำอยู่ใน `src/data/data.test.ts`)

```
data/<breedId>.json      ข้อมูลภาษาไทยของแต่ละสายพันธุ์ (12 ไฟล์)
data/market.json         ราคาในไทย (prices[breedId]) คู่มือผู้ซื้อ วัคซีน กฎหมาย ค่าใช้จ่าย การรับเลี้ยง
i18n/en/<breedId>.json   ข้อความภาษาอังกฤษของสายพันธุ์ (หน้า /en)
i18n/en/market.json      ข้อความภาษาอังกฤษของ market.json
tools/fetch-gallery.py   ดาวน์โหลดภาพแกลเลอรีจาก Commons ใหม่ (เมื่อไฟล์ใน public/images/gallery/ หาย)
*.md                     บันทึกการค้นคว้า
```

## data/&lt;breedId&gt;.json

ฟิลด์หลัก: `id, nameTh, nameEn, group ('thai'|'international'), origin, recognizedBy[], tagline, summary, history,
size ('small'|'medium'|'large'), weightKg {female, male: [min,max]|null}, lifespanYears, coat {length, texture, colors[]},
appearance[], temperament[], ratings {energy … shedding: 1–5}, care {grooming, exercise, diet, environment},
health[] {name, detail, screening|null}, welfareNote|null, idealFor[], considerations[], funFact|null,
image {url, page, author, license}, gallery[], sources[] {title, url}`

### gallery[] — ภาพและวิดีโอเพิ่มเติมจาก Wikimedia Commons

ต่อสายพันธุ์มีภาพ 2–4 ภาพ (ไม่ซ้ำกับภาพหลัก `image`) และวิดีโอไม่เกิน 1 รายการ (เฉพาะที่เห็นสายพันธุ์ชัด)

| ฟิลด์ | ความหมาย |
|---|---|
| `kind` | `'image'` หรือ `'video'` |
| `src`, `srcSmall` | `images/gallery/<breedId>-<n>.jpg` กว้าง 1600 px และ `-sm.jpg` กว้าง 640 px (ไม่ขยายภาพที่เล็กกว่า) สำหรับวิดีโอคือภาพหน้าปก `<breedId>-video.jpg` |
| `width`, `height` | ขนาดของไฟล์ `src` (px) |
| `page` | หน้าไฟล์บน Commons `https://commons.wikimedia.org/wiki/File:…` |
| `author` | ชื่อผู้สร้างตาม Commons เป็นข้อความล้วน ไม่มี HTML |
| `license` | เฉพาะ `CC0`, `CC BY x.y`, `CC BY-SA x.y` หรือ `Public domain` |
| `alt` | คำบรรยายภาพภาษาไทย (ภาษาอังกฤษอยู่ใน `i18n/en/<breedId>.json` → `gallery[i].alt` ลำดับเดียวกัน) |
| `focus` | (ไม่บังคับ) CSS object-position เช่น `"40% 35%"` ให้หน้าแมวอยู่ในกรอบเมื่อครอปภาพย่อ |
| `video` | เฉพาะ `kind: 'video'`: `{ url, duration, width, height }` — `url` เป็นไฟล์ .webm บน upload.wikimedia.org (ไม่ดาวน์โหลดมาเก็บ) `duration` เป็นวินาที |

ภาพทำด้วย Pillow: ใช้ภาพย่อ 1920 px ของ Commons (หรือไฟล์ต้นฉบับถ้าเล็กกว่า) ย่อเป็น 1600/640 px คุณภาพ 82 แบบ progressive
และไม่มี metadata เพิ่ม/เปลี่ยนภาพ: แก้ `gallery` ในไฟล์ breed แล้วรัน `python tools/fetch-gallery.py` (ไฟล์ที่ขาด) ตามด้วย `npm run data`
ภาพหน้าปกวิดีโอใช้ภาพย่อของ Commons เลือกเฟรมได้ด้วย `POSTER_SEEK` ในสคริปต์

## i18n/en/&lt;breedId&gt;.json

แปลตรงตามภาษาไทย ไม่เพิ่มข้อเท็จจริง ตัวเลขและหน่วยคงเดิม สะกดแบบอเมริกัน ชื่อสายพันธุ์ตามรูปมาตรฐานภาษาอังกฤษ
ปีพุทธศักราชแปลงเป็นคริสต์ศักราช และเงินเขียนเป็น "25,000 baht"

```
{ id, origin, tagline, summary, history, coat {texture, colors[]}, appearance[], temperament[],
  care {grooming, exercise, diet, environment}, health[] {name, detail, screening|null}, welfareNote|null,
  idealFor[], considerations[], funFact|null, price {note}, gallery[] {alt} }
```

ทุก array ต้องยาวและเรียงเท่ากับภาษาไทย ค่า `null` ในภาษาไทยต้องเป็น `null` และห้ามมีอักษรไทย (build-data ตรวจให้)
`price.note` คือคำแปลของ `market.json → prices[breedId].note`

## i18n/en/market.json

```
{ priceFactors[], buyerChecklist[] {title, detail}, vaccineSchedule[] {age, vaccines, note|null}, legalNotes[],
  ownershipCost {monthly[] {item}, oneTime[] {item}}, adoption[] {name, detail} }
```

เรียงตรงกับ `data/market.json` ทุกรายการ (รวมรายการค่าใช้จ่ายต่อครั้งที่ build-data ตัดออกจากยอดรายเดือน)

## ผลลัพธ์ src/data/en.json

`{ records: { [breedId]: { nameEn, origin, tagline, …, coat, care, health, price, gallery } }, market: Market }`
— object ซ้อนกันมีครบทุกฟิลด์ (เช่น `coat.length`, ตัวเลข `price`, ทุกฟิลด์ของ `gallery`) จึงใช้ `{ ...breed, ...en.records[id] }`
ได้ทันที และ `market` มีรูปแบบเดียวกับ `src/data/market.json` (ตัวเลข ลิงก์ และแหล่งอ้างอิงมาจากฉบับไทย)

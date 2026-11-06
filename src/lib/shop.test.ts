import { describe, expect, it } from 'vitest'
import { breeds, market } from '../data'
import { contactErrors } from '../components/shop/form'
import { faqGroups, faqSchema } from '../pages/shop/faqData'
import { PAGES } from '../routes'
import { kittenPhoto, kittenText, parentParts, type Kitten } from './kittens'
import { ApiError, errorText } from './publicApi'
import {
  addDays,
  ageWeeks,
  bkkDay,
  bookingDays,
  costTotals,
  depositFor,
  firstYearRange,
  formatDay,
  hoursLines,
  icsFor,
  instalments,
  isOpenNow,
  isReserve,
  midpoint,
  money,
  moneyRange,
  readyDay,
  timeLeft,
} from './shop'
import type { OpeningHours } from './storeInfo'

const everyDay: OpeningHours[] = [0, 1, 2, 3, 4, 5, 6].map((day) => ({ day, open: '10:00', close: '20:00' }))
// 2026-11-06 is a Friday; 15:00 in Bangkok is 08:00 UTC
const FRI_3PM = new Date('2026-11-06T08:00:00Z')

describe('Bangkok calendar', () => {
  it('uses the Bangkok day, not the UTC one', () => {
    expect(bkkDay(new Date('2026-11-05T17:30:00Z'))).toBe('2026-11-06')
    expect(bkkDay(new Date('2026-11-05T16:59:00Z'))).toBe('2026-11-05')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
  })

  it('knows when the shop is open', () => {
    expect(isOpenNow(everyDay, FRI_3PM)).toBe(true)
    expect(isOpenNow(everyDay, new Date('2026-11-06T14:00:00Z'))).toBe(false) // 21:00
    expect(isOpenNow([], FRI_3PM)).toBe(false)
  })

  it('offers tomorrow to 21 days ahead and marks closed days', () => {
    const noSundays = everyDay.filter((h) => h.day !== 0)
    const days = bookingDays(noSundays, FRI_3PM, 21)
    expect(days).toHaveLength(21)
    expect(days[0].day).toBe('2026-11-07')
    expect(days.at(-1)!.day).toBe('2026-11-27')
    expect(days.find((d) => d.day === '2026-11-08')!.open).toBe(false) // a Sunday
    expect(days.filter((d) => !d.open)).toHaveLength(3)
  })

  it('summarises hours as one line when every day is the same', () => {
    expect(hoursLines(everyDay, 'th')).toEqual([{ days: 'ทุกวัน', time: '10:00–20:00' }])
    const lines = hoursLines([...everyDay.slice(1, 6), { day: 6, open: '09:00', close: '17:00' }], 'en')
    expect(lines).toEqual([
      { days: 'Mon–Fri', time: '10:00–20:00' },
      { days: 'Sat', time: '09:00–17:00' },
      { days: 'Sun', time: 'Closed' },
    ])
  })

  it('prints Thai dates in the Buddhist Era', () => {
    expect(formatDay('2026-11-06', 'th')).toContain('2569')
    expect(formatDay('2026-11-06', 'en')).toBe('6 November 2026')
  })
})

describe('calendar file', () => {
  it('stores the visit in UTC with its length', () => {
    const ics = icsFor({ uid: 'BK1', day: '2026-11-10', time: '14:00', durationMin: 60, title: 'Visit, kittens', location: 'Ari; Bangkok', description: 'x', now: FRI_3PM })
    expect(ics).toContain('DTSTART:20261110T070000Z')
    expect(ics).toContain('DTEND:20261110T080000Z')
    expect(ics).toContain('SUMMARY:Visit\\, kittens')
    expect(ics).toContain('LOCATION:Ari\\; Bangkok')
    expect(ics.split('\r\n')[0]).toBe('BEGIN:VCALENDAR')
  })
})

describe('kittens', () => {
  it('counts age in whole weeks and the day it can go home', () => {
    expect(ageWeeks('2026-08-14', FRI_3PM)).toBe(12)
    expect(ageWeeks('2026-08-15', FRI_3PM)).toBe(11)
    expect(readyDay('2026-08-15')).toBe('2026-11-07')
  })

  it('uses the shop’s deposit rule', () => {
    expect(depositFor(8000)).toBe(2000)
    expect(depositFor(40000)).toBe(2000)
    expect(depositFor(46000)).toBe(4600)
    expect(depositFor(57250)).toBe(5700)
  })

  it('counts down a hold', () => {
    expect(timeLeft('2026-11-06T09:30:00Z', FRI_3PM)).toMatchObject({ h: 1, m: 30 })
    expect(timeLeft('2026-11-06T07:00:00Z', FRI_3PM).ms).toBe(0)
  })

  const breed = breeds.find((b) => b.health.some((h) => h.screening && /DNA/.test(h.screening)))!
  const kitten: Kitten = {
    id: 'u1',
    code: 'K-X-0001',
    productId: `${breed.id}-pet`,
    refId: breed.id,
    breedName: breed.nameTh,
    grade: 'เกรดเลี้ยง',
    name: 'ข้าวปั้น',
    sex: 'female',
    color: breed.coat.colors[0],
    birthDate: '2026-08-14',
    ageWeeks: 12,
    microchip: true,
    vaccines: [{ name: 'วัคซีนรวมเข็มที่ 2', date: '2026-11-06' }],
    vetCheckAt: '2026-11-01',
    geneticTests: [{ name: breed.health.find((h) => h.screening && /DNA/.test(h.screening))!.name, result: 'negative' }],
    sire: `ภูผา (${breed.coat.colors[0]})`,
    dam: 'มณีจันทร์',
    photoIndex: 7,
    image: breed.image.srcSmall,
    price: 9000,
    deposit: 2000,
    status: 'available',
  }

  it('keeps Thai as recorded and words English where it can', () => {
    expect(kittenText(kitten, 'th').color).toBe(kitten.color)
    const en = kittenText(kitten, 'en')
    expect(en.breedName).toBe(breed.nameEn)
    expect(en.grade).toBe('Pet quality')
    expect(en.vaccines[0].name).toBe('Core vaccine, dose 2')
    // DNA test names fall back to the English in brackets when no translation file exists
    expect(en.tests[0].name).toMatch(/[A-Za-z]/)
    expect(en.sire.startsWith('ภูผา, ')).toBe(true)
    expect(kittenText(kitten, 'th').sire).toBe(`ภูผา สี${kitten.color}`)
    expect(parentParts('มหาสมุทร (บลูพอยต์ (Blue point))')).toEqual({ name: 'มหาสมุทร', color: 'บลูพอยต์ (Blue point)' })
    expect(parentParts('มณีจันทร์')).toEqual({ name: 'มณีจันทร์', color: null })
  })

  it('always finds a photo, wrapping the index around the breed’s photos', () => {
    expect(kittenPhoto(kitten)?.src).toBeTruthy()
    expect(kittenPhoto({ refId: 'nope', photoIndex: 0 })).toBeNull()
  })
})

describe('money and the cost calculator', () => {
  it('formats baht in each language', () => {
    expect(money(12500, 'th')).toBe('12,500 บาท')
    expect(money(12500, 'en')).toBe('THB 12,500')
    expect(moneyRange(1000, 2500, 'th')).toBe('1,000–2,500 บาท')
  })

  it('splits a price into 0% instalments that add back up', () => {
    for (const n of [3, 6, 10]) {
      const p = instalments(25000, n)
      expect(p.monthly * (n - 1) + p.last).toBe(25000)
      expect(p.last).toBeLessThanOrEqual(p.monthly)
      expect(p.last).toBeGreaterThan(0)
    }
  })

  it('totals the first year and keeps the emergency fund out', () => {
    const t = costTotals([500, 300], [2000, 1000], 9000)
    expect(t).toEqual({ monthly: 800, yearlyRunning: 9600, oneTime: 3000, firstYear: 12600, firstYearWithKitten: 21600 })
    const reserve = market.ownershipCost.oneTime.filter(isReserve)
    expect(reserve).toHaveLength(1)
    const [lo, hi] = firstYearRange(market.ownershipCost.monthly, market.ownershipCost.oneTime)
    expect(lo).toBeLessThan(hi)
    expect(hi).toBeLessThan(
      market.ownershipCost.oneTime.reduce((s, c) => s + c.max, 0) + 12 * market.ownershipCost.monthly.reduce((s, c) => s + c.max, 0),
    )
    expect(midpoint({ item: 'x', min: 80, max: 560 }, 10)).toBe(320)
  })
})

describe('forms', () => {
  it('asks for name, a real phone number and consent; email only when given', () => {
    expect(contactErrors({ name: '', phone: '', consent: false }, 'th')).toEqual({
      name: 'กรอกชื่อ',
      phone: 'กรอกเบอร์โทร',
      consent: expect.any(String),
    })
    expect(contactErrors({ name: 'A', phone: '12', consent: true }, 'en').phone).toMatch(/digits/)
    expect(contactErrors({ name: 'A', phone: '081-234-5678', email: 'x@', consent: true }, 'en').email).toBeTruthy()
    expect(contactErrors({ name: 'A', phone: '081-234-5678', email: '', consent: true }, 'en')).toEqual({})
  })

  it('shows API errors in the page’s language', () => {
    const err = new ApiError(409, 'น้องถูกจองแล้ว', 'UNIT_UNAVAILABLE', null, null)
    expect(errorText(err, 'th')).toBe('น้องถูกจองแล้ว')
    expect(errorText(err, 'en')).toMatch(/already been reserved/)
    expect(errorText(new ApiError(400, 'x', 'VALIDATION', 'Enter your name.', 'name'), 'en')).toBe('Enter your name.')
    expect(errorText(new Error('network'), 'en')).toMatch(/LINE/)
  })
})

describe('FAQ', () => {
  it('has the same questions in Thai and English, and every link goes to a real page', () => {
    const th = faqGroups('th')
    const en = faqGroups('en')
    expect(en.map((g) => g.items.map((i) => i.id))).toEqual(th.map((g) => g.items.map((i) => i.id)))
    const paths = new Set(PAGES.map((p) => `/${p.path}`.replace(/\/$/, '') || '/'))
    for (const g of [...th, ...en]) for (const i of g.items) if (i.link) expect(paths.has(i.link.to)).toBe(true)
  })

  it('builds FAQPage structured data from the same text', () => {
    const s = faqSchema('th') as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] }
    expect(s.mainEntity).toHaveLength(faqGroups('th').reduce((n, g) => n + g.items.length, 0))
    expect(s.mainEntity[0].acceptedAnswer.text.length).toBeGreaterThan(20)
  })
})

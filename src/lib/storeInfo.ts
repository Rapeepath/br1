// The shop's contact details as the brochure knows them without the POS (static hosting, prerender,
// JSON-LD). Mirrors the defaults in server/catalog.ts settings; the live values from /api/public/store
// replace these at runtime (useStoreInfo in lib/live.ts). Keep the two in step when either changes.

export interface OpeningHours {
  /** 0 = Sunday … 6 = Saturday */
  day: number
  open: string
  close: string
}

export interface StoreInfo {
  storeName: string
  branch: string
  address: string
  phone: string
  email: string
  lineId: string
  lineUrl: string
  mapUrl: string
  hours: OpeningHours[]
  taxId: string
  vatRate: number
}

const ADDRESS = '88/8 ซอยอารีย์ 2 ถนนพหลโยธิน แขวงพญาไท เขตพญาไท กรุงเทพฯ 10400'

export const STATIC_STORE: StoreInfo = {
  storeName: 'Maew Cat House',
  branch: 'สาขาอารีย์',
  address: ADDRESS,
  phone: '02-123-4567',
  email: 'hello@maew-cathouse.example',
  lineId: '@maewcathouse',
  lineUrl: 'https://line.me/R/ti/p/@maewcathouse',
  mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`,
  hours: [0, 1, 2, 3, 4, 5, 6].map((day) => ({ day, open: '10:00', close: '20:00' })),
  taxId: '0105569012345',
  vatRate: 7,
}

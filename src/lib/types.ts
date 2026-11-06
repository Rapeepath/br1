import type { GalleryItem } from '../data'

export type Range = [number, number]

export type Group = 'thai' | 'international'
export type Size = 'small' | 'medium' | 'large'
export type CoatLength = 'short' | 'medium' | 'long' | 'hairless'
export type Confidence = 'high' | 'medium' | 'low'

export const RATING_KEYS = [
  'energy',
  'affection',
  'vocal',
  'intelligence',
  'socialNeeds',
  'kidFriendly',
  'petFriendly',
  'grooming',
  'shedding',
] as const

export type RatingKey = (typeof RATING_KEYS)[number]

export interface Source {
  title: string
  url: string
}

export interface HealthItem {
  name: string
  detail: string
  screening: string | null
}

export interface BreedImage {
  src: string
  srcSmall: string
  page: string
  author: string
  license: string
  /** CSS object-position, used to keep the cat's face in frame on cropped plates */
  focus?: string
}

export interface Price {
  min: number | null
  max: number | null
  confidence: Confidence
  note: string
}

export interface Breed {
  id: string
  nameTh: string
  nameEn: string
  group: Group
  origin: string
  recognizedBy: string[]
  tagline: string
  summary: string
  history: string
  size: Size
  weightKg: { female: Range | null; male: Range | null }
  lifespanYears: Range | null
  coat: { length: CoatLength; texture: string; colors: string[] }
  appearance: string[]
  temperament: string[]
  ratings: Record<RatingKey, number>
  care: { grooming: string; exercise: string; diet: string; environment: string }
  health: HealthItem[]
  welfareNote: string | null
  /** True when the welfare note is serious enough to surface above the tabs (set in build-data). */
  welfareFlag?: boolean
  idealFor: string[]
  considerations: string[]
  funFact: string | null
  image: BreedImage
  /** Extra Commons photos and videos for the breed page's gallery (the main image is not repeated) */
  gallery: GalleryItem[]
  price: Price | null
  sources: Source[]
}

export interface CostItem {
  item: string
  min: number
  max: number
}

export interface Market {
  currency: 'THB'
  asOf: string
  priceFactors: string[]
  buyerChecklist: { title: string; detail: string }[]
  vaccineSchedule: { age: string; vaccines: string; note: string | null }[]
  legalNotes: string[]
  ownershipCost: { monthly: CostItem[]; oneTime: CostItem[] }
  adoption: { name: string; url: string; detail: string }[]
  sources: Source[]
}

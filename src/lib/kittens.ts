// Kittens as the shop's public API returns them, plus what the brochure adds: the breed photo to show,
// and English for the parts the shop records in Thai (colour, vaccines, DNA tests, grade).
import { useEffect, useState } from 'react'
import { getBreed } from '../data'
import type { Lang } from '../i18n'
import { localized } from '../i18n/content'
import type { Breed, BreedImage } from './types'
import { getPublic } from './publicApi'

export type Sex = 'male' | 'female'
export type GeneticResult = 'negative' | 'carrier' | 'not-tested'

export interface Kitten {
  id: string
  code: string
  productId: string
  refId: string
  breedName: string
  grade: string | null
  name: string
  sex: Sex
  color: string
  birthDate: string
  ageWeeks: number
  microchip: boolean
  vaccines: { name: string; date: string }[]
  vetCheckAt: string | null
  geneticTests: { name: string; result: GeneticResult }[]
  sire: string
  dam: string
  photoIndex: number
  image: string | null
  price: number
  deposit: number
  status: 'available' | 'reserved' | 'sold'
}

export interface Reservation {
  id: string
  no: string
  unitId: string
  createdAt: string
  holdUntil: string
  deposit: { amount: number; method: 'promptpay' | 'transfer' | null; reference: string | null; paidAt: string | null }
  customer: { name: string; phone: string; email: string | null; lineId: string | null; address: string | null }
  pickup: 'store' | 'delivery'
  note: string | null
  status: 'pending-payment' | 'held' | 'completed' | 'cancelled' | 'expired'
  kitten: Kitten | null
  payment: { promptpayRef: string; amount: number; simulated: true }
  token?: string
}

/** A photo in a breed's gallery (added by the content data); only images are used for kittens. */
interface GalleryItem {
  kind: 'image' | 'video'
  src: string
  srcSmall?: string
  alt?: string
  author?: string
  license?: string
  focus?: string
}

/** The kitten's photo: its breed's main photo or one of the breed gallery's, by photoIndex. */
export function kittenPhoto(k: Pick<Kitten, 'refId' | 'photoIndex'>): (BreedImage & { alt?: string }) | null {
  const breed = getBreed(k.refId)
  if (!breed) return null
  const gallery = ((breed as Breed & { gallery?: GalleryItem[] }).gallery ?? []).filter((g) => g.kind === 'image')
  const photos: (BreedImage & { alt?: string })[] = [
    breed.image,
    ...gallery.map((g) => ({
      src: g.src,
      srcSmall: g.srcSmall ?? g.src,
      page: '',
      author: g.author ?? '',
      license: g.license ?? '',
      focus: g.focus,
      alt: g.alt,
    })),
  ]
  return photos[Math.abs(k.photoIndex) % photos.length]
}

const VACCINE_EN: Record<string, string> = {
  'วัคซีนรวม (ไข้หัดแมว หวัดแมว) เข็มที่ 1': 'Core vaccine (panleukopenia, cat flu), dose 1',
  'วัคซีนรวมเข็มที่ 2': 'Core vaccine, dose 2',
  'วัคซีนรวมเข็มสุดท้าย และพิษสุนัขบ้าเข็มแรก': 'Final core vaccine and first rabies shot',
}

const GRADE_EN: Record<string, string> = { เกรดเลี้ยง: 'Pet quality', เกรดประกวด: 'Show quality' }

/** "ข้อความไทย (English name)" → "English name" */
const bracketed = (s: string) => s.match(/\(([^()]*[A-Za-z][^()]*)\)\s*$/)?.[1]?.trim() ?? null

/** The English for one of a breed's Thai coat colours, by its place in the breed's colour list. */
function colourEn(breed: Breed | undefined, color: string): string {
  if (!breed) return color
  const en = localized(breed, 'en')
  const i = breed.coat.colors.indexOf(color)
  return i >= 0 && en.coat.colors[i] && en.coat.colors[i] !== color ? en.coat.colors[i] : color
}

/**
 * "เจ้าขุน (บลูพอยต์ (Blue point))" → the parent's name and coat colour (the colour may carry its own
 * brackets, so split at the first one). Names stay as given; the colour is translated for English.
 */
export function parentParts(parent: string): { name: string; color: string | null } {
  const i = parent.indexOf(' (')
  if (i < 0 || !parent.trimEnd().endsWith(')')) return { name: parent, color: null }
  return { name: parent.slice(0, i).trim(), color: parent.trimEnd().slice(i + 2, -1).trim() }
}

function parentText(breed: Breed | undefined, parent: string, lang: Lang): string {
  const { name, color } = parentParts(parent)
  if (!color) return parent
  return lang === 'en' ? `${name}, ${colourEn(breed, color)}` : `${name} สี${color}`
}

function testEn(breed: Breed | undefined, name: string): string {
  if (breed) {
    const i = breed.health.findIndex((h) => h.name === name)
    const en = i >= 0 ? localized(breed, 'en').health[i]?.name : undefined
    if (en && en !== name) return en
  }
  return bracketed(name) ?? name
}

/** Everything about a kitten that is worded in the reader's language. */
export function kittenText(k: Kitten, lang: Lang) {
  const breed = getBreed(k.refId)
  if (lang === 'th') {
    return {
      breedName: breed?.nameTh ?? k.breedName,
      grade: k.grade,
      color: k.color,
      sire: parentText(breed, k.sire, 'th'),
      dam: parentText(breed, k.dam, 'th'),
      vaccines: k.vaccines,
      tests: k.geneticTests,
    }
  }
  return {
    breedName: breed?.nameEn ?? k.breedName,
    grade: k.grade ? (GRADE_EN[k.grade] ?? k.grade) : null,
    color: colourEn(breed, k.color),
    sire: parentText(breed, k.sire, 'en'),
    dam: parentText(breed, k.dam, 'en'),
    vaccines: k.vaccines.map((v) => ({ ...v, name: VACCINE_EN[v.name] ?? v.name })),
    tests: k.geneticTests.map((t) => ({ ...t, name: testEn(breed, t.name) })),
  }
}

export type LoadState<T> = { status: 'loading' } | { status: 'ready'; data: T } | { status: 'error'; error: unknown }

/** GET a public resource once (re-fetches when `path` changes). */
export function usePublic<T>(path: string | null): LoadState<T> & { reload: () => void } {
  const [state, setState] = useState<LoadState<T>>({ status: 'loading' })
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (!path) return
    let alive = true
    setState({ status: 'loading' })
    getPublic<T>(path).then(
      (data) => alive && setState({ status: 'ready', data }),
      (error) => alive && setState({ status: 'error', error }),
    )
    return () => {
      alive = false
    }
  }, [path, tick])
  return { ...state, reload: () => setTick((t) => t + 1) }
}

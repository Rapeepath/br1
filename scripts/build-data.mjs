// Builds the site's data from the research notes:
//   research_notes/<topic>/data/{breed}.json + market.json  →  src/data/breeds.json, src/data/market.json
//   research_notes/<topic>/i18n/en/{breed}.json + market.json  →  src/data/en.json
// and downloads each breed's main photo from Wikimedia Commons into public/images/.
// Gallery photos (public/images/gallery/) are fetched once by research_notes/<topic>/tools/fetch-gallery.py
// and only checked here. Field reference: research_notes/<topic>/SCHEMA.md
//
//   node scripts/build-data.mjs           (reuses images already downloaded)
//   node scripts/build-data.mjs --force   (re-downloads every main image)

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const notesDir = join(root, 'research_notes')
const topic = readdirSync(notesDir).find((d) => existsSync(join(notesDir, d, 'data', 'market.json')))
if (!topic) throw new Error('No research_notes/<topic>/data/market.json found')
const dataDir = join(notesDir, topic, 'data')
const enDir = join(notesDir, topic, 'i18n', 'en')
const publicDir = join(root, 'public')

const FORCE = process.argv.includes('--force')
const UA = 'MaewCatalogue/1.0 (static brochure build; https://commons.wikimedia.org/wiki/Commons:Reuse)'

/** Catalogue order for the "แนะนำ" sort: Thai heritage breeds first, then by popularity in Thailand. */
const ORDER = [
  'siamese',
  'korat',
  'khao-manee',
  'british-shorthair',
  'scottish-fold',
  'persian',
  'exotic-shorthair',
  'american-shorthair',
  'maine-coon',
  'ragdoll',
  'munchkin',
  'bengal',
]

/** object-position per photo so the face stays in frame on portrait crops (tuned by eye). */
const FOCUS = {
  persian: '30% 50%',
}

/**
 * Breeds whose welfare note is about the breed's defining trait or the law (fold gene, dwarfism,
 * extreme flat face, wild-hybrid generations), surfaced above the tabs. Every note still shows on
 * the health tab; most others are routine screening advice.
 */
const WELFARE_FLAG = new Set(['scottish-fold', 'munchkin', 'persian', 'exotic-shorthair', 'bengal'])

/** Items dropped from market.json: flagged by the researcher as unsourced or not a monthly cost. */
const DROP_MONTHLY = [/ต่อครั้ง/]

const RATING_KEYS = ['energy', 'affection', 'vocal', 'intelligence', 'socialNeeds', 'kidFriendly', 'petFriendly', 'grooming', 'shedding']

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8').replace(/^﻿/, ''))
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function thumbUrl(original, width) {
  // https://upload.wikimedia.org/wikipedia/commons/a/ab/File.jpg
  //   → https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/File.jpg/960px-File.jpg
  const m = original.match(/^(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons)\/(?!thumb\/)(\w\/\w\w)\/([^/]+)$/)
  if (!m) return original
  const [, base, hash, file] = m
  const name = /\.(png|jpe?g)$/i.test(file) ? file : `${file}.jpg`
  return `${base}/thumb/${hash}/${file}/${width}px-${name}`
}

async function download(url, dest) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } })
    if (res.ok) {
      writeFileSync(dest, Buffer.from(await res.arrayBuffer()))
      return true
    }
    if (res.status === 429 || res.status >= 500) {
      await sleep(2000 * attempt)
      continue
    }
    return false
  }
  return false
}

async function fetchImage(id, original) {
  const outDir = join(root, 'public', 'images')
  mkdirSync(outDir, { recursive: true })
  const targets = [
    { file: `${id}.jpg`, width: 960 },
    { file: `${id}-sm.jpg`, width: 500 },
  ]
  for (const t of targets) {
    const dest = join(outDir, t.file)
    if (!FORCE && existsSync(dest)) continue
    // A thumbnail wider than the original is refused, so fall back to the original file.
    const ok = (await download(thumbUrl(original, t.width), dest)) || (await download(original, dest))
    if (!ok) throw new Error(`Could not download image for ${id}: ${original}`)
    console.log(`  ↓ ${t.file}`)
    await sleep(600)
  }
  return { src: `images/${id}.jpg`, srcSmall: `images/${id}-sm.jpg` }
}

function check(cond, msg, problems) {
  if (!cond) problems.push(msg)
}

function validate(b, problems) {
  const p = (m) => `${b.id}: ${m}`
  for (const k of ['nameTh', 'nameEn', 'origin', 'tagline', 'summary', 'history']) check(typeof b[k] === 'string' && b[k].trim(), p(`missing ${k}`), problems)
  check(['thai', 'international'].includes(b.group), p('bad group'), problems)
  check(['small', 'medium', 'large'].includes(b.size), p('bad size'), problems)
  check(['short', 'medium', 'long', 'hairless'].includes(b.coat?.length), p('bad coat.length'), problems)
  for (const k of RATING_KEYS) check(Number.isInteger(b.ratings?.[k]) && b.ratings[k] >= 1 && b.ratings[k] <= 5, p(`rating ${k} not 1–5`), problems)
  for (const r of [b.weightKg?.female, b.weightKg?.male, b.lifespanYears]) {
    if (r != null) check(Array.isArray(r) && r.length === 2 && r[0] <= r[1], p('bad range'), problems)
  }
  check(Array.isArray(b.health) && b.health.length > 0, p('no health items'), problems)
  check(b.image?.url?.startsWith('https://'), p('no image url'), problems)
  check(Array.isArray(b.sources) && b.sources.length > 0, p('no sources'), problems)
  validateGallery(b, problems)
}

/** Free licences only: CC0, CC BY, CC BY-SA (any version) or public domain. */
const LICENSE_RE = /^(CC0( 1\.0)?|CC BY(-SA)? \d\.\d|Public domain)$/
const FOCUS_RE = /^\d{1,3}% \d{1,3}%$/
const nonEmpty = (s) => typeof s === 'string' && s.trim().length > 0

function validateGallery(b, problems) {
  const p = (m) => `${b.id}: gallery ${m}`
  if (!Array.isArray(b.gallery)) return problems.push(p('missing'))
  const photos = b.gallery.filter((g) => g.kind === 'image').length
  check(photos >= 2 && photos <= 4, p(`has ${photos} photos (want 2–4)`), problems)
  const pages = new Set([b.image?.page])
  b.gallery.forEach((g, i) => {
    const q = (m) => p(`#${i + 1}: ${m}`)
    check(['image', 'video'].includes(g.kind), q(`bad kind ${g.kind}`), problems)
    for (const k of ['src', 'srcSmall']) {
      check(typeof g[k] === 'string' && g[k].startsWith('images/gallery/') && g[k].endsWith('.jpg'), q(`bad ${k}`), problems)
      check(typeof g[k] === 'string' && existsSync(join(publicDir, g[k])), q(`${g[k]} not on disk (run tools/fetch-gallery.py)`), problems)
    }
    check(Number.isInteger(g.width) && Number.isInteger(g.height) && g.width > 0 && g.height > 0, q('bad width/height'), problems)
    check(typeof g.page === 'string' && g.page.startsWith('https://commons.wikimedia.org/wiki/File:'), q('page is not a Commons file page'), problems)
    check(!pages.has(g.page), q('repeats the main photo or another gallery item'), problems)
    pages.add(g.page)
    check(nonEmpty(g.author) && !/[<>]/.test(g.author), q('author missing or contains HTML'), problems)
    check(LICENSE_RE.test(g.license ?? ''), q(`licence "${g.license}" is not CC0/CC BY/CC BY-SA/public domain`), problems)
    check(nonEmpty(g.alt), q('alt missing'), problems)
    check(g.focus == null || FOCUS_RE.test(g.focus), q('bad focus'), problems)
    if (g.kind === 'video') {
      check(/^https:\/\/upload\.wikimedia\.org\/.+\.webm$/.test(g.video?.url ?? ''), q('video.url must be an upload.wikimedia.org .webm'), problems)
      check(typeof g.video?.duration === 'number' && g.video.duration > 0, q('video.duration'), problems)
    } else {
      check(g.video == null, q('image has a video field'), problems)
    }
  })
}

// ---------------------------------------------------------------- English (src/data/en.json)

/** String fields of a breed that have an English version; arrays must match the Thai lengths. */
const EN_TEXT = ['origin', 'tagline', 'summary', 'history']
const EN_LISTS = ['appearance', 'temperament', 'idealFor', 'considerations']
const EN_NULLABLE = ['welfareNote', 'funFact']
const CARE_KEYS = ['grooming', 'exercise', 'diet', 'environment']
const THAI_RE = /[฀-๿]/

/** Checks that `en` mirrors `th`: same keys present, same array lengths, null where Thai is null, no Thai script. */
function mirror(th, en, path, problems) {
  if (th === null) return check(en === null, `${path}: should be null like the Thai`, problems)
  if (typeof th === 'string') {
    check(nonEmpty(en), `${path}: missing English`, problems)
    check(!THAI_RE.test(en ?? ''), `${path}: English still contains Thai script`, problems)
    return
  }
  if (Array.isArray(th)) {
    if (!Array.isArray(en) || en.length !== th.length) return problems.push(`${path}: ${en?.length ?? 'no'} items, Thai has ${th.length}`)
    return th.forEach((x, i) => mirror(x, en[i], `${path}[${i}]`, problems))
  }
  for (const k of Object.keys(th)) mirror(th[k], en?.[k], `${path}.${k}`, problems)
}

function englishBreed(b, problems) {
  const file = join(enDir, `${b.id}.json`)
  if (!existsSync(file)) {
    problems.push(`${b.id}: English file i18n/en/${b.id}.json missing`)
    return null
  }
  const en = readJson(file)
  const p = `en/${b.id}`
  for (const k of [...EN_TEXT, ...EN_LISTS, ...EN_NULLABLE]) mirror(b[k], en[k], `${p}.${k}`, problems)
  for (const k of CARE_KEYS) mirror(b.care[k], en.care?.[k], `${p}.care.${k}`, problems)
  mirror(b.coat.texture, en.coat?.texture, `${p}.coat.texture`, problems)
  mirror(b.coat.colors, en.coat?.colors, `${p}.coat.colors`, problems)
  mirror(b.health, en.health, `${p}.health`, problems)
  if (b.price) mirror(b.price.note, en.price?.note, `${p}.price.note`, problems)
  mirror(b.gallery.map((g) => g.alt), (en.gallery ?? []).map((g) => g.alt), `${p}.gallery.alt`, problems)

  // Full objects (not partial overlays) so the UI can shallow-merge: { ...breed, ...en.records[id] }
  return {
    nameEn: b.nameEn,
    ...Object.fromEntries([...EN_TEXT, ...EN_LISTS, ...EN_NULLABLE].map((k) => [k, en[k]])),
    coat: { length: b.coat.length, texture: en.coat?.texture, colors: en.coat?.colors },
    care: Object.fromEntries(CARE_KEYS.map((k) => [k, en.care?.[k]])),
    health: (en.health ?? []).map((h) => ({ name: h.name, detail: h.detail, screening: h.screening })),
    price: b.price ? { ...b.price, note: en.price?.note } : null,
    gallery: b.gallery.map((g, i) => ({ ...g, alt: en.gallery?.[i]?.alt })),
  }
}

/** English market text merged with the Thai numbers/links, filtered the same way as the Thai output. */
function englishMarket(market, monthlyKeep, problems) {
  const file = join(enDir, 'market.json')
  if (!existsSync(file)) {
    problems.push('English file i18n/en/market.json missing')
    return null
  }
  const en = readJson(file)
  mirror(market.priceFactors, en.priceFactors, 'en/market.priceFactors', problems)
  mirror(market.buyerChecklist, en.buyerChecklist, 'en/market.buyerChecklist', problems)
  mirror(market.vaccineSchedule, en.vaccineSchedule, 'en/market.vaccineSchedule', problems)
  mirror(market.legalNotes, en.legalNotes, 'en/market.legalNotes', problems)
  for (const k of ['monthly', 'oneTime']) {
    mirror(market.ownershipCost[k].map((c) => c.item), (en.ownershipCost?.[k] ?? []).map((c) => c.item), `en/market.ownershipCost.${k}`, problems)
  }
  mirror(market.adoption.map((a) => a.detail), (en.adoption ?? []).map((a) => a.detail), 'en/market.adoption', problems)
  check((en.adoption ?? []).every((a) => nonEmpty(a.name)), 'en/market.adoption: missing name', problems)

  const costs = (k) => market.ownershipCost[k].map((c, i) => ({ ...c, item: en.ownershipCost?.[k]?.[i]?.item }))
  return {
    currency: market.currency,
    asOf: market.asOf,
    priceFactors: en.priceFactors,
    buyerChecklist: en.buyerChecklist,
    vaccineSchedule: en.vaccineSchedule,
    legalNotes: en.legalNotes,
    ownershipCost: { monthly: costs('monthly').filter((_, i) => monthlyKeep[i]), oneTime: costs('oneTime') },
    adoption: market.adoption.map((a, i) => ({ ...a, name: en.adoption?.[i]?.name, detail: en.adoption?.[i]?.detail })),
    sources: market.sources,
  }
}

async function main() {
  console.log(`Reading ${dataDir}`)
  const market = readJson(join(dataDir, 'market.json'))
  const problems = []
  const breeds = []

  for (const id of ORDER) {
    const file = join(dataDir, `${id}.json`)
    if (!existsSync(file)) {
      problems.push(`${id}: research file missing`)
      continue
    }
    const raw = readJson(file)
    validate(raw, problems)
    console.log(`• ${id}`)
    const local = await fetchImage(id, raw.image.url)
    const { image, gallery = [], sources, ...rest } = raw
    breeds.push({
      ...rest,
      id,
      image: { ...local, page: image.page, author: image.author, license: image.license, focus: FOCUS[id] },
      gallery,
      welfareFlag: WELFARE_FLAG.has(id),
      price: market.prices?.[id] ?? null,
      sources,
    })
  }

  const { prices: _prices, ...marketOut } = market
  const monthlyKeep = market.ownershipCost.monthly.map((c) => !DROP_MONTHLY.some((re) => re.test(c.item)))
  marketOut.ownershipCost = { ...market.ownershipCost, monthly: market.ownershipCost.monthly.filter((_, i) => monthlyKeep[i]) }

  const en = { records: {}, market: englishMarket(market, monthlyKeep, problems) }
  for (const b of breeds) en.records[b.id] = englishBreed(b, problems)

  if (problems.length) {
    console.error('\nData problems:\n  ' + problems.join('\n  '))
    process.exitCode = 1
  }

  writeFileSync(join(root, 'src', 'data', 'breeds.json'), JSON.stringify(breeds, null, 2) + '\n')
  writeFileSync(join(root, 'src', 'data', 'market.json'), JSON.stringify(marketOut, null, 2) + '\n')
  writeFileSync(join(root, 'src', 'data', 'en.json'), JSON.stringify(en, null, 2) + '\n')
  const media = breeds.reduce((n, b) => n + b.gallery.length, 0)
  console.log(`\nWrote ${breeds.length} breeds (${media} gallery items), market data and English (en.json).`)
}

main()

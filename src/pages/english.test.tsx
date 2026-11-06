import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { breeds, en } from '../data'
import { renderAt } from '../test/render'

const THAI = /[฀-๿]/

/** Text of an element with any part marked lang="th" (Thai names shown beside English ones) left out. */
function englishText(el: Element): string {
  const copy = el.cloneNode(true) as Element
  copy.querySelectorAll('[lang="th"]').forEach((n) => n.remove())
  return copy.textContent ?? ''
}

// jsdom has no modal dialogs; enough of one for the lightbox
beforeAll(() => {
  const proto = HTMLDialogElement.prototype as HTMLDialogElement & { showModal: () => void; close: () => void }
  proto.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }
  proto.close = function (this: HTMLDialogElement) {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
})

type Reply = { status?: number; body: unknown }
let routes: Record<string, (init?: RequestInit) => Reply>
const calls: { url: string; init?: RequestInit }[] = []

beforeEach(() => {
  calls.length = 0
  routes = {
    '/api/public/reviews?': () => ({ body: { average: null, count: 0, rows: [] } }),
    '/api/public/catalog': () => ({ body: [] }),
    '/api/public/store': () => ({ status: 404, body: { error: 'x', code: 'NOT_FOUND' } }),
    '/api/public/kittens': () => ({ body: [] }),
  }
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url, init })
      const key = Object.keys(routes).find((k) => url.startsWith(k))
      const reply = key ? routes[key](init) : { status: 404, body: { error: 'x', code: 'NOT_FOUND' } }
      return new Response(JSON.stringify(reply.body), {
        status: reply.status ?? 200,
        headers: { 'content-type': 'application/json' },
      })
    }),
  )
})

afterEach(() => vi.unstubAllGlobals())

const withGallery = breeds.find((b) => b.gallery.length >= 3)!
const enRecord = en.records[withGallery.id]

describe('English pages', () => {
  it('renders the home page in English, with English breed names and filters', () => {
    renderAt('/en')
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1.textContent).toMatch(/Which cat is right for your home\?/)
    const grid = screen.getByRole('heading', { name: 'All breeds' }).closest('section')!
    const names = within(grid).getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(names).toEqual(breeds.map((b) => en.records[b.id].nameEn))
    expect(screen.getByRole('searchbox', { name: 'Search breeds' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Thai' })).toBeInTheDocument()
    expect(englishText(document.querySelector('main')!)).not.toMatch(THAI)
  })

  it('searches the English text on English pages', async () => {
    const user = userEvent.setup()
    renderAt('/en')
    await user.type(screen.getByRole('searchbox', { name: 'Search breeds' }), en.records.ragdoll.nameEn)
    expect(screen.getByText(/^Showing 1 of \d+ breeds$/)).toBeInTheDocument()
  })

  it('renders a breed page fully in English', async () => {
    const user = userEvent.setup()
    renderAt(`/en/breeds/${withGallery.id}`)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(enRecord.nameEn)
    expect(screen.getByText(enRecord.tagline)).toBeInTheDocument()
    const tabs = screen.getAllByRole('tab').map((t) => t.textContent)
    expect(tabs).toEqual(expect.arrayContaining(['Overview', 'Care', 'Health', 'Before you decide']))
    await user.click(screen.getByRole('tab', { name: 'Health' }))
    expect(screen.getByRole('heading', { name: enRecord.health[0].name, level: 3 })).toBeInTheDocument()
    expect(englishText(document.querySelector('main')!)).not.toMatch(THAI)
  })

  it('renders the guide in English from the English market data', () => {
    renderAt('/en/guide')
    expect(screen.getByRole('heading', { name: 'Cattery checklist', level: 2 })).toBeInTheDocument()
    for (const item of en.market.buyerChecklist) expect(screen.getByText(item.title)).toBeInTheDocument()
    expect(screen.getByRole('table', { name: 'Monthly' })).toBeInTheDocument()
    // The emergency fund stays out of the one-off table
    const oneOff = screen.getByRole('table', { name: 'One-off and yearly' })
    expect(within(oneOff).queryByText(/emergency fund/i)).toBeNull()
    expect(englishText(document.querySelector('main')!)).not.toMatch(THAI)
  })

  it('renders compare and sources in English', () => {
    renderAt('/en/compare')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Compare\s*breeds/)
    expect(screen.getByText('Choose at least 2 breeds', { exact: false })).toBeInTheDocument()
  })

  it('keeps the Thai pages Thai', () => {
    renderAt(`/breeds/${withGallery.id}`)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(withGallery.nameTh)
    expect(screen.getByRole('tab', { name: 'ภาพรวม' })).toBeInTheDocument()
  })
})

describe('breed gallery', () => {
  it('lists every gallery item and opens the lightbox on the one pressed', async () => {
    const user = userEvent.setup()
    renderAt(`/breeds/${withGallery.id}`)
    const section = screen.getByRole('heading', { name: 'ภาพและวิดีโอเพิ่มเติม' }).closest('section')!
    const thumbs = within(section).getAllByRole('button')
    expect(thumbs).toHaveLength(withGallery.gallery.length)
    await user.click(thumbs[1])
    const dialog = document.querySelector('dialog.lightbox')!
    expect(dialog).toHaveAttribute('open')
    const total = withGallery.gallery.length + 1
    expect(within(dialog as HTMLElement).getByText(`3 จาก ${total}`)).toBeInTheDocument()
  })

  it('moves with the arrow keys, wraps, and jumps with Home/End', async () => {
    const user = userEvent.setup()
    renderAt(`/en/breeds/${withGallery.id}`)
    await user.click(screen.getByRole('button', { name: /View all photos/ }))
    const dialog = document.querySelector('dialog.lightbox') as HTMLElement
    const total = withGallery.gallery.length + 1
    expect(within(dialog).getByText(`1 of ${total}`)).toBeInTheDocument()
    fireEvent.keyDown(dialog, { key: 'ArrowRight' })
    expect(within(dialog).getByText(`2 of ${total}`)).toBeInTheDocument()
    fireEvent.keyDown(dialog, { key: 'End' })
    expect(within(dialog).getByText(`${total} of ${total}`)).toBeInTheDocument()
    fireEvent.keyDown(dialog, { key: 'ArrowRight' })
    expect(within(dialog).getByText(`1 of ${total}`)).toBeInTheDocument()
    // English alt text and the credit for the main photo
    expect(within(dialog).getByText(withGallery.image.license)).toBeInTheDocument()
  })

  it('shows videos with a poster and controls, never autoplaying', async () => {
    const withVideo = breeds.find((b) => b.gallery.some((g) => g.kind === 'video'))!
    const at = withVideo.gallery.findIndex((g) => g.kind === 'video')
    const user = userEvent.setup()
    renderAt(`/breeds/${withVideo.id}`)
    const section = screen.getByRole('heading', { name: 'ภาพและวิดีโอเพิ่มเติม' }).closest('section')!
    await user.click(within(section).getAllByRole('button')[at])
    const video = document.querySelector('dialog.lightbox video') as HTMLVideoElement
    expect(video).not.toBeNull()
    expect(video).toHaveAttribute('preload', 'none')
    expect(video).toHaveAttribute('controls')
    expect(video.hasAttribute('autoplay')).toBe(false)
    expect(video.getAttribute('poster')).toMatch(/^\//)
  })
})

describe('breed reviews', () => {
  it('invites the first review when there are none, and never shows placeholder reviews', async () => {
    renderAt(`/breeds/${withGallery.id}`)
    expect(await screen.findByText(/ยังไม่มีรีวิวสำหรับ/)).toBeInTheDocument()
    expect(document.querySelectorAll('.reviews__list li')).toHaveLength(0)
  })

  it('shows approved reviews and their average', async () => {
    routes['/api/public/reviews?'] = () => ({
      body: {
        average: 4.5,
        count: 2,
        rows: [
          { id: 'r1', name: 'Nok', rating: 5, title: 'Lovely', body: 'Very gentle kitten.', lang: 'en', createdAt: '2026-10-01T03:00:00Z' },
          { id: 'r2', name: 'Ploy', rating: 4, title: null, body: 'Healthy and playful.', lang: 'en', createdAt: '2026-10-05T03:00:00Z' },
        ],
      },
    })
    renderAt(`/en/breeds/${withGallery.id}`)
    expect(await screen.findByText('4.5 out of 5 stars from 2 reviews')).toBeInTheDocument()
    expect(screen.getByText('Very gentle kitten.')).toBeInTheDocument()
    expect(screen.getByText('5 out of 5 stars')).toBeInTheDocument()
  })

  it('checks the form, then sends the review for moderation', async () => {
    routes['/api/public/reviews'] = (init) =>
      init?.method === 'POST' ? { body: { status: 'pending' } } : { body: { average: null, count: 0, rows: [] } }
    const user = userEvent.setup()
    renderAt(`/en/breeds/${withGallery.id}`)
    await user.click(await screen.findByRole('button', { name: 'Write a review' }))
    await user.click(screen.getByRole('button', { name: 'Send review' }))
    expect(screen.getByText('Enter a display name')).toBeInTheDocument()
    expect(screen.getByText('Choose 1 to 5 stars')).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Display name/), 'Nok')
    await user.click(screen.getByRole('radio', { name: '4 stars' }))
    await user.type(screen.getByLabelText(/Your experience/), 'A calm and healthy kitten.')
    await user.click(screen.getByRole('checkbox', { name: /publish my display name/ }))
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Send review' }))
    })
    await waitFor(() => expect(screen.getByText('It will appear once a manager has checked it.')).toBeInTheDocument())
    const post = calls.find((c) => c.init?.method === 'POST')!
    const body = JSON.parse(String(post.init!.body))
    expect(body).toMatchObject({ refId: withGallery.id, name: 'Nok', rating: 4, consent: true, website: '', lang: 'en' })
  })
})

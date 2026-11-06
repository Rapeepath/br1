import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { ChevronLeft, ChevronRight, Expand, Play, X } from 'lucide-react'
import type { GalleryItem } from '../data'
import { useLang } from '../i18n'
import { asset } from '../lib/asset'
import { pick } from '../lib/locale'
import type { BreedImage } from '../lib/types'
import { Picture } from './Picture'
import './Gallery.css'

const COPY = {
  th: {
    title: 'ภาพและวิดีโอเพิ่มเติม',
    count: (p: number, v: number) => (v ? `${p} ภาพ ${v} วิดีโอ` : `${p} ภาพ`),
    dialog: (name: string) => `แกลเลอรี${name}`,
    prev: 'ภาพก่อนหน้า',
    next: 'ภาพถัดไป',
    close: 'ปิดแกลเลอรี',
    position: (i: number, n: number) => `${i} จาก ${n}`,
    credit: 'ภาพ',
    videoCredit: 'วิดีโอ',
    open: 'ดูภาพขนาดใหญ่',
    video: 'วิดีโอ',
    videoNote: 'กดเล่นเพื่อดู ไม่มีการเล่นอัตโนมัติ วิดีโอโหลดจาก Wikimedia Commons',
    duration: (s: string) => `ความยาว ${s}`,
  },
  en: {
    title: 'More photos and videos',
    count: (p: number, v: number) =>
      `${p} ${p === 1 ? 'photo' : 'photos'}${v ? `, ${v} ${v === 1 ? 'video' : 'videos'}` : ''}`,
    dialog: (name: string) => `${name} gallery`,
    prev: 'Previous photo',
    next: 'Next photo',
    close: 'Close gallery',
    position: (i: number, n: number) => `${i} of ${n}`,
    credit: 'Photo',
    videoCredit: 'Video',
    open: 'View larger',
    video: 'Video',
    videoNote: 'Press play to watch; nothing plays by itself. Streamed from Wikimedia Commons.',
    duration: (s: string) => `${s} long`,
  },
}

/** Every slide in the lightbox: the breed's main photo first, then its gallery. */
interface Slide {
  kind: 'image' | 'video'
  src: string
  alt: string
  author: string
  license: string
  page: string
  focus?: string
  video?: GalleryItem['video']
}

const clock = (seconds: number) => {
  const s = Math.round(seconds)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

interface Props {
  items: GalleryItem[]
  main: BreedImage
  mainAlt: string
  name: string
  /** Lets the page's hero photo open the lightbox at the main photo */
  openRef?: { current: ((index: number) => void) | null }
  /** A row of small thumbnails under the hero photo; the heading stays for screen readers only */
  compact?: boolean
}

/**
 * The breed's photo strip and lightbox. Thumbnails are buttons; the lightbox is a native modal <dialog>
 * (focus is kept inside, Esc closes) with arrow keys, Home/End and swipes to move, and focus goes back to
 * the thumbnail that opened it. Videos only load and play when the visitor presses play.
 */
export function Gallery({ items, main, mainAlt, name, openRef, compact }: Props) {
  const lang = useLang()
  const c = pick(COPY, lang)
  const dialog = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  const swipe = useRef<number | null>(null)
  const [index, setIndex] = useState(0)

  const slides: Slide[] = [
    { kind: 'image', src: main.src, alt: mainAlt, author: main.author, license: main.license, page: main.page, focus: main.focus },
    ...items.map((g) => ({
      kind: g.kind,
      src: g.src,
      alt: g.alt,
      author: g.author,
      license: g.license,
      page: g.page,
      focus: g.focus,
      video: g.video,
    })),
  ]
  const photos = items.filter((g) => g.kind === 'image').length
  const videos = items.length - photos

  const open = (i: number) => {
    opener.current = document.activeElement as HTMLElement | null
    setIndex(i)
    dialog.current?.showModal()
  }
  useEffect(() => {
    if (openRef) openRef.current = open
  })

  const close = () => dialog.current?.close()
  const go = (i: number) => setIndex((i + slides.length) % slides.length)

  const onKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
    // Leave the keys alone while the video's own controls have focus
    if ((e.target as HTMLElement).tagName === 'VIDEO') return
    if (e.key === 'ArrowRight') go(index + 1)
    else if (e.key === 'ArrowLeft') go(index - 1)
    else if (e.key === 'Home') go(0)
    else if (e.key === 'End') go(slides.length - 1)
    else return
    e.preventDefault()
  }

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') swipe.current = e.clientX
  }
  const onPointerUp = (e: PointerEvent) => {
    if (swipe.current == null) return
    const dx = e.clientX - swipe.current
    swipe.current = null
    if (Math.abs(dx) > 48) go(index + (dx < 0 ? 1 : -1))
  }

  const slide = slides[index]

  if (!items.length) return null

  return (
    <section className={compact ? 'gallery gallery--compact' : 'gallery'} aria-labelledby="gallery-title">
      <div className={compact ? 'visually-hidden' : 'gallery__head'}>
        <h2 id="gallery-title">{c.title}</h2>
        <p>{c.count(photos, videos)}</p>
      </div>
      <ul className="gallery__strip">
        {items.map((g, i) => (
          <li key={g.src}>
            <button type="button" className="gallery__thumb" onClick={() => open(i + 1)}>
              <Picture
                src={g.srcSmall}
                alt={g.alt}
                sizes={compact ? '96px' : '(max-width: 560px) 45vw, 220px'}
                style={g.focus ? { objectPosition: g.focus } : undefined}
              />
              {g.kind === 'video' ? (
                <span className="gallery__badge" aria-hidden="true">
                  <Play size={16} />
                  {g.video && clock(g.video.duration)}
                </span>
              ) : (
                !compact && (
                  <span className="gallery__badge gallery__badge--zoom" aria-hidden="true">
                    <Expand size={14} />
                  </span>
                )
              )}
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        className="lightbox"
        aria-label={c.dialog(name)}
        onKeyDown={onKeyDown}
        onClose={() => opener.current?.focus()}
        onClick={(e) => {
          // A click on the dim backdrop (the dialog element itself) closes it
          if (e.target === dialog.current) close()
        }}
      >
        <div className="lightbox__frame" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
          <div className="lightbox__bar">
            <p className="lightbox__pos" aria-live="polite">
              {c.position(index + 1, slides.length)}
            </p>
            <button type="button" className="lightbox__close" onClick={close}>
              <X size={20} aria-hidden />
              <span className="visually-hidden">{c.close}</span>
            </button>
          </div>

          <figure className="lightbox__figure" key={index}>
            <div className="lightbox__stage">
              {slide.kind === 'video' && slide.video ? (
                <video
                  className="lightbox__video"
                  src={slide.video.url}
                  poster={asset(slide.src)}
                  controls
                  preload="none"
                  playsInline
                  width={slide.video.width}
                  height={slide.video.height}
                  aria-label={slide.alt}
                />
              ) : (
                <Picture src={slide.src} alt={slide.alt} sizes="min(1200px, 100vw)" className="lightbox__img" />
              )}
            </div>
            <figcaption className="lightbox__caption">
              <span className="lightbox__alt">{slide.alt}</span>
              <span className="lightbox__credit">
                {slide.kind === 'video' ? c.videoCredit : c.credit}: {slide.author}{' '}
                <a href={slide.page} target="_blank" rel="noreferrer">
                  {slide.license}
                </a>
                {slide.kind === 'video' && slide.video && (
                  <>
                    {' '}
                    <span className="lightbox__note">
                      {c.duration(clock(slide.video.duration))} {c.videoNote}
                    </span>
                  </>
                )}
              </span>
            </figcaption>
          </figure>

          <button type="button" className="lightbox__nav lightbox__nav--prev" onClick={() => go(index - 1)} aria-label={c.prev}>
            <ChevronLeft size={26} aria-hidden />
          </button>
          <button type="button" className="lightbox__nav lightbox__nav--next" onClick={() => go(index + 1)} aria-label={c.next}>
            <ChevronRight size={26} aria-hidden />
          </button>
        </div>
      </dialog>
    </section>
  )
}

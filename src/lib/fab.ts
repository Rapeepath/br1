import { useEffect, type RefObject } from 'react'

/**
 * While the element is mostly in view, the phone's floating contact buttons step aside (site-shop.css), so
 * they never sit on a hero photo. Used by the home page's first screen and the breed page's photo.
 */
export function useContactAway(ref: RefObject<HTMLElement | null>, threshold = 0.35) {
  useEffect(() => {
    const el = ref.current
    const root = document.documentElement
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) root.dataset.contactAway = ''
        else delete root.dataset.contactAway
      },
      { threshold },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      delete root.dataset.contactAway
    }
  }, [ref, threshold])
}

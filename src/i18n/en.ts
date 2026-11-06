import type { DictKey } from './th'

// English interface strings for the /en mirror. Every Thai key must exist here (the type enforces it).
export const en: Record<DictKey, string> = {
  'site.name': 'Maew',
  'site.tagline': 'cat breed catalogue',
  'site.wordmarkSub': 'Cat Breed Catalogue',

  'shell.skip': 'Skip to content',
  'shell.menu': 'Main menu',
  'shell.home': 'Maew home',
  'shell.themeToDark': 'Switch to dark theme',
  'shell.themeToLight': 'Switch to light theme',
  'shell.compareCount': '{count} selected',
  'shell.cta': 'Contact & visit',
  'shell.langSwitch': 'ภาษาไทย',
  'shell.langSwitchLabel': 'อ่านหน้านี้เป็นภาษาไทย',

  'nav.models': 'Breeds',
  'nav.compare': 'Compare',
  'nav.guide': 'Buyer’s guide',
  'nav.sources': 'Sources',

  'footer.menu': 'Menu',
  'footer.blurb': 'Popular cat breeds in Thailand, with approximate prices. Ask a vet about health matters.',
  'footer.photos': 'Photos from Wikimedia Commons; credits are on the',
  'footer.trademarks': '',
  'footer.updated': 'Data as of {date}',
  'footer.simulation':
    'The shop, kitten stock, sale prices, visits and reservations on this site are a simulation for demonstration. Nothing is sold and no money is taken.',

  'tray.label': 'Comparison list',
  'tray.clear': 'Clear list',
  'tray.go': 'Compare {count}/{limit}',
  'tray.remove': 'Remove {name} from the comparison',
  'tray.announce': '{count} of {limit} breeds selected to compare',
  'tray.cleared': 'Comparison list cleared',

  'notFound.title': 'Page not found',
  'notFound.heading1': 'Page',
  'notFound.heading2': 'not found',
  'notFound.body': 'The link may be wrong, or this breed is not in the catalogue.',
  'notFound.home': 'Back to all breeds',

  'soon.body': 'This page is being prepared. Meanwhile, reach us by phone or LINE.',
  'soon.home': 'Back to the home page',

  'page.contact': 'Contact us',
  'page.booking': 'Book a visit to meet the kittens',
  'page.faq': 'Frequently asked questions',
  'page.privacy': 'Privacy policy',
  'page.care': 'Aftercare and health guarantee',
  'page.cost': 'Cost of keeping a cat and instalments',
  'page.kittens': 'Kittens ready for a home',
  'page.kitten': 'Kitten details',
  'page.reserve': 'Reserve a kitten',
  'page.reservation': 'Reservation status',
}

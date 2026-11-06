// The brochure's calls to the shop's public API (/api/public/*). Errors come back as
// `{ error (Thai), code, errorEn?, field? }`; ApiError carries all of them so a form can put the message
// beside the right field in the reader's language.
import type { Lang } from '../i18n'

export class ApiError extends Error {
  status: number
  code: string
  en: string | null
  field: string | null
  constructor(status: number, message: string, code: string, en: string | null, field: string | null) {
    super(message)
    this.status = status
    this.code = code
    this.en = en
    this.field = field
  }
}

/** English for codes the server may send without its own English text */
const CODE_EN: Record<string, string> = {
  RATE_LIMITED: 'Too many requests from this device. Please wait a few minutes and try again.',
  CONSENT_REQUIRED: 'Please agree to the privacy notice so we can contact you.',
  SPAM: 'The form could not be sent.',
  SLOT_TAKEN: 'That time has just been booked. Please pick another.',
  SLOT_INVALID: 'That time can’t be booked. Please pick another.',
  UNIT_UNAVAILABLE: 'This kitten has already been reserved.',
  EXPIRED: 'This reservation has expired or was cancelled.',
  NOT_FOUND: 'Not found.',
  OFFLINE: 'The shop’s system can’t be reached right now. Please call or message us on LINE.',
  SERVER_ERROR: 'Something went wrong. Please try again.',
}

const OFFLINE_TH = 'ติดต่อระบบของร้านไม่ได้ในขณะนี้ โทรหรือทัก LINE หาเราได้เลย'

/** The message to show for an error, in the page's language. */
export function errorText(err: unknown, lang: Lang): string {
  if (err instanceof ApiError) {
    if (lang === 'en') return err.en ?? CODE_EN[err.code] ?? CODE_EN.SERVER_ERROR
    return err.message
  }
  return lang === 'en' ? CODE_EN.OFFLINE : OFFLINE_TH
}

async function request<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
  let res: Response
  try {
    res = await fetch(path, {
      method,
      headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, OFFLINE_TH, 'OFFLINE', CODE_EN.OFFLINE, null)
  }
  const type = res.headers.get('content-type') ?? ''
  if (!type.includes('application/json')) {
    // Static hosting answers /api with the 404 page: treat as "no shop system here"
    throw new ApiError(res.status, OFFLINE_TH, 'OFFLINE', CODE_EN.OFFLINE, null)
  }
  const data = (await res.json()) as T & { error?: string; code?: string; errorEn?: string; field?: string }
  if (!res.ok) {
    throw new ApiError(res.status, data.error ?? OFFLINE_TH, data.code ?? 'ERROR', data.errorEn ?? null, data.field ?? null)
  }
  return data
}

export const getPublic = <T,>(path: string) => request<T>('GET', `/api/public/${path}`)
export const postPublic = <T,>(path: string, body: unknown) => request<T>('POST', `/api/public/${path}`, body)

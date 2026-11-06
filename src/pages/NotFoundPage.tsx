import { Link } from 'react-router'
import { ArrowLeft, Cat } from 'lucide-react'
import { useLang, useT } from '../i18n'
import { useTitle } from '../lib/a11y'

/* A friendly dead end: one big pastel card on the cream floor, a cat bubble, and a chunky way home */
export function NotFoundPage() {
  const t = useT()
  const lang = useLang()
  useTitle(t('notFound.title'))
  return (
    <div
      style={{
        background:
          'radial-gradient(480px 340px at 88% 6%, color-mix(in srgb, var(--tint-lavender) 85%, transparent), transparent 70%),' +
          'radial-gradient(420px 300px at 6% 58%, color-mix(in srgb, var(--tint-peach) 80%, transparent), transparent 70%),' +
          'var(--paper)',
      }}
    >
      <div className="container" style={{ paddingBlock: 'var(--space-8)' }}>
        <div
          className="tone-peach"
          style={{
            display: 'grid',
            justifyItems: 'center',
            maxWidth: '40rem',
            marginInline: 'auto',
            padding: 'clamp(2rem, 1.2rem + 4vw, 3.5rem) clamp(1.25rem, 0.6rem + 3vw, 3rem)',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--tone-bg)',
            boxShadow: 'var(--elev-2), var(--clay)',
            textAlign: 'center',
          }}
        >
          <span
            className="bubble"
            aria-hidden="true"
            style={{
              width: 88,
              height: 88,
              marginBottom: 'var(--space-5)',
              background: 'var(--surface)',
              boxShadow: 'var(--elev-2)',
            }}
          >
            <Cat size={44} strokeWidth={1.75} />
          </span>
          {/* Two whole phrases, so a narrow card breaks it as "ไม่พบหน้า / ที่ต้องการ", never after "ไม่พบ" */}
          <h1 style={{ fontSize: 'var(--fs-page)' }}>
            <span className="nowrap">{t('notFound.heading1')}</span>
            {lang === 'en' && ' '}
            <wbr />
            <span className="nowrap">{t('notFound.heading2')}</span>
          </h1>
          <p
            style={{
              maxWidth: '36ch',
              marginTop: 'var(--space-3)',
              color: 'var(--ink-muted)',
              fontSize: 'var(--fs-lg)',
              textWrap: 'balance',
            }}
          >
            {lang === 'en' ? (
              t('notFound.body')
            ) : (
              <>
                ลิงก์อาจไม่ถูกต้อง หรือ<wbr />
                <span className="nowrap">สายพันธุ์นี้</span>
                <wbr />
                ไม่มีใน<wbr />
                <span className="nowrap">แค็ตตาล็อก</span>
              </>
            )}
          </p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 'var(--space-6)' }}>
            <ArrowLeft size={18} aria-hidden />
            {t('notFound.home')}
          </Link>
        </div>
      </div>
    </div>
  )
}

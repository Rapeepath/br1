// รีวิว: reviews visitors write on the brochure wait here until a manager approves them. Nothing is shown on
// the website before that, and the shop never writes reviews itself.
import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { api, useApi } from '../api'
import type { Review, ReviewStatus } from '../../../server/types.ts'
import { useSession, useToast } from '../context'
import { REVIEW_STATUS_LABEL } from '../crm'
import { ReviewStatusBadge, Stars } from '../crmUi'
import { dateTime, num } from '../format'
import { Empty, ErrorNote, Loading, PageHead, Segmented, Words } from '../ui'
import { useBreedNames } from './Leads'
import '../crm.css'

const STATUSES = Object.keys(REVIEW_STATUS_LABEL) as ReviewStatus[]

export function Reviews() {
  const { isManager } = useSession()
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const status = (params.get('status') ?? 'pending') as ReviewStatus | 'all'
  const { data, error, loading, reload } = useApi<{ rows: Review[] }>(`/reviews${status === 'all' ? '' : `?status=${status}`}`)
  const breed = useBreedNames()
  const [busy, setBusy] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const moderate = async (r: Review, next: ReviewStatus) => {
    setBusy(r.id)
    setActionError(null)
    try {
      await api(`/reviews/${r.id}`, { method: 'PATCH', body: { status: next } })
      toast(next === 'approved' ? `แสดงรีวิวของ ${r.name} บนเว็บไซต์แล้ว` : next === 'rejected' ? `ซ่อนรีวิวของ ${r.name} แล้ว` : `ย้ายรีวิวของ ${r.name} กลับไปรอตรวจแล้ว`)
      reload()
    } catch (err) {
      setActionError((err as Error).message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <section className="page">
      <PageHead title="รีวิว" lead="รีวิวที่ผู้เข้าชมเขียนบนหน้าสายพันธุ์ จะแสดงบนเว็บไซต์หลังผู้จัดการอนุมัติเท่านั้น" />
      <div className="filters">
        <Segmented
          label="สถานะรีวิว"
          value={status}
          onChange={(v) => {
            const next = new URLSearchParams(params)
            next.set('status', v)
            setParams(next, { replace: true })
          }}
          options={[...STATUSES.map((s) => ({ value: s, label: REVIEW_STATUS_LABEL[s] })), { value: 'all', label: 'ทั้งหมด' }]}
        />
      </div>
      {!isManager && <p className="form__lock">ผู้จัดการเท่านั้นที่อนุมัติหรือซ่อนรีวิวได้ พนักงานอ่านได้อย่างเดียว</p>}
      {actionError && (
        <p className="form__error" role="alert">
          {actionError}
        </p>
      )}
      {error && <ErrorNote message={error} onRetry={reload} />}
      {!data && !error && <Loading />}
      {data && (
        <div className={`page-body ${loading ? 'is-reloading' : ''}`}>
          <p className="result-line" aria-live="polite">
            {num(data.rows.length)} รีวิว{status !== 'all' ? ` ${REVIEW_STATUS_LABEL[status]}` : ''}
          </p>
          {data.rows.length === 0 ? (
            <Empty title={status === 'pending' ? 'ไม่มีรีวิวรอตรวจ' : 'ไม่มีรีวิวในสถานะนี้'}>รีวิวใหม่จากหน้าเว็บไซต์จะมารอตรวจที่นี่ ร้านไม่เขียนรีวิวเอง</Empty>
          ) : (
            <ul className="review-list">
              {data.rows.map((r) => (
                <li key={r.id} className="review">
                  <div className="review__top">
                    <Stars rating={r.rating} />
                    <ReviewStatusBadge status={r.status} />
                  </div>
                  {r.title && <p className="review__title">{r.title}</p>}
                  <p className="review__body">{r.body}</p>
                  <p className="review__meta">
                    <Words text={r.name} /> รีวิว{breed(r.refId)} เมื่อ {dateTime(r.createdAt)}
                    {r.lang === 'en' && ' (ภาษาอังกฤษ)'}
                    {r.moderatedBy && r.moderatedAt && ` ตรวจโดย ${r.moderatedBy} ${dateTime(r.moderatedAt)}`}
                  </p>
                  {isManager && (
                    <div className="step-buttons">
                      {r.status !== 'approved' && (
                        <button type="button" className="btn btn-primary btn-sm" disabled={busy === r.id} onClick={() => moderate(r, 'approved')}>
                          อนุมัติให้แสดง<span className="visually-hidden"> รีวิวของ {r.name}</span>
                        </button>
                      )}
                      {r.status !== 'rejected' && (
                        <button type="button" className="btn btn-ghost btn-sm" disabled={busy === r.id} onClick={() => moderate(r, 'rejected')}>
                          ไม่แสดง<span className="visually-hidden"> รีวิวของ {r.name}</span>
                        </button>
                      )}
                      {r.status !== 'pending' && (
                        <button type="button" className="text-btn" disabled={busy === r.id} onClick={() => moderate(r, 'pending')}>
                          ย้ายกลับไปรอตรวจ<span className="visually-hidden"> รีวิวของ {r.name}</span>
                        </button>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}

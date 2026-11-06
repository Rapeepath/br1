import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AppRoutes } from './App'
import { breedIds, breeds, getBreed, market } from './data'
import { CompareProvider } from './lib/compare'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <CompareProvider validIds={breedIds}>
        <AppRoutes />
      </CompareProvider>
    </MemoryRouter>,
  )
}

const grid = () => screen.getByRole('heading', { name: 'สายพันธุ์ทั้งหมด' }).closest('section')!
const cardHeadings = () => within(grid()).queryAllByRole('heading', { level: 3 })

describe('home page', () => {
  it('lists every breed as a card', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(cardHeadings()).toHaveLength(breeds.length)
  })

  it('narrows the list as you type and announces the count', async () => {
    const user = userEvent.setup()
    renderAt('/')
    await user.type(screen.getByRole('searchbox', { name: 'ค้นหาสายพันธุ์' }), 'ragdoll')
    expect(cardHeadings()).toHaveLength(1)
    expect(screen.getByText(`พบ 1 จาก ${breeds.length} สายพันธุ์`)).toBeInTheDocument()
  })

  it('shows an empty state with a reset that restores all breeds', async () => {
    const user = userEvent.setup()
    renderAt('/')
    await user.type(screen.getByRole('searchbox', { name: 'ค้นหาสายพันธุ์' }), 'zzzz')
    expect(screen.getByText('ไม่พบสายพันธุ์ที่ตรงกับเงื่อนไขนี้')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'ล้างตัวกรองทั้งหมด' }))
    expect(cardHeadings()).toHaveLength(breeds.length)
  })

  it('filters to Thai breeds with the segmented control', async () => {
    const user = userEvent.setup()
    renderAt('/')
    await user.click(screen.getByRole('radio', { name: 'ไทย' }))
    const thai = breeds.filter((b) => b.group === 'thai')
    expect(cardHeadings().map((h) => h.textContent)).toEqual(thai.map((b) => b.nameTh))
  })

  it('reads filters from the URL so back-navigation keeps them', () => {
    renderAt('/?group=thai')
    expect(screen.getByRole('radio', { name: 'ไทย' })).toBeChecked()
    expect(cardHeadings()).toHaveLength(breeds.filter((b) => b.group === 'thai').length)
  })
})

describe('compare', () => {
  it('caps the list at three; the rest say why and stay focusable', async () => {
    const user = userEvent.setup()
    renderAt('/')
    const buttons = () => screen.getAllByRole('button', { name: /เพิ่มเพื่อเปรียบเทียบ/ })
    await user.click(buttons()[0])
    await user.click(buttons()[0])
    await user.click(buttons()[0])
    expect(screen.getAllByRole('button', { name: /อยู่ในรายการเปรียบเทียบ/ })).toHaveLength(3)

    const blocked = screen.getAllByRole('button', { name: /เลือกครบ 3 สายพันธุ์แล้ว/ })
    expect(blocked).toHaveLength(breeds.length - 3)
    expect(blocked.every((b) => b.getAttribute('aria-disabled') === 'true' && !b.hasAttribute('disabled'))).toBe(true)
    await user.click(blocked[0])
    expect(screen.getAllByRole('button', { name: /อยู่ในรายการเปรียบเทียบ/ })).toHaveLength(3)
    expect(screen.getByRole('complementary', { name: 'รายการเปรียบเทียบ' })).toBeInTheDocument()
  })

  it('moves focus to the search box after clearing filters', async () => {
    const user = userEvent.setup()
    renderAt('/?group=thai')
    await user.click(screen.getByRole('button', { name: 'ล้างตัวกรอง' }))
    await new Promise((r) => requestAnimationFrame(r))
    expect(screen.getByRole('searchbox', { name: 'ค้นหาสายพันธุ์' })).toHaveFocus()
  })

  it('needs two picks before showing the table, then adds a third only on the button', async () => {
    const user = userEvent.setup()
    renderAt('/compare')
    expect(screen.getByText('เลือกอย่างน้อย 2 สายพันธุ์เพื่อเริ่มเปรียบเทียบ')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: breeds[0].nameTh }))
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: breeds[0].nameTh })).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: breeds[1].nameTh }))

    const table = screen.getByRole('table')
    expect(within(table).getAllByRole('columnheader').map((h) => h.getAttribute('aria-label'))).toEqual([
      breeds[0].nameTh,
      breeds[1].nameTh,
    ])
    expect(within(table).getByRole('rowheader', { name: 'อายุขัย' })).toBeInTheDocument()

    // Choosing an option alone must not add it (keyboard users browse with arrow keys).
    await user.selectOptions(screen.getByLabelText('เพิ่มสายพันธุ์'), breeds[2].id)
    expect(within(table).getAllByRole('columnheader')).toHaveLength(2)
    await user.click(screen.getByRole('button', { name: 'เพิ่ม' }))
    expect(within(screen.getByRole('table')).getAllByRole('columnheader')).toHaveLength(3)
    expect(screen.getByLabelText('เพิ่มสายพันธุ์')).toBeDisabled()
  })
})

describe('breed page', () => {
  const b = breeds[0]

  it('shows the key facts and switches tabs with the keyboard', async () => {
    const user = userEvent.setup()
    renderAt(`/breeds/${b.id}`)
    expect(screen.getByRole('heading', { level: 1, name: b.nameTh })).toBeInTheDocument()
    expect(screen.getByText('อายุขัย')).toBeInTheDocument()

    const first = screen.getByRole('tab', { name: 'ภาพรวม' })
    expect(first).toHaveAttribute('aria-selected', 'true')
    first.focus()
    await user.keyboard('{ArrowRight}')
    const second = screen.getByRole('tab', { name: 'บุคลิกและนิสัย' })
    expect(second).toHaveAttribute('aria-selected', 'true')
    expect(second).toHaveFocus()
    expect(screen.getAllByRole('img', { name: /ระดับ \d จาก 5/ }).length).toBeGreaterThanOrEqual(9)

    await user.keyboard('{End}')
    expect(screen.getByRole('tab', { name: 'ก่อนตัดสินใจ' })).toHaveAttribute('aria-selected', 'true')
  })

  it('lists health issues on the health tab', async () => {
    const user = userEvent.setup()
    renderAt(`/breeds/${b.id}`)
    await user.click(screen.getByRole('tab', { name: 'สุขภาพ' }))
    for (const h of b.health) expect(screen.getByRole('heading', { name: h.name })).toBeInTheDocument()
  })

  it('links to the next breed', () => {
    renderAt(`/breeds/${b.id}`)
    const next = getBreed(breeds[1].id)!
    const escaped = next.nameTh.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    expect(screen.getByRole('link', { name: new RegExp(`ถัดไป.*${escaped}`) })).toHaveAttribute(
      'href',
      `/breeds/${next.id}`,
    )
  })

  it('shows a not-found page for an unknown breed', () => {
    renderAt('/breeds/not-a-cat')
    expect(screen.getByRole('heading', { name: 'ไม่พบหน้าที่ต้องการ' })).toBeInTheDocument()
    expect(document.title).toBe('ไม่พบหน้า – Maew')
  })

  it('names the page after the breed', () => {
    renderAt(`/breeds/${b.id}`)
    expect(document.title).toBe(`${b.nameTh} – Maew`)
  })

  it('flags welfare concerns above the tabs only for flagged breeds', async () => {
    const user = userEvent.setup()
    const flagged = breeds.find((x) => x.welfareFlag && x.welfareNote)!
    const routine = breeds.find((x) => !x.welfareFlag)!
    const first = renderAt(`/breeds/${routine.id}`)
    expect(screen.queryByRole('button', { name: /ดูข้อควรรู้ด้านสุขภาพ/ })).not.toBeInTheDocument()
    first.unmount()

    renderAt(`/breeds/${flagged.id}`)
    await user.click(screen.getByRole('button', { name: /ดูข้อควรรู้ด้านสุขภาพ/ }))
    expect(screen.getByRole('tab', { name: 'สุขภาพ' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText(flagged.welfareNote!)).toBeInTheDocument()
  })

  it('gives every tab panel a heading under the page title', async () => {
    const user = userEvent.setup()
    renderAt(`/breeds/${b.id}`)
    expect(screen.getByRole('heading', { level: 2, name: 'ภาพรวม' })).toBeInTheDocument()
    await user.click(screen.getByRole('tab', { name: 'การดูแล' }))
    expect(screen.getByRole('heading', { level: 2, name: 'การดูแล' })).toBeInTheDocument()
  })
})

describe('guide page', () => {
  it('renders every guide section and the price chart', () => {
    renderAt('/guide')
    for (const name of ['เช็กลิสต์จากฟาร์ม', 'ตารางวัคซีนลูกแมว', 'ค่าใช้จ่ายโดยประมาณ', 'ราคาลูกแมวแต่ละสายพันธุ์', 'กฎหมายที่ควรรู้', 'รับเลี้ยงแทนการซื้อ']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument()
    }
    const chart = screen.getByRole('table', { name: /ช่วงราคาลูกแมว/ })
    expect(within(chart).getAllByRole('rowheader').length).toBeGreaterThan(0)
    // Every body row keeps one cell per column header, so values are announced under the right header.
    const headers = within(chart).getAllByRole('columnheader').length
    for (const row of within(chart).getAllByRole('row').slice(1)) {
      expect(within(row).queryAllByRole('cell').length + within(row).queryAllByRole('rowheader').length).toBe(headers)
    }
  })

  it('lets visitors tick the cattery checklist and remembers it', async () => {
    const user = userEvent.setup()
    const { unmount } = renderAt('/guide')
    const boxes = screen.getAllByRole('checkbox')
    expect(boxes).toHaveLength(market.buyerChecklist.length)
    await user.click(boxes[0])
    await user.click(boxes[2])
    expect(screen.getByText(`ตรวจแล้ว 2 จาก ${market.buyerChecklist.length} ข้อ`)).toBeInTheDocument()
    unmount()

    renderAt('/guide')
    expect(screen.getAllByRole('checkbox')[2]).toBeChecked()
    await user.click(screen.getByRole('button', { name: 'เริ่มใหม่' }))
    expect(screen.getAllByRole('checkbox').every((c) => !(c as HTMLInputElement).checked)).toBe(true)
  })

  it('leaves the emergency reserve out of the cost totals', () => {
    renderAt('/guide')
    expect(screen.getByText(/แยกไว้สำหรับค่ารักษากะทันหัน/)).toBeInTheDocument()
    const oneTime = screen.getByRole('table', { name: 'ครั้งแรกและรายปี' })
    expect(within(oneTime).queryByText(/สำรอง/)).not.toBeInTheDocument()
  })
})

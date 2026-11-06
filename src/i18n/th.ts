// Thai interface strings (the default language). Keys are shared with en.ts, which must define every one.
// Pages add their own keys here as they are translated; `{name}` placeholders are filled by t().
export const th = {
  'site.name': 'Maew',
  'site.tagline': 'แค็ตตาล็อกสายพันธุ์แมว',
  'site.wordmarkSub': 'Cat Breed Catalogue',

  'shell.skip': 'ข้ามไปยังเนื้อหา',
  'shell.menu': 'เมนูหลัก',
  'shell.home': 'Maew หน้าแรก',
  'shell.themeToDark': 'เปลี่ยนเป็นธีมมืด',
  'shell.themeToLight': 'เปลี่ยนเป็นธีมสว่าง',
  'shell.compareCount': 'เลือกไว้ {count} สายพันธุ์',
  'shell.cta': 'ติดต่อและนัดชม',
  'shell.langSwitch': 'English',
  'shell.langSwitchLabel': 'Read this page in English',

  'nav.models': 'สายพันธุ์',
  'nav.compare': 'เปรียบเทียบ',
  'nav.guide': 'คู่มือก่อนซื้อ',
  'nav.sources': 'แหล่งข้อมูล',

  'footer.menu': 'เมนู',
  'footer.blurb': 'สายพันธุ์แมวยอดนิยมในไทย พร้อมราคาโดยประมาณ เรื่องสุขภาพควรปรึกษาสัตวแพทย์',
  'footer.photos': 'ภาพจาก Wikimedia Commons ดูเครดิตที่หน้า',
  'footer.trademarks': '',
  'footer.updated': 'ข้อมูลล่าสุด {date}',
  'footer.simulation':
    'ร้าน สต็อกลูกแมว ราคาขาย การนัดหมาย และการจองบนเว็บนี้เป็นระบบจำลองเพื่อการสาธิต ไม่มีการซื้อขายหรือรับเงินจริง',

  'tray.label': 'รายการเปรียบเทียบ',
  'tray.clear': 'ล้างรายการ',
  'tray.go': 'เปรียบเทียบ {count}/{limit}',
  'tray.remove': 'นำ{name}ออกจากรายการเปรียบเทียบ',
  'tray.announce': 'เลือกเปรียบเทียบแล้ว {count} จาก {limit} สายพันธุ์',
  'tray.cleared': 'ล้างรายการเปรียบเทียบแล้ว',

  'notFound.title': 'ไม่พบหน้า',
  'notFound.heading1': 'ไม่พบหน้า',
  'notFound.heading2': 'ที่ต้องการ',
  'notFound.body': 'ลิงก์อาจไม่ถูกต้อง หรือสายพันธุ์นี้ไม่มีในแค็ตตาล็อก',
  'notFound.home': 'กลับไปดูสายพันธุ์ทั้งหมด',

  'soon.body': 'หน้านี้กำลังจัดทำ ระหว่างนี้ติดต่อเราได้ทางโทรศัพท์หรือ LINE',
  'soon.home': 'กลับหน้าแรก',

  'page.contact': 'ติดต่อเรา',
  'page.booking': 'นัดชมลูกแมวที่ร้าน',
  'page.faq': 'คำถามที่พบบ่อย',
  'page.privacy': 'นโยบายความเป็นส่วนตัว',
  'page.care': 'การดูแลหลังรับเลี้ยงและการรับประกันสุขภาพ',
  'page.cost': 'คำนวณค่าเลี้ยงและการผ่อนชำระ',
  'page.kittens': 'ลูกแมวพร้อมรับ',
  'page.kitten': 'ข้อมูลลูกแมว',
  'page.reserve': 'จองลูกแมว',
  'page.reservation': 'สถานะการจอง',
} as const

export type DictKey = keyof typeof th

import { Document, Page, Text, View, StyleSheet, Image, Svg, Path } from '@react-pdf/renderer'

// ── Section types ──────────────────────────────────────────────────────────────

export type TextSection = {
  id: string; type: 'text'; title: string; content: string
}
export type ScopeSection = {
  id: string; type: 'scope'; title: string; items: string[]
}
export type ItemsRow = { description: string; quantity: string; unit_price: string }
export type ItemsSection = {
  id: string; type: 'items'; title: string; note_before?: string; note_after?: string; rows: ItemsRow[]
}
export type HoursRow = { profile: string; hours: string; rate: string }
export type HoursSection = {
  id: string; type: 'hours'; title: string; note_before?: string; note_after?: string; rows: HoursRow[]
}
export type InstallmentRow = { description: string; percentage: string; condition: string }
export type InstallmentsSection = {
  id: string; type: 'installments'; title: string; note_before?: string; note_after?: string; rows: InstallmentRow[]
}
export type ClausesSection = {
  id: string; type: 'clauses'; title: string; items: string[]
}
export type ImageSection = {
  id: string; type: 'image'; title: string; note_before?: string; note_after?: string; url: string
}
export type ContemplasSection = {
  id: string; type: 'contempla'; title: string; note_before?: string; note_after?: string; items: string[]
}
export type TimelineItem = { title: string; description: string }
export type TimelineSection = {
  id: string; type: 'timeline'; title: string; note_before?: string; note_after?: string; items: TimelineItem[]
}
export type CustomTableSection = {
  id: string; type: 'custom_table'; title: string; note_before?: string; note_after?: string; columns: string[]; rows: string[][]
}
export type Section =
  | TextSection | ScopeSection | ItemsSection
  | HoursSection | InstallmentsSection | ClausesSection | ImageSection | ContemplasSection | TimelineSection | CustomTableSection

// ── Proposal / Profile types ──────────────────────────────────────────────────

type Client = { name: string; email: string | null }

export type ProposalForPDF = {
  title: string
  service_description: string | null
  value: number | null
  payment_terms: string | null
  deadline_days: number | null
  valid_until: string | null
  token: string
  proposal_number: string | null
  version: number
  sections: Section[]
  clients: Client | null
}

export type ProfileForPDF = {
  full_name: string | null
  business_name: string | null
  accent_color: string | null
  logo_url: string | null
  phone: string | null
  email_business: string | null
  address: string | null
  website: string | null
  document_type: string | null
  cpf_cnpj: string | null
  instagram: string | null
  linkedin: string | null
  facebook: string | null
  youtube: string | null
  tiktok: string | null
  signature_data: string | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtBRL(v: number | null) {
  if (v === null) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR').format(new Date(y, m - 1, d))
}

function fmtDoc(type: string | null, value: string | null): string | null {
  if (!value) return null
  const d = value.replace(/\D/g, '')
  if (type === 'cnpj' && d.length === 14) {
    return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`
  }
  if (type === 'cpf' && d.length === 11) {
    return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`
  }
  return value
}

function parseNum(v: string | undefined | null): number {
  if (!v) return 0
  const n = parseFloat(String(v).replace(',', '.'))
  return isNaN(n) ? 0 : n
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  contentPage: {
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    paddingTop: 64,
    paddingBottom: 52,
    paddingHorizontal: 40,
  },
  pageHeader: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 56,
    paddingHorizontal: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLogo: {
    width: 32, height: 32,
    objectFit: 'contain',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerName: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  headerSub: {
    fontSize: 7,
    color: '#9ca3af',
    marginTop: 1,
  },
  pageFooter: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 40,
    paddingHorizontal: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  footerPageNum: {
    fontSize: 8,
    color: '#d1d5db',
  },
  footerBrand: {
    fontSize: 8,
    color: '#d1d5db',
  },
  content: {
    // no flex: 1 — fixed height breaks page-flow; let content determine its own height
  },
  clientCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    padding: 14,
    marginBottom: 20,
  },
  clientCol: { flex: 1 },
  fieldLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#9ca3af',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  fieldSub: {
    fontSize: 8.5,
    color: '#6b7280',
    marginTop: 2,
  },
  sectionBlock: {
    marginBottom: 18,
  },
  sectionNote: {
    fontSize: 8.5,
    color: '#6b7280',
    lineHeight: 1.5,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
    marginBottom: 8,
    paddingLeft: 8,
    paddingBottom: 4,
  },
  bodyText: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.6,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  bullet: {
    fontSize: 10,
    color: '#6b7280',
    width: 8,
  },
  bulletText: {
    fontSize: 10,
    color: '#374151',
    flex: 1,
    lineHeight: 1.5,
  },
  clauseRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  clauseNum: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
    width: 16,
  },
  clauseText: {
    fontSize: 9.5,
    color: '#374151',
    flex: 1,
    lineHeight: 1.55,
  },
  table: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tableRowLast: {
    flexDirection: 'row',
  },
  tableRowTotal: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  tableCell: {
    fontSize: 8.5,
    color: '#374151',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableCellHeader: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#6b7280',
    paddingVertical: 6,
    paddingHorizontal: 8,
    letterSpacing: 0.3,
  },
  tableCellBold: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  sectionImage: {
    width: '100%',
    maxHeight: 320,
    objectFit: 'contain',
  },
  valueBox: {
    borderRadius: 8,
    paddingVertical: 22,
    paddingHorizontal: 28,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  valueLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    letterSpacing: 2,
    marginBottom: 10,
  },
  valueAmount: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  acceptTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBottom: 8,
  },
  acceptSub: {
    fontSize: 9,
    color: '#6b7280',
    lineHeight: 1.6,
    marginBottom: 28,
    maxWidth: 360,
  },
  signRow: {
    flexDirection: 'row',
    gap: 28,
  },
  signCol: { flex: 1 },
  signLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    height: 28,
    marginBottom: 5,
  },
  signName: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
    marginBottom: 2,
  },
  signRole: {
    fontSize: 8,
    color: '#9ca3af',
  },
})

// ── Section renderers ─────────────────────────────────────────────────────────

function SectionTitle({ title, accent }: { title: string; accent: string }) {
  return (
    <Text
      minPresenceAhead={40}
      style={[s.sectionTitle, { borderLeftWidth: 2.5, borderLeftColor: accent }]}
    >
      {title}
    </Text>
  )
}

function RenderText({ sec, accent }: { sec: TextSection; accent: string }) {
  return (
    <View style={s.sectionBlock}>
      {sec.title ? <SectionTitle title={sec.title} accent={accent} /> : null}
      <Text style={s.bodyText}>{sec.content}</Text>
    </View>
  )
}

function RenderScope({ sec, accent }: { sec: ScopeSection; accent: string }) {
  return (
    <View style={s.sectionBlock}>
      {sec.title ? <SectionTitle title={sec.title} accent={accent} /> : null}
      {sec.items.filter(Boolean).map((item, i) => (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <View key={i} wrap={false as any} style={s.bulletRow}>
          <Text style={s.bullet}>•</Text>
          <Text style={s.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  )
}

function RenderItems({ sec, accent }: { sec: ItemsSection; accent: string }) {
  const rowTotals = sec.rows.map(r => parseNum(r.quantity) * parseNum(r.unit_price))
  const grandTotal = rowTotals.reduce((a, b) => a + b, 0)
  return (
    <View style={s.sectionBlock}>
      {sec.title ? <SectionTitle title={sec.title} accent={accent} /> : null}
      {sec.note_before ? <Text style={[s.sectionNote, { marginBottom: 6, marginTop: -4 }]}>{sec.note_before}</Text> : null}
      <View style={s.table}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <View wrap={false as any} style={s.tableHeaderRow}>
          <Text style={[s.tableCellHeader, { flex: 4.5 }]}>DESCRIÇÃO</Text>
          <Text style={[s.tableCellHeader, { flex: 1 }]}>QTD</Text>
          <Text style={[s.tableCellHeader, { flex: 2, textAlign: 'right' }]}>VLR UNIT.</Text>
          <Text style={[s.tableCellHeader, { flex: 2.5, textAlign: 'right' }]}>TOTAL</Text>
        </View>
        {sec.rows.map((row, i) => (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <View key={i} wrap={false as any} style={s.tableRow}>
            <Text style={[s.tableCell, { flex: 4.5 }]}>{row.description}</Text>
            <Text style={[s.tableCell, { flex: 1 }]}>{row.quantity}</Text>
            <Text style={[s.tableCell, { flex: 2, textAlign: 'right' }]}>{row.unit_price}</Text>
            <Text style={[s.tableCell, { flex: 2.5, textAlign: 'right' }]}>{fmtBRL(rowTotals[i])}</Text>
          </View>
        ))}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <View wrap={false as any} style={s.tableRowTotal}>
          <Text style={[s.tableCellBold, { flex: 7.5 }]}>TOTAL GERAL</Text>
          <Text style={[s.tableCellBold, { flex: 2.5, textAlign: 'right' }]}>{fmtBRL(grandTotal)}</Text>
        </View>
      </View>
      {sec.note_after ? <Text style={[s.sectionNote, { marginTop: 6 }]}>{sec.note_after}</Text> : null}
    </View>
  )
}

function RenderHours({ sec, accent }: { sec: HoursSection; accent: string }) {
  const rowTotals = sec.rows.map(r => parseNum(r.hours) * parseNum(r.rate))
  const grandTotal = rowTotals.reduce((a, b) => a + b, 0)
  return (
    <View style={s.sectionBlock}>
      {sec.title ? <SectionTitle title={sec.title} accent={accent} /> : null}
      {sec.note_before ? <Text style={[s.sectionNote, { marginBottom: 6, marginTop: -4 }]}>{sec.note_before}</Text> : null}
      <View style={s.table}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <View wrap={false as any} style={s.tableHeaderRow}>
          <Text style={[s.tableCellHeader, { flex: 3.5 }]}>PERFIL</Text>
          <Text style={[s.tableCellHeader, { flex: 1.5 }]}>HORAS</Text>
          <Text style={[s.tableCellHeader, { flex: 2.5, textAlign: 'right' }]}>VLR/HORA</Text>
          <Text style={[s.tableCellHeader, { flex: 2.5, textAlign: 'right' }]}>TOTAL</Text>
        </View>
        {sec.rows.map((row, i) => (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <View key={i} wrap={false as any} style={s.tableRow}>
            <Text style={[s.tableCell, { flex: 3.5 }]}>{row.profile}</Text>
            <Text style={[s.tableCell, { flex: 1.5 }]}>{row.hours}</Text>
            <Text style={[s.tableCell, { flex: 2.5, textAlign: 'right' }]}>{row.rate}</Text>
            <Text style={[s.tableCell, { flex: 2.5, textAlign: 'right' }]}>{fmtBRL(rowTotals[i])}</Text>
          </View>
        ))}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <View wrap={false as any} style={s.tableRowTotal}>
          <Text style={[s.tableCellBold, { flex: 7.5 }]}>TOTAL GERAL</Text>
          <Text style={[s.tableCellBold, { flex: 2.5, textAlign: 'right' }]}>{fmtBRL(grandTotal)}</Text>
        </View>
      </View>
      {sec.note_after ? <Text style={[s.sectionNote, { marginTop: 6 }]}>{sec.note_after}</Text> : null}
    </View>
  )
}

function RenderInstallments({ sec, accent }: { sec: InstallmentsSection; accent: string }) {
  return (
    <View style={s.sectionBlock}>
      {sec.title ? <SectionTitle title={sec.title} accent={accent} /> : null}
      {sec.note_before ? <Text style={[s.sectionNote, { marginBottom: 6, marginTop: -4 }]}>{sec.note_before}</Text> : null}
      <View style={s.table}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <View wrap={false as any} style={s.tableHeaderRow}>
          <Text style={[s.tableCellHeader, { flex: 2.5 }]}>DESCRIÇÃO</Text>
          <Text style={[s.tableCellHeader, { flex: 1 }]}>%</Text>
          <Text style={[s.tableCellHeader, { flex: 2 }]}>CONDIÇÃO</Text>
        </View>
        {sec.rows.map((row, i) => (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <View key={i} wrap={false as any} style={i === sec.rows.length - 1 ? s.tableRowLast : s.tableRow}>
            <Text style={[s.tableCell, { flex: 2.5 }]}>{row.description}</Text>
            <Text style={[s.tableCell, { flex: 1 }]}>{row.percentage}</Text>
            <Text style={[s.tableCell, { flex: 2 }]}>{row.condition}</Text>
          </View>
        ))}
      </View>
      {sec.note_after ? <Text style={[s.sectionNote, { marginTop: 6 }]}>{sec.note_after}</Text> : null}
    </View>
  )
}

function RenderClauses({ sec, accent }: { sec: ClausesSection; accent: string }) {
  return (
    <View style={s.sectionBlock}>
      {sec.title ? <SectionTitle title={sec.title} accent={accent} /> : null}
      {sec.items.filter(Boolean).map((item, i) => (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <View key={i} wrap={false as any} style={s.clauseRow}>
          <Text style={s.clauseNum}>{i + 1}.</Text>
          <Text style={s.clauseText}>{item}</Text>
        </View>
      ))}
    </View>
  )
}

function RenderImage({ sec, accent }: { sec: ImageSection; accent: string }) {
  if (!sec.url) return null
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <View wrap={false as any} style={s.sectionBlock}>
      {sec.title ? <SectionTitle title={sec.title} accent={accent} /> : null}
      {sec.note_before ? <Text style={[s.sectionNote, { marginBottom: 6, marginTop: -4 }]}>{sec.note_before}</Text> : null}
      <View style={{ alignItems: 'center' }}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={sec.url} style={s.sectionImage} />
      </View>
      {sec.note_after ? <Text style={[s.sectionNote, { marginTop: 6 }]}>{sec.note_after}</Text> : null}
    </View>
  )
}

function RenderContempla({ sec, accent }: { sec: ContemplasSection; accent: string }) {
  const filtered = sec.items.filter(Boolean)
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <View wrap={false as any} style={s.sectionBlock}>
      {sec.title ? <SectionTitle title={sec.title} accent={accent} /> : null}
      {sec.note_before ? <Text style={[s.sectionNote, { marginBottom: 6, marginTop: -4 }]}>{sec.note_before}</Text> : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {filtered.map((item, i) => (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <View key={i} wrap={false as any} style={{ width: '50%', flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 3, paddingRight: 8 }}>
            <Svg width="9" height="9" viewBox="0 0 10 10" style={{ marginRight: 4, marginTop: 1, flexShrink: 0 }}>
              <Path d="M1.5 5.5L4 8L8.5 2" stroke={accent} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={{ fontSize: 9, color: '#374151', flex: 1, lineHeight: 1.45 }}>{item}</Text>
          </View>
        ))}
      </View>
      {sec.note_after ? <Text style={[s.sectionNote, { marginTop: 6 }]}>{sec.note_after}</Text> : null}
    </View>
  )
}

function RenderTimeline({ sec, accent }: { sec: TimelineSection; accent: string }) {
  const filtered = sec.items.filter(item => item.title || item.description)
  if (!filtered.length) return null
  return (
    <View style={s.sectionBlock}>
      {sec.title ? <SectionTitle title={sec.title} accent={accent} /> : null}
      {sec.note_before ? <Text style={[s.sectionNote, { marginBottom: 8, marginTop: -4 }]}>{sec.note_before}</Text> : null}
      {filtered.map((item, i) => {
        const isLast = i === filtered.length - 1
        return (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <View key={i} wrap={false as any} style={{ flexDirection: 'row' }}>
            {/* bullet + connector */}
            <View style={{ width: 18, alignItems: 'center' }}>
              <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: accent, marginTop: 1 }} />
              {!isLast && (
                <View style={{ width: 1.5, flex: 1, backgroundColor: accent, opacity: 0.25, marginTop: 2 }} />
              )}
            </View>
            {/* content */}
            <View style={{ flex: 1, paddingBottom: isLast ? 0 : 10, paddingLeft: 6 }}>
              <Text style={{ fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: accent, marginBottom: 2 }}>
                {item.title}
              </Text>
              {item.description ? (
                <Text style={{ fontSize: 9, color: '#6B7280', lineHeight: 1.45 }}>{item.description}</Text>
              ) : null}
            </View>
          </View>
        )
      })}
      {sec.note_after ? <Text style={[s.sectionNote, { marginTop: 6 }]}>{sec.note_after}</Text> : null}
    </View>
  )
}

function RenderCustomTable({ sec, accent }: { sec: CustomTableSection; accent: string }) {
  if (!sec.columns.length) return null
  return (
    <View style={s.sectionBlock}>
      {sec.title ? <SectionTitle title={sec.title} accent={accent} /> : null}
      {sec.note_before ? <Text style={[s.sectionNote, { marginBottom: 6, marginTop: -4 }]}>{sec.note_before}</Text> : null}
      <View style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <View wrap={false as any} style={{ flexDirection: 'row', backgroundColor: accent }}>
          {sec.columns.map((col, ci) => (
            <Text key={ci} style={{
              flex: 1, fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#ffffff',
              padding: 6, textAlign: 'center', letterSpacing: 0.4,
            }}>
              {col.toUpperCase()}
            </Text>
          ))}
        </View>
        {sec.rows.map((row, ri) => (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <View key={ri} wrap={false as any} style={{
            flexDirection: 'row',
            backgroundColor: ri % 2 === 0 ? '#ffffff' : '#f9fafb',
            borderTopWidth: 1, borderTopColor: '#f3f4f6',
          }}>
            {sec.columns.map((_, ci) => (
              <Text key={ci} style={{
                flex: 1, fontSize: 9, color: '#374151',
                padding: 6, lineHeight: 1.4,
                borderLeftWidth: ci > 0 ? 1 : 0, borderLeftColor: '#f3f4f6',
              }}>
                {row[ci] ?? ''}
              </Text>
            ))}
          </View>
        ))}
      </View>
      {sec.note_after ? <Text style={[s.sectionNote, { marginTop: 6 }]}>{sec.note_after}</Text> : null}
    </View>
  )
}

function renderSection(sec: Section, accent: string) {
  switch (sec.type) {
    case 'text':         return <RenderText key={sec.id} sec={sec} accent={accent} />
    case 'scope':        return <RenderScope key={sec.id} sec={sec} accent={accent} />
    case 'items':        return <RenderItems key={sec.id} sec={sec} accent={accent} />
    case 'hours':        return <RenderHours key={sec.id} sec={sec} accent={accent} />
    case 'installments': return <RenderInstallments key={sec.id} sec={sec} accent={accent} />
    case 'clauses':      return <RenderClauses key={sec.id} sec={sec} accent={accent} />
    case 'image':        return <RenderImage key={sec.id} sec={sec} accent={accent} />
    case 'contempla':    return <RenderContempla key={sec.id} sec={sec} accent={accent} />
    case 'timeline':     return <RenderTimeline key={sec.id} sec={sec} accent={accent} />
    case 'custom_table': return <RenderCustomTable key={sec.id} sec={sec} accent={accent} />
  }
}

// ── Main document ─────────────────────────────────────────────────────────────

export function ProposalPDFDocument({
  proposal,
  profile,
  isFreePlan = true,
}: {
  proposal: ProposalForPDF
  profile: ProfileForPDF
  isFreePlan?: boolean
}) {
  const accent      = profile.accent_color ?? '#1D9E75'
  const displayName = profile.business_name ?? profile.full_name ?? 'Freelancer'
  const ref = proposal.proposal_number
    ?? ('#' + proposal.token.substring(0, 8).toUpperCase() + ' · v' + proposal.version)
  const today        = new Intl.DateTimeFormat('pt-BR').format(new Date())
  const docFormatted = fmtDoc(profile.document_type, profile.cpf_cnpj)
  const sections     = proposal.sections ?? []

  function coverTitleFontSize(title: string): number {
    const len = title.length
    if (len <= 32) return 28
    if (len <= 52) return 22
    if (len <= 72) return 17
    return 14
  }

  const CoverPage = (
    <Page size="A4" style={{ fontFamily: 'Helvetica', backgroundColor: accent }}>
      <View style={{ flex: 1, paddingHorizontal: 48, paddingTop: 60, justifyContent: 'space-between' }}>
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          {profile.logo_url && (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image
              src={profile.logo_url}
              style={{ width: 80, height: 80, objectFit: 'contain', marginBottom: 20 }}
            />
          )}
          <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', letterSpacing: 3, marginBottom: 14, fontFamily: 'Helvetica' }}>
            PROPOSTA COMERCIAL
          </Text>
          <Text style={{ fontSize: coverTitleFontSize(proposal.title), fontFamily: 'Helvetica-Bold', color: '#ffffff', lineHeight: 1.3, marginBottom: 10, textAlign: 'center' }}>
            {proposal.title}
          </Text>
          <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontFamily: 'Helvetica' }}>
            {displayName}
          </Text>
        </View>
        <View style={{ backgroundColor: 'rgba(0,0,0,0.2)', marginHorizontal: -48, paddingHorizontal: 48, paddingVertical: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            {proposal.clients && (
              <View>
                <Text style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.55)', letterSpacing: 1.5, marginBottom: 5, fontFamily: 'Helvetica-Bold' }}>CLIENTE</Text>
                <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#ffffff', marginBottom: 3 }}>
                  {proposal.clients.name}
                </Text>
                {proposal.clients.email && (
                  <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.65)' }}>{proposal.clients.email}</Text>
                )}
              </View>
            )}
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.55)', letterSpacing: 1.5, marginBottom: 5, fontFamily: 'Helvetica-Bold', textAlign: 'right' }}>PROPOSTA</Text>
              <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#ffffff', marginBottom: 3, textAlign: 'right' }}>{ref}</Text>
              <Text style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.65)', textAlign: 'right' }}>Emitida em {today}</Text>
              {proposal.valid_until && (
                <Text style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.65)', marginTop: 1, textAlign: 'right' }}>
                  Válida até {fmtDate(proposal.valid_until)}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>
    </Page>
  )

  const FixedHeader = (
    <View fixed style={s.pageHeader}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        {profile.logo_url && <Image src={profile.logo_url} style={s.headerLogo} />}
        <View>
          <Text style={s.headerName}>{displayName}</Text>
          <Text style={s.headerSub}>{ref}</Text>
        </View>
      </View>
      <View style={s.headerRight}>
        {profile.phone          && <Text style={s.headerSub}>{profile.phone}</Text>}
        {profile.email_business && <Text style={s.headerSub}>{profile.email_business}</Text>}
        {profile.website        && <Text style={s.headerSub}>{profile.website}</Text>}
      </View>
    </View>
  )

  const FixedFooter = (
    <View fixed style={s.pageFooter}>
      <Text style={s.footerPageNum} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      {isFreePlan && <Text style={s.footerBrand}>Gerado com FreelanceFlow</Text>}
    </View>
  )

  const ContentPage = (
    <Page size="A4" style={s.contentPage}>
      {FixedHeader}
      {FixedFooter}

      <View style={s.content}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <View wrap={false as any} style={s.clientCard}>
          {proposal.clients && (
            <View>
              <Text style={s.fieldLabel}>CLIENTE</Text>
              <Text style={s.fieldValue}>{proposal.clients.name}</Text>
              {proposal.clients.email && <Text style={s.fieldSub}>{proposal.clients.email}</Text>}
            </View>
          )}
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[s.fieldLabel, { textAlign: 'right' }]}>FORNECEDOR</Text>
            <Text style={[s.fieldValue, { textAlign: 'right' }]}>{displayName}</Text>
            {docFormatted && (
              <Text style={[s.fieldSub, { textAlign: 'right' }]}>{profile.document_type?.toUpperCase()}: {docFormatted}</Text>
            )}
            {profile.address && <Text style={[s.fieldSub, { textAlign: 'right' }]}>{profile.address}</Text>}
          </View>
        </View>

        {/* Legacy service_description */}
        {proposal.service_description && sections.length === 0 && (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <View wrap={false as any} style={s.sectionBlock}>
            <SectionTitle title="ESCOPO DO SERVIÇO" accent={accent} />
            <Text style={s.bodyText}>{proposal.service_description}</Text>
          </View>
        )}

        {sections.map(sec => renderSection(sec, accent))}

        {(proposal.deadline_days !== null || proposal.payment_terms) && (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <View wrap={false as any} style={{ flexDirection: 'row', gap: 24, marginBottom: 18, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' }}>
            {proposal.deadline_days !== null && (
              <View style={{ flex: 1 }}>
                <Text style={s.fieldLabel}>PRAZO DE ENTREGA</Text>
                <Text style={{ fontSize: 10, color: '#374151' }}>
                  {proposal.deadline_days} {proposal.deadline_days === 1 ? 'dia' : 'dias'}
                </Text>
              </View>
            )}
            {proposal.payment_terms && (
              <View style={{ flex: 2 }}>
                <Text style={s.fieldLabel}>FORMA DE PAGAMENTO</Text>
                <Text style={{ fontSize: 10, color: '#374151' }}>{proposal.payment_terms}</Text>
              </View>
            )}
          </View>
        )}

        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <View wrap={false as any} style={[s.valueBox, { backgroundColor: accent }]}>
          <Text style={s.valueLabel}>VALOR TOTAL</Text>
          <Text style={s.valueAmount}>{fmtBRL(proposal.value)}</Text>
        </View>

        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <View wrap={false as any} style={{ paddingTop: 20, borderTopWidth: 1, borderTopColor: '#e5e7eb' }}>
          <Text style={[s.acceptTitle, { borderLeftWidth: 3, borderLeftColor: accent, paddingLeft: 10 }]}>
            Aceite
          </Text>
          <Text style={s.acceptSub}>
            Ao assinar abaixo, o contratante declara ter lido e concordado com todos os termos e condições desta proposta comercial. Esta proposta tem validade conforme indicado acima. Os preços, condições e escopo aqui descritos são exclusivos para o projeto especificado e podem ser revisados caso o escopo seja alterado.
          </Text>
          <View style={s.signRow}>
            <View style={s.signCol}>
              {profile.signature_data ? (
                // eslint-disable-next-line jsx-a11y/alt-text
                <Image
                  src={profile.signature_data}
                  style={{ height: 28, objectFit: 'contain', marginBottom: 0 }}
                />
              ) : (
                <View style={{ height: 28 }} />
              )}
              <View style={s.signLine} />
              <Text style={s.signName}>{displayName}</Text>
              <Text style={s.signRole}>Prestador de serviços</Text>
            </View>
            <View style={s.signCol}>
              <View style={{ height: 28 }} />
              <View style={s.signLine} />
              <Text style={s.signName}>{proposal.clients?.name ?? 'Cliente'}</Text>
              <Text style={s.signRole}>Contratante</Text>
            </View>
            <View style={[s.signCol, { maxWidth: 110 }]}>
              <View style={{ height: 28 }} />
              <View style={{ height: 28, marginBottom: 5 }} />
              <Text style={s.signName}>Data: ___/___/______</Text>
            </View>
          </View>
        </View>
      </View>
    </Page>
  )

  return (
    <Document>
      {CoverPage}
      {ContentPage}
    </Document>
  )
}

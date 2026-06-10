import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

type Client = { name: string; email: string | null }

export type ProposalForPDF = {
  title: string
  service_description: string | null
  value: number | null
  payment_terms: string | null
  deadline_days: number | null
  valid_until: string | null
  token: string
  clients: Client | null
}

export type ProfileForPDF = {
  full_name: string | null
  business_name: string | null
  accent_color: string | null
}

function fmtBRL(v: number | null) {
  if (v === null) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR').format(new Date(y, m - 1, d))
}

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    paddingBottom: 48,
  },
  header: {
    paddingVertical: 28,
    paddingHorizontal: 40,
  },
  headerName: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 8,
    color: '#ffffff',
    letterSpacing: 1.5,
  },
  content: {
    paddingHorizontal: 40,
    paddingTop: 22,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  proposalTitle: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    maxWidth: 300,
    flexShrink: 1,
    marginRight: 16,
  },
  metaBlock: {
    alignItems: 'flex-end',
  },
  metaRef: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
    marginBottom: 3,
  },
  metaDate: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 2,
  },
  clientCard: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    padding: 14,
    marginBottom: 22,
  },
  clientCol: {
    flex: 1,
  },
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
    fontSize: 9,
    color: '#6b7280',
    marginTop: 2,
  },
  section: {
    marginBottom: 22,
  },
  sectionLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#9ca3af',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  bodyText: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.6,
  },
  termsRow: {
    flexDirection: 'row',
    paddingTop: 16,
    marginBottom: 22,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  termCol: {
    flex: 1,
    marginRight: 16,
  },
  termValue: {
    fontSize: 10,
    color: '#374151',
  },
  valueBox: {
    borderRadius: 8,
    paddingVertical: 22,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  valueLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  valueAmount: {
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#d1d5db',
  },
})

export function ProposalPDFDocument({
  proposal,
  profile,
}: {
  proposal: ProposalForPDF
  profile: ProfileForPDF
}) {
  const accent = profile.accent_color ?? '#1D9E75'
  const displayName = profile.business_name ?? profile.full_name ?? 'Freelancer'
  const ref = '#' + proposal.token.substring(0, 8).toUpperCase()
  const today = new Intl.DateTimeFormat('pt-BR').format(new Date())

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={[s.header, { backgroundColor: accent }]}>
          <Text style={s.headerName}>{displayName}</Text>
          <Text style={s.headerSub}>PROPOSTA COMERCIAL</Text>
        </View>

        <View style={s.content}>
          <View style={s.titleRow}>
            <Text style={s.proposalTitle}>{proposal.title}</Text>
            <View style={s.metaBlock}>
              <Text style={s.metaRef}>{ref}</Text>
              <Text style={s.metaDate}>Emitida em {today}</Text>
              {proposal.valid_until && (
                <Text style={s.metaDate}>Válida até {fmtDate(proposal.valid_until)}</Text>
              )}
            </View>
          </View>

          {proposal.clients && (
            <View style={s.clientCard}>
              <View style={s.clientCol}>
                <Text style={s.fieldLabel}>PARA</Text>
                <Text style={s.fieldValue}>{proposal.clients.name}</Text>
                {proposal.clients.email && (
                  <Text style={s.fieldSub}>{proposal.clients.email}</Text>
                )}
              </View>
              <View style={s.clientCol}>
                <Text style={s.fieldLabel}>DE</Text>
                <Text style={s.fieldValue}>{displayName}</Text>
              </View>
            </View>
          )}

          {proposal.service_description && (
            <View style={s.section}>
              <Text style={s.sectionLabel}>ESCOPO DO SERVIÇO</Text>
              <Text style={s.bodyText}>{proposal.service_description}</Text>
            </View>
          )}

          {(proposal.deadline_days !== null || proposal.payment_terms) && (
            <View style={s.termsRow}>
              {proposal.deadline_days !== null && (
                <View style={s.termCol}>
                  <Text style={s.fieldLabel}>PRAZO DE ENTREGA</Text>
                  <Text style={s.termValue}>
                    {proposal.deadline_days} {proposal.deadline_days === 1 ? 'dia' : 'dias'}
                  </Text>
                </View>
              )}
              {proposal.payment_terms && (
                <View style={s.termCol}>
                  <Text style={s.fieldLabel}>FORMA DE PAGAMENTO</Text>
                  <Text style={s.termValue}>{proposal.payment_terms}</Text>
                </View>
              )}
            </View>
          )}

          <View style={[s.valueBox, { backgroundColor: accent }]}>
            <Text style={s.valueLabel}>VALOR TOTAL</Text>
            <Text style={s.valueAmount}>{fmtBRL(proposal.value)}</Text>
          </View>
        </View>

        <View style={s.footer} fixed>
          <Text style={s.footerText}>Gerado com FreelanceFlow</Text>
        </View>
      </Page>
    </Document>
  )
}

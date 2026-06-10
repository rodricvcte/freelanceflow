import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

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

function fmtDoc(type: string | null, value: string | null): string | null {
  if (!value) return null
  const d = value.replace(/\D/g, '')
  if (type === 'cnpj' && d.length === 14) {
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
  }
  if (type === 'cpf' && d.length === 11) {
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
  }
  return value
}

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    paddingBottom: 64,
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  logo: {
    width: 44,
    height: 44,
    objectFit: 'contain',
    borderRadius: 4,
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  headerSub: {
    fontSize: 8,
    color: '#ffffff',
    letterSpacing: 1.5,
  },
  content: {
    paddingHorizontal: 40,
    paddingTop: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  proposalTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    maxWidth: 280,
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
    marginBottom: 20,
    gap: 16,
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
    marginBottom: 20,
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
    paddingTop: 14,
    marginBottom: 20,
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
    paddingVertical: 20,
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
  signatureSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    flexDirection: 'row',
    gap: 32,
  },
  signatureCol: {
    flex: 1,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    height: 28,
    marginBottom: 6,
  },
  signatureLabel: {
    fontSize: 8,
    color: '#6b7280',
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
  isFreePlan = true,
}: {
  proposal: ProposalForPDF
  profile: ProfileForPDF
  isFreePlan?: boolean
}) {
  const accent = profile.accent_color ?? '#1D9E75'
  const displayName = profile.business_name ?? profile.full_name ?? 'Freelancer'
  const ref = proposal.proposal_number ?? ('#' + proposal.token.substring(0, 8).toUpperCase())
  const today = new Intl.DateTimeFormat('pt-BR').format(new Date())
  const docFormatted = fmtDoc(profile.document_type, profile.cpf_cnpj)

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={[s.header, { backgroundColor: accent }]}>
          {profile.logo_url && (
            <Image src={profile.logo_url} style={s.logo} />
          )}
          <View style={s.headerText}>
            <Text style={s.headerName}>{displayName}</Text>
            <Text style={s.headerSub}>PROPOSTA COMERCIAL</Text>
          </View>
        </View>

        <View style={s.content}>
          {/* Title + meta */}
          <View style={s.titleRow}>
            <View>
              <Text style={s.proposalTitle}>{proposal.title}</Text>
            </View>
            <View style={s.metaBlock}>
              <Text style={s.metaRef}>{ref} · v{proposal.version}</Text>
              <Text style={s.metaDate}>Emitida em {today}</Text>
              {proposal.valid_until && (
                <Text style={s.metaDate}>Válida até {fmtDate(proposal.valid_until)}</Text>
              )}
            </View>
          </View>

          {/* Client + Freelancer card */}
          <View style={s.clientCard}>
            {proposal.clients && (
              <View style={s.clientCol}>
                <Text style={s.fieldLabel}>PARA</Text>
                <Text style={s.fieldValue}>{proposal.clients.name}</Text>
                {proposal.clients.email && (
                  <Text style={s.fieldSub}>{proposal.clients.email}</Text>
                )}
              </View>
            )}
            <View style={s.clientCol}>
              <Text style={s.fieldLabel}>DE</Text>
              <Text style={s.fieldValue}>{displayName}</Text>
              {profile.phone && <Text style={s.fieldSub}>{profile.phone}</Text>}
              {profile.email_business && <Text style={s.fieldSub}>{profile.email_business}</Text>}
              {profile.website && <Text style={s.fieldSub}>{profile.website}</Text>}
              {profile.address && <Text style={s.fieldSub}>{profile.address}</Text>}
              {docFormatted && (
                <Text style={s.fieldSub}>
                  {profile.document_type?.toUpperCase()}: {docFormatted}
                </Text>
              )}
            </View>
          </View>

          {/* Scope */}
          {proposal.service_description && (
            <View style={s.section}>
              <Text style={s.sectionLabel}>ESCOPO DO SERVIÇO</Text>
              <Text style={s.bodyText}>{proposal.service_description}</Text>
            </View>
          )}

          {/* Terms */}
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

          {/* Value */}
          <View style={[s.valueBox, { backgroundColor: accent }]}>
            <Text style={s.valueLabel}>VALOR TOTAL</Text>
            <Text style={s.valueAmount}>{fmtBRL(proposal.value)}</Text>
          </View>

          {/* Signature */}
          <View style={s.signatureSection}>
            <View style={s.signatureCol}>
              <View style={s.signatureLine} />
              <Text style={s.signatureLabel}>De acordo — {displayName}</Text>
            </View>
            <View style={s.signatureCol}>
              <View style={s.signatureLine} />
              <Text style={s.signatureLabel}>De acordo — {proposal.clients?.name ?? 'Cliente'}</Text>
            </View>
            <View style={[s.signatureCol, { maxWidth: 100 }]}>
              <View style={s.signatureLine} />
              <Text style={s.signatureLabel}>Data</Text>
            </View>
          </View>
        </View>

        {isFreePlan && (
          <View style={s.footer} fixed>
            <Text style={s.footerText}>Gerado com FreelanceFlow</Text>
          </View>
        )}
      </Page>
    </Document>
  )
}

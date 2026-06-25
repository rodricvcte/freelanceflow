import { Document, Page, Text, View, StyleSheet, Svg, Path } from '@react-pdf/renderer'

const GREEN  = '#1D9E75'
const GRAY   = '#6b7280'
const DARK   = '#111827'
const LIGHT  = '#f9fafb'
const BORDER = '#e5e7eb'

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: DARK,
    padding: 48,
    backgroundColor: '#ffffff',
  },
  headerBar: {
    backgroundColor: GREEN,
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerBrand: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#ffffff' },
  headerTitle: { fontSize: 9, color: 'rgba(255,255,255,0.75)' },
  title: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 10,
    color: GRAY,
    textAlign: 'center',
    marginBottom: 24,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: BORDER, marginBottom: 20 },
  section: { marginBottom: 18 },
  sectionSeparated: {
    marginBottom: 0,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    marginTop: 0,
  },
  sectionAfterSeparator: { marginBottom: 18, marginTop: 18 },
  sectionLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: GREEN,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  card: {
    backgroundColor: LIGHT,
    borderRadius: 6,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  row: { flexDirection: 'row', marginBottom: 6 },
  rowLast: { flexDirection: 'row' },
  fieldLabel: { fontSize: 9, color: GRAY, width: 120, flexShrink: 0 },
  fieldValue: { fontSize: 9, color: DARK, flex: 1, flexWrap: 'wrap' },
  fieldValueBold: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: DARK, flex: 1 },
  hashBox: {
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: BORDER,
  },
  hashLabel: { fontSize: 8, color: GRAY, marginBottom: 4 },
  hashValue: { fontSize: 7, color: '#374151', fontFamily: 'Helvetica', letterSpacing: 0.3 },
  signatureBox: {
    borderWidth: 1,
    borderColor: GREEN,
    borderRadius: 6,
    padding: 14,
    backgroundColor: '#f0fdf8',
  },
  signatureName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: GREEN,
    marginBottom: 4,
  },
  signatureCaption: { fontSize: 8, color: GRAY },
  footer: {
    position: 'absolute',
    bottom: 32,
    left: 48,
    right: 48,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 10,
  },
  footerText: { fontSize: 7, color: '#9ca3af', textAlign: 'center', lineHeight: 1.5 },
})

export type CertificateData = {
  proposalTitle:  string
  proposalCode:   string | null
  proposalValue:  number | null
  deadlineDays:   number | null
  freelancerName: string
  clientName:     string
  ip:             string
  userAgent:      string
  timestamp:      string
  contentHash:    string
}

function fmtBRL(v: number | null) {
  if (v === null) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function fmtDatetime(iso: string) {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      timeZone: 'America/Sao_Paulo',
    }).format(new Date(iso)) + ' (Horário de Brasília)'
  } catch {
    return iso
  }
}

function parseUserAgent(ua: string): string {
  if (!ua) return '—'

  let browser = ''
  const opr = ua.match(/OPR\/(\d+)/)
  const edg = ua.match(/Edg\/(\d+)/)
  const ffx = ua.match(/Firefox\/(\d+)/)
  const chr = ua.match(/Chrome\/(\d+)/)
  const saf = ua.match(/Version\/(\d+).*Safari/)

  if (opr)      browser = `Opera ${opr[1]}`
  else if (edg) browser = `Edge ${edg[1]}`
  else if (ffx) browser = `Firefox ${ffx[1]}`
  else if (chr) browser = `Chrome ${chr[1]}`
  else if (saf) browser = `Safari ${saf[1]}`

  let os = ''
  const and = ua.match(/Android (\d+)/)
  if (/Windows NT 10\.0/.test(ua))     os = 'Windows 10'
  else if (/Windows NT 6\.3/.test(ua)) os = 'Windows 8.1'
  else if (/Windows NT 6\.2/.test(ua)) os = 'Windows 8'
  else if (/Windows NT 6\.1/.test(ua)) os = 'Windows 7'
  else if (/Windows NT/.test(ua))      os = 'Windows'
  else if (/iPhone/.test(ua))          os = 'iPhone'
  else if (/iPad/.test(ua))            os = 'iPad'
  else if (and)                        os = `Android ${and[1]}`
  else if (/Mac OS X/.test(ua))        os = 'macOS'
  else if (/Linux/.test(ua))           os = 'Linux'

  if (browser && os) return `${browser} · ${os}`
  return browser || os || ua
}

function FreelanceFlowLogo() {
  return (
    <Svg width={22} height={22} viewBox="0 0 32 32">
      {/* rounded rect background */}
      <Path fill="white" d="M7,0 L25,0 Q32,0 32,7 L32,25 Q32,32 25,32 L7,32 Q0,32 0,25 L0,7 Q0,0 7,0 Z" />
      {/* F letter */}
      <Path fill="#1D9E75" d="M8 6h16v5H13v4h11v5H13v12H8V6z" />
    </Svg>
  )
}

export function CertificatePDFDocument({ data }: { data: CertificateData }) {
  return (
    <Document title="Certificado de Aceite — FreelanceFlow">
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.headerBar}>
          <View style={s.headerLeft}>
            <FreelanceFlowLogo />
            <Text style={s.headerBrand}>FreelanceFlow</Text>
          </View>
          <Text style={s.headerTitle}>Documento com validade jurídica</Text>
        </View>

        {/* Title */}
        <Text style={s.title}>Certificado de Aceite</Text>
        <Text style={s.subtitle}>
          Este documento comprova o aceite eletrônico da proposta comercial abaixo identificada.
        </Text>

        <View style={s.divider} />

        {/* Proposta — com separador inferior */}
        <View style={s.sectionSeparated}>
          <Text style={s.sectionLabel}>PROPOSTA</Text>
          <View style={s.card}>
            <View style={s.row}>
              <Text style={s.fieldLabel}>Título</Text>
              <Text style={s.fieldValueBold}>{data.proposalTitle}</Text>
            </View>
            {data.proposalCode && (
              <View style={s.row}>
                <Text style={s.fieldLabel}>Código</Text>
                <Text style={s.fieldValue}>{data.proposalCode}</Text>
              </View>
            )}
            <View style={s.row}>
              <Text style={s.fieldLabel}>Valor</Text>
              <Text style={s.fieldValue}>{fmtBRL(data.proposalValue)}</Text>
            </View>
            <View style={s.rowLast}>
              <Text style={s.fieldLabel}>Fornecedor</Text>
              <Text style={s.fieldValue}>{data.freelancerName}</Text>
            </View>
          </View>
        </View>

        {/* Assinatura — com separador inferior */}
        <View style={s.sectionAfterSeparator}>
          <View style={s.sectionSeparated}>
            <Text style={s.sectionLabel}>ASSINATURA DO CLIENTE</Text>
            <View style={s.signatureBox}>
              <Text style={s.signatureName}>{data.clientName}</Text>
              <Text style={s.signatureCaption}>Nome digitado pelo cliente no momento do aceite</Text>
            </View>
          </View>
        </View>

        {/* Registro técnico */}
        <View style={s.sectionAfterSeparator}>
          <Text style={s.sectionLabel}>REGISTRO TÉCNICO DO ACEITE</Text>
          <View style={s.card}>
            <View style={s.row}>
              <Text style={s.fieldLabel}>Data e hora</Text>
              <Text style={s.fieldValue}>{fmtDatetime(data.timestamp)}</Text>
            </View>
            <View style={s.row}>
              <Text style={s.fieldLabel}>Endereço IP</Text>
              <Text style={s.fieldValue}>{data.ip || '—'}</Text>
            </View>
            <View style={s.rowLast}>
              <Text style={s.fieldLabel}>Dispositivo</Text>
              <Text style={s.fieldValue}>{parseUserAgent(data.userAgent)}</Text>
            </View>
            <View style={s.hashBox}>
              <Text style={s.hashLabel}>Hash SHA-256 do conteúdo da proposta</Text>
              <Text style={s.hashValue}>{data.contentHash}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            Documento gerado automaticamente pelo FreelanceFlow conforme Marco Civil da Internet (Lei 12.965/2014).{'\n'}
            Este certificado tem validade jurídica como prova de aceite eletrônico.
          </Text>
        </View>

      </Page>
    </Document>
  )
}

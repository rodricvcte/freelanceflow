import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { generateAndSaveProposalPDF } from '@/lib/generate-pdf'

export const runtime = 'nodejs'

// GET — download PDF with proposal_number as filename
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: proposal } = await supabase
    .from('proposals')
    .select('id, pdf_url, proposal_number')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!proposal) return NextResponse.json({ error: 'Proposta não encontrada' }, { status: 404 })

  if (!proposal.pdf_url) {
    return NextResponse.json({ error: 'PDF ainda não gerado' }, { status: 404 })
  }

  const filename = proposal.proposal_number
    ? `${proposal.proposal_number}.pdf`
    : `proposta.pdf`

  const upstream = await fetch(proposal.pdf_url)
  if (!upstream.ok) {
    return NextResponse.json({ error: 'Erro ao obter PDF' }, { status: 502 })
  }

  const buffer = await upstream.arrayBuffer()
  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}

// POST — generate (or regenerate) PDF and save to storage
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: exists } = await supabase
    .from('proposals')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!exists) return NextResponse.json({ error: 'Proposta não encontrada' }, { status: 404 })

  try {
    const pdfUrl = await generateAndSaveProposalPDF(id, user.id)
    return NextResponse.json({ pdf_url: pdfUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao gerar PDF'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

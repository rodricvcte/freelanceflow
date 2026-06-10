import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { generateAndSaveProposalPDF } from '@/lib/generate-pdf'

export const runtime = 'nodejs'

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
    const pdfUrl = await generateAndSaveProposalPDF(id, supabase)
    return NextResponse.json({ pdf_url: pdfUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao gerar PDF'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

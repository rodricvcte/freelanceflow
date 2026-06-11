import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-service'

export const runtime = 'nodejs'

const BUCKET      = 'proposal-images'
const MAX_BYTES   = 5 * 1024 * 1024
const ALLOWED     = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: 'Tipo inválido. Use JPG, PNG ou WebP.' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Arquivo muito grande. Máximo 5 MB.' }, { status: 400 })
  }

  const ext  = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : 'webp'
  const path = `${user.id}/${Date.now()}.${ext}`
  const buf  = await file.arrayBuffer()

  const service = createServiceClient()
  await service.storage.createBucket(BUCKET, { public: true }).catch(() => {})

  const { error: upErr } = await service.storage
    .from(BUCKET)
    .upload(path, buf, { contentType: file.type, upsert: false })

  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })

  const { data: { publicUrl } } = service.storage.from(BUCKET).getPublicUrl(path)
  return NextResponse.json({ url: publicUrl })
}

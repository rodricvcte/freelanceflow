import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-service'

const MAX_BYTES = 2 * 1024 * 1024 // 2 MB

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Apenas imagens são permitidas' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Arquivo muito grande (máx. 2 MB)' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() ?? 'png'
  const path = `${user.id}/logo.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const service = createServiceClient()

  // Ensure bucket exists
  await service.storage.createBucket('profile-logos', { public: true }).catch(() => {})

  const { error: uploadErr } = await service.storage
    .from('profile-logos')
    .upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 })

  const { data: { publicUrl } } = service.storage
    .from('profile-logos')
    .getPublicUrl(path)

  // Save to profile
  await service
    .from('profiles')
    .upsert({ id: user.id, logo_url: publicUrl }, { onConflict: 'id' })

  return NextResponse.json({ url: publicUrl })
}

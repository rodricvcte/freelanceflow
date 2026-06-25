import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-service'

const MAX_BYTES = 2 * 1024 * 1024 // 2 MB

export async function POST(request: Request) {
  try {
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

    const ext    = file.name.split('.').pop() ?? 'png'
    // Timestamp no caminho garante URL única a cada upload (evita cache do browser)
    const path   = `${user.id}/logo-${Date.now()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const service = createServiceClient()

    await service.storage.createBucket('profile-logos', { public: true }).catch(() => {})

    const { error: uploadErr } = await service.storage
      .from('profile-logos')
      .upload(path, buffer, { contentType: file.type, upsert: false })

    if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 })

    const { data: { publicUrl } } = service.storage
      .from('profile-logos')
      .getPublicUrl(path)

    await service
      .from('profiles')
      .upsert({ id: user.id, logo_url: publicUrl }, { onConflict: 'id' })

    return NextResponse.json({ url: publicUrl })
  } catch (err) {
    console.error('[profile/logo]', err)
    return NextResponse.json({ error: 'Erro interno no upload' }, { status: 500 })
  }
}

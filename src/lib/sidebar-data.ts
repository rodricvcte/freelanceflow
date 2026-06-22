import { cache } from 'react'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-service'
import { getViewAs } from '@/lib/view-as'

/**
 * Busca dados do sidebar server-side.
 * React.cache garante uma única query por request quando chamado de múltiplos componentes
 * (ex.: SidebarWithData + BannerWithData no mesmo layout).
 */
export const fetchSidebarData = cache(async () => {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null
  if (!user) return null

  const viewAs      = await getViewAs(user)
  const queryClient = viewAs ? createServiceClient() : supabase
  const userId      = viewAs?.id ?? user.id

  const [profileRes, subRes] = await Promise.all([
    queryClient
      .from('profiles')
      .select('full_name, business_name, phone, address, cpf_cnpj, email_business')
      .eq('id', userId)
      .maybeSingle(),
    queryClient
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', userId)
      .maybeSingle(),
  ])

  return {
    profile:   profileRes.data,
    sub:       subRes.data,
    email:     viewAs?.email ?? user.email ?? '',
    viewingAs: viewAs?.email ?? null,
  }
})

// reset-user.js
// Deleta todos os dados de um usuário pelo email
// Uso: node reset-user.js seu@email.com

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variáveis de ambiente não encontradas.')
  console.error('Certifique-se de rodar com: node --env-file=.env.local reset-user.js seu@email.com')
  process.exit(1)
}

const email = process.argv[2]
if (!email) {
  console.error('❌ Informe o email: node reset-user.js seu@email.com')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function resetUser(email) {
  console.log(`\n🔍 Buscando usuário: ${email}`)

  // 1. Busca o usuário pelo email via Admin API
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) {
    console.error('❌ Erro ao listar usuários:', listError.message)
    process.exit(1)
  }

  const user = users.find(u => u.email === email)
  if (!user) {
    console.error(`❌ Usuário com email "${email}" não encontrado.`)
    process.exit(1)
  }

  const userId = user.id
  console.log(`✅ Usuário encontrado: ${userId}`)

  // 2. Deletar na ordem correta (respeitar foreign keys)

  console.log('\n🗑️  Deletando follow_ups...')
  const { error: e1 } = await supabase.from('follow_ups').delete().eq('user_id', userId)
  if (e1) console.error('  ⚠️', e1.message); else console.log('  ✅ OK')

  console.log('🗑️  Deletando proposal_events (via proposals do usuário)...')
  const { data: proposals } = await supabase.from('proposals').select('id').eq('user_id', userId)
  if (proposals?.length) {
    const ids = proposals.map(p => p.id)
    const { error: e2 } = await supabase.from('proposal_events').delete().in('proposal_id', ids)
    if (e2) console.error('  ⚠️', e2.message); else console.log('  ✅ OK')
  } else {
    console.log('  ✅ Nenhuma proposta encontrada, pulando.')
  }

  console.log('🗑️  Deletando proposals...')
  const { error: e3 } = await supabase.from('proposals').delete().eq('user_id', userId)
  if (e3) console.error('  ⚠️', e3.message); else console.log('  ✅ OK')

  console.log('🗑️  Deletando clients...')
  const { error: e4 } = await supabase.from('clients').delete().eq('user_id', userId)
  if (e4) console.error('  ⚠️', e4.message); else console.log('  ✅ OK')

  console.log('🗑️  Deletando subscriptions...')
  const { error: e5 } = await supabase.from('subscriptions').delete().eq('user_id', userId)
  if (e5) console.error('  ⚠️', e5.message); else console.log('  ✅ OK')

  console.log('🗑️  Deletando profile...')
  const { error: e6 } = await supabase.from('profiles').delete().eq('id', userId)
  if (e6) console.error('  ⚠️', e6.message); else console.log('  ✅ OK')

  console.log('🗑️  Deletando usuário do Auth...')
  const { error: e7 } = await supabase.auth.admin.deleteUser(userId)
  if (e7) console.error('  ⚠️', e7.message); else console.log('  ✅ OK')

  console.log(`\n🎉 Usuário ${email} deletado com sucesso! Pode criar a conta do zero.\n`)
}

resetUser(email)

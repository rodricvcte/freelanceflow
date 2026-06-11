import type { SupabaseClient } from '@supabase/supabase-js'

export function buildProposalNumber(
  createdAt: string,
  freelancerCode: string,
  version: number
): string {
  const date = createdAt.split('T')[0].replace(/-/g, '')
  return `${date}-${freelancerCode}-v${version}`
}

// Builds a proposal_number guaranteed unique in the DB.
// If the base (date-code-v1) is taken, appends -2, -3, … until free.
export async function buildUniqueProposalNumber(
  createdAt: string,
  freelancerCode: string,
  version: number,
  supabase: SupabaseClient
): Promise<string> {
  const base = buildProposalNumber(createdAt, freelancerCode, version)

  const { data: taken } = await supabase
    .from('proposals')
    .select('id')
    .eq('proposal_number', base)
    .maybeSingle()

  if (!taken) return base

  for (let i = 2; i <= 999; i++) {
    const candidate = `${base}-${i}`
    const { data } = await supabase
      .from('proposals')
      .select('id')
      .eq('proposal_number', candidate)
      .maybeSingle()
    if (!data) return candidate
  }

  return base
}

import type { SupabaseClient } from '@supabase/supabase-js'

// ─── Format: CODE-YYYYMMDD-SEQ-vN ────────────────────────────────────────────
// Example: RC001-20260611-001-v1

/**
 * Bump version suffix: RC001-20260611-001-v1 → RC001-20260611-001-v2
 * Handles old formats gracefully (appends -v2 if no version found).
 */
export function bumpProposalVersion(proposalNumber: string | null): string | null {
  if (!proposalNumber) return null
  const match = proposalNumber.match(/^(.+)-v(\d+)$/)
  if (!match) return `${proposalNumber}-v2`
  return `${match[1]}-v${parseInt(match[2], 10) + 1}`
}

/**
 * Generates a brand-new proposal_number: CODE-YYYYMMDD-SEQ-v1
 *
 * SEQ = lifetime count of proposals this freelancer has (not daily — never resets)
 * A uniqueness check loops up to 999 to survive race conditions.
 */
export async function buildNewProposalNumber(
  userId: string,
  freelancerCode: string,
  createdAt: string,          // ISO string of the new proposal's created_at
  supabase: SupabaseClient
): Promise<string> {
  const dateStr = createdAt.split('T')[0].replace(/-/g, '')   // YYYYMMDD

  // Count ALL proposals ever created by this user (lifetime sequential)
  const { count } = await supabase
    .from('proposals')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .not('proposal_number', 'is', null)

  let seq = (count ?? 0) + 1

  // Uniqueness loop (handles rare race condition)
  for (let attempt = 0; attempt < 999; attempt++, seq++) {
    const candidate = `${freelancerCode}-${dateStr}-${String(seq).padStart(3, '0')}-v1`
    const { data } = await supabase
      .from('proposals')
      .select('id')
      .eq('proposal_number', candidate)
      .maybeSingle()
    if (!data) return candidate
  }

  // Should never reach here
  return `${freelancerCode}-${dateStr}-${String(seq).padStart(3, '0')}-v1`
}

// Keep old export name as alias for any callers not yet updated
export { buildNewProposalNumber as buildUniqueProposalNumber }

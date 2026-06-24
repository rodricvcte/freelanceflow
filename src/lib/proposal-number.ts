import type { SupabaseClient } from '@supabase/supabase-js'

// ─── Format: P{USER_SEQ}-YYYYMMDD-{PROP_SEQ}-vN ──────────────────────────────
// Example: P002-20260614-006-v1
// P prefix is fixed. USER_SEQ is the user's global sequential number.
// PROP_SEQ is the user's lifetime proposal count (never resets).

/**
 * Bump version suffix: P001-20260611-001-v1 → P001-20260611-001-v2
 * Handles old formats gracefully (appends -v2 if no version found).
 */
export function bumpProposalVersion(value: string | null): string | null {
  if (!value) return null
  const match = value.match(/^(.+)-v(\d+)$/)
  if (!match) return `${value}-v2`
  return `${match[1]}-v${parseInt(match[2], 10) + 1}`
}

/**
 * Get or assign this user's global sequential number (stored in profiles.user_seq).
 * Uses serviceSupabase to count across all users (bypasses RLS).
 */
async function getOrAssignUserSeq(
  userId: string,
  authSupabase: SupabaseClient,
  serviceSupabase: SupabaseClient
): Promise<number> {
  const { data: profile } = await authSupabase
    .from('profiles')
    .select('user_seq')
    .eq('id', userId)
    .single()

  if (profile?.user_seq != null) return profile.user_seq

  // Find the highest user_seq assigned so far
  const { data: maxRow } = await serviceSupabase
    .from('profiles')
    .select('user_seq')
    .not('user_seq', 'is', null)
    .order('user_seq', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextSeq = (maxRow?.user_seq ?? 0) + 1

  // Optimistic update: only set if still null
  await authSupabase
    .from('profiles')
    .update({ user_seq: nextSeq })
    .eq('id', userId)
    .is('user_seq', null)

  // Re-fetch in case of concurrent assignment
  const { data: updated } = await authSupabase
    .from('profiles')
    .select('user_seq')
    .eq('id', userId)
    .single()

  return updated?.user_seq ?? nextSeq
}

/**
 * Build a new proposal code: P{USER_SEQ}-{YYYYMMDD}-{PROP_SEQ}-v{VERSION}
 *
 * PROP_SEQ = count of this user's proposals that already have a code, + 1.
 * Call this AFTER the proposal row is inserted (so it exists but code is still null).
 * A uniqueness loop handles any race conditions.
 */
export async function buildProposalCode(
  userId: string,
  authSupabase: SupabaseClient,
  serviceSupabase: SupabaseClient,
  createdAt: string,
  version = 1
): Promise<string> {
  const userSeq = await getOrAssignUserSeq(userId, authSupabase, serviceSupabase)
  const dateStr = new Date(createdAt).toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).split('/').reverse().join('')  // YYYYMMDD em horário de Brasília
  const prefix  = `P${String(userSeq).padStart(3, '0')}`

  // Count only root proposals (version 1 / no parent) — versions must not inflate the seq
  const { count } = await authSupabase
    .from('proposals')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .not('code', 'is', null)
    .is('parent_proposal_id', null)

  let propSeq = (count ?? 0) + 1

  for (let attempt = 0; attempt < 999; attempt++, propSeq++) {
    const candidate = `${prefix}-${dateStr}-${String(propSeq).padStart(3, '0')}-v${version}`
    const { data } = await authSupabase
      .from('proposals')
      .select('id')
      .eq('code', candidate)
      .maybeSingle()
    if (!data) return candidate
  }

  return `${prefix}-${dateStr}-${String(propSeq).padStart(3, '0')}-v${version}`
}

/**
 * @deprecated Use buildProposalCode instead.
 * Kept for the PUT (draft save) fallback on proposals that predate the code system.
 */
export async function buildNewProposalNumber(
  userId: string,
  freelancerCode: string,
  createdAt: string,
  supabase: SupabaseClient
): Promise<string> {
  const dateStr = createdAt.split('T')[0].replace(/-/g, '')

  const { count } = await supabase
    .from('proposals')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .not('proposal_number', 'is', null)

  let seq = (count ?? 0) + 1

  for (let attempt = 0; attempt < 999; attempt++, seq++) {
    const candidate = `${freelancerCode}-${dateStr}-${String(seq).padStart(3, '0')}-v1`
    const { data } = await supabase
      .from('proposals')
      .select('id')
      .eq('proposal_number', candidate)
      .maybeSingle()
    if (!data) return candidate
  }

  return `${freelancerCode}-${dateStr}-${String(seq).padStart(3, '0')}-v1`
}

export { buildNewProposalNumber as buildUniqueProposalNumber }

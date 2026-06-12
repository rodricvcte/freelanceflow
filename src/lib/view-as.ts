import { cookies } from 'next/headers'
import type { User } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'rodrigosc19@gmail.com'

export interface ViewAs { id: string; email: string }

/**
 * Returns the view-as target when the admin has activated impersonation mode.
 * Returns null for all other users or when not in view-as mode.
 */
export async function getViewAs(user: User | null): Promise<ViewAs | null> {
  if (!user || user.email !== ADMIN_EMAIL) return null
  const store = await cookies()
  const id    = store.get('ff_view_as_id')?.value
  const email = store.get('ff_view_as_email')?.value
  if (!id) return null
  return { id, email: email ?? '' }
}

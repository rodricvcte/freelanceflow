-- Backfill recipient_name for non-draft proposals that have a client but no snapshot.
-- These are old proposals sent before recipient_name was reliably captured.
-- After this, display code can safely skip the live-JOIN fallback for non-drafts.
update public.proposals p
set
  recipient_name  = c.name,
  recipient_email = coalesce(p.recipient_email, c.email)
from public.clients c
where p.client_id       = c.id
  and p.status         != 'rascunho'
  and p.recipient_name is null;

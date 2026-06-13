-- Enable Supabase Realtime for proposals and proposal_events
-- Required for live status updates and timeline tracking on the proposal detail page.
-- Run this once; ALTER PUBLICATION is idempotent if the table is already a member.

DO $$
BEGIN
  -- proposals
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'proposals'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE proposals;
  END IF;

  -- proposal_events
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'proposal_events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE proposal_events;
  END IF;
END $$;

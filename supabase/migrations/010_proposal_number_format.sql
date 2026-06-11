-- Migration 010: Reformat proposal_number to CODE-YYYYMMDD-SEQ-vN
-- Example: RC001-20260611-001-v1
-- SEQ is a daily sequence scoped per freelancer (user_id + day), ordered by created_at.
-- Proposals whose owner has no freelancer_code are left untouched (NULL).

WITH ranked AS (
  SELECT
    p.id,
    pr.freelancer_code,
    TO_CHAR(p.created_at AT TIME ZONE 'UTC', 'YYYYMMDD')                   AS date_str,
    ROW_NUMBER() OVER (
      PARTITION BY p.user_id, DATE(p.created_at AT TIME ZONE 'UTC')
      ORDER BY p.created_at, p.id
    )                                                                       AS seq,
    COALESCE(p.version, 1)                                                 AS ver
  FROM public.proposals p
  JOIN public.profiles pr ON pr.id = p.user_id
  WHERE pr.freelancer_code IS NOT NULL
)
UPDATE public.proposals p
SET proposal_number =
  r.freelancer_code
  || '-' || r.date_str
  || '-' || LPAD(r.seq::TEXT, 3, '0')
  || '-v' || r.ver::TEXT
FROM ranked r
WHERE p.id = r.id;

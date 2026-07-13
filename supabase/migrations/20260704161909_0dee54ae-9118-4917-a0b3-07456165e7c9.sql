
CREATE TABLE public.funnel_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event TEXT NOT NULL,
  path TEXT,
  session_id TEXT,
  source TEXT,
  meta JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT INSERT ON public.funnel_events TO anon, authenticated;
GRANT ALL ON public.funnel_events TO service_role;

ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert funnel events"
  ON public.funnel_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(event) BETWEEN 1 AND 80
    AND (path IS NULL OR char_length(path) <= 200)
    AND (session_id IS NULL OR char_length(session_id) <= 80)
    AND (source IS NULL OR char_length(source) <= 80)
  );

CREATE INDEX funnel_events_event_idx ON public.funnel_events(event, created_at DESC);
CREATE INDEX funnel_events_session_idx ON public.funnel_events(session_id, created_at DESC);

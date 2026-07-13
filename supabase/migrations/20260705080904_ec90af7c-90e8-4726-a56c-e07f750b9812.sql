
-- 1) Enum статуса заявки
DO $$ BEGIN
  CREATE TYPE public.lead_status AS ENUM ('new', 'in_progress', 'won', 'lost');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Новые колонки в leads
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS status public.lead_status NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS interest text,
  ADD COLUMN IF NOT EXISTS amount_kopecks bigint,
  ADD COLUMN IF NOT EXISTS product_id text,
  ADD COLUMN IF NOT EXISTS ip_address text,
  ADD COLUMN IF NOT EXISTS user_agent text;

CREATE INDEX IF NOT EXISTS leads_status_idx ON public.leads (status);
CREATE INDEX IF NOT EXISTS leads_interest_idx ON public.leads (interest);

-- 3) Backfill статуса из handled (на всякий случай)
UPDATE public.leads SET status = 'won' WHERE handled = true AND status = 'new';

-- 4) Связь заказа с заявкой
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS orders_lead_id_idx ON public.orders (lead_id);

-- 5) Обновляю insert-политику leads: те же ограничения + допускаем новые поля
DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.leads;
CREATE POLICY "Anyone can submit a lead"
  ON public.leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 100
    AND char_length(email) BETWEEN 3 AND 255
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND (interest IS NULL OR char_length(interest) <= 50)
    AND (product_id IS NULL OR char_length(product_id) <= 80)
    AND (amount_kopecks IS NULL OR (amount_kopecks >= 0 AND amount_kopecks <= 100000000))
  );

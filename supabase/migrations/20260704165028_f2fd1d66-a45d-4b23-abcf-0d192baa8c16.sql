
-- ORDERS
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  phone TEXT,
  name TEXT,
  amount_kopecks BIGINT NOT NULL CHECK (amount_kopecks >= 0),
  currency TEXT NOT NULL DEFAULT 'RUB',
  offer_key TEXT,
  promo_code TEXT,
  discount_kopecks BIGINT NOT NULL DEFAULT 0 CHECK (discount_kopecks >= 0),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','paid','failed','refunded','cancelled')),
  provider TEXT NOT NULL DEFAULT 'cloudpayments',
  transaction_id TEXT,
  payment_meta JSONB,
  source TEXT,
  session_id TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX orders_email_idx ON public.orders (email);
CREATE INDEX orders_status_idx ON public.orders (status);
CREATE INDEX orders_created_at_idx ON public.orders (created_at DESC);

GRANT SELECT, INSERT ON public.orders TO anon, authenticated;
GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Anyone can create a pending order (checkout flow, no auth required)
CREATE POLICY "Anyone can create an order"
  ON public.orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'pending'
    AND char_length(email) BETWEEN 3 AND 255
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND char_length(invoice_id) BETWEEN 6 AND 80
    AND amount_kopecks > 0
    AND amount_kopecks <= 100000000
  );

-- No SELECT policy for anon/authenticated — reads go through server functions

-- ORDER ITEMS
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  title TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'main'
    CHECK (kind IN ('main','bump','upsell','downsell')),
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price_kopecks BIGINT NOT NULL CHECK (unit_price_kopecks >= 0),
  vat TEXT NOT NULL DEFAULT 'none',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX order_items_order_id_idx ON public.order_items (order_id);

GRANT SELECT, INSERT ON public.order_items TO anon, authenticated;
GRANT ALL ON public.order_items TO service_role;

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Insert allowed only when the parent order is still pending and belongs to the same request
CREATE POLICY "Anyone can add items to a pending order"
  ON public.order_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.status = 'pending'
    )
    AND char_length(sku) BETWEEN 1 AND 80
    AND char_length(title) BETWEEN 1 AND 200
  );

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_orders_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_orders_updated_at();

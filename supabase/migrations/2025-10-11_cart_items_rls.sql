BEGIN;

-- Ensure cart_items exists (create if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'cart_items'
  ) THEN
    EXECUTE $sql$
      CREATE TABLE public.cart_items (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
        sequence_id UUID REFERENCES public.sequences(id) ON DELETE CASCADE NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    $sql$;
  END IF;
END$$;

-- Add user_id column if missing
ALTER TABLE public.cart_items
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_sequence_id ON public.cart_items(sequence_id);

-- Deduplicate on (user_id, sequence_id) keeping earliest created_at
WITH ranked AS (
  SELECT id,
         user_id,
         sequence_id,
         created_at,
         ROW_NUMBER() OVER (PARTITION BY user_id, sequence_id ORDER BY created_at ASC, id ASC) AS rn
  FROM public.cart_items
  WHERE user_id IS NOT NULL
)
DELETE FROM public.cart_items ci
USING ranked r
WHERE ci.id = r.id
  AND r.rn > 1;

-- Unique constraint on (user_id, sequence_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.cart_items'::regclass
      AND conname = 'cart_items_user_id_sequence_id_key'
  ) THEN
    ALTER TABLE public.cart_items
      ADD CONSTRAINT cart_items_user_id_sequence_id_key
      UNIQUE (user_id, sequence_id);
  END IF;
END$$;

-- Enforce NOT NULL on user_id only if safe
DO $$
DECLARE null_ct INTEGER;
BEGIN
  SELECT COUNT(*) INTO null_ct FROM public.cart_items WHERE user_id IS NULL;
  IF null_ct = 0 THEN
    ALTER TABLE public.cart_items ALTER COLUMN user_id SET NOT NULL;
  ELSE
    RAISE NOTICE 'cart_items.user_id has % NULL rows; NOT NULL not enforced. Backfill and re-run.', null_ct;
  END IF;
END$$;

-- Enable RLS and set user-scoped policies
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can insert own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can update own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can delete own cart items" ON public.cart_items;

CREATE POLICY "Users can view own cart items"
  ON public.cart_items
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own cart items"
  ON public.cart_items
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own cart items"
  ON public.cart_items
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own cart items"
  ON public.cart_items
  FOR DELETE
  USING (user_id = auth.uid());

COMMIT;
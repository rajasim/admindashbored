
CREATE TABLE public.enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  education TEXT NOT NULL,
  program TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  payment_id TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit enrollment"
  ON public.enrollments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view enrollments"
  ON public.enrollments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update enrollments"
  ON public.enrollments FOR UPDATE
  TO authenticated
  USING (true);

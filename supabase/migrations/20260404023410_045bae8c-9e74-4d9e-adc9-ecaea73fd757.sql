
-- Trade requests table
CREATE TABLE public.trade_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid NOT NULL,
  to_user_id uuid NOT NULL,
  stickers_offered text[] NOT NULL DEFAULT '{}',
  stickers_requested text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trade_requests ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own trade requests"
ON public.trade_requests FOR SELECT TO authenticated
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can create trade requests"
ON public.trade_requests FOR INSERT TO authenticated
WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update trades they're involved in"
ON public.trade_requests FOR UPDATE TO authenticated
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Trigger for updated_at
CREATE TRIGGER update_trade_requests_updated_at
  BEFORE UPDATE ON public.trade_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for trade requests
ALTER PUBLICATION supabase_realtime ADD TABLE public.trade_requests;

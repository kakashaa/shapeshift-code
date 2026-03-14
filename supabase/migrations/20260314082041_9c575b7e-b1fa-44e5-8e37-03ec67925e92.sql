
-- Create push_subscriptions table for storing Web Push subscriptions
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (since admins using demo mode won't have auth)
CREATE POLICY "Anyone can subscribe to push" ON public.push_subscriptions
  FOR INSERT WITH CHECK (true);

-- Allow anyone to read subscriptions (for sending notifications)
CREATE POLICY "Anyone can read subscriptions" ON public.push_subscriptions
  FOR SELECT USING (true);

-- Allow delete by endpoint
CREATE POLICY "Anyone can unsubscribe" ON public.push_subscriptions
  FOR DELETE USING (true);

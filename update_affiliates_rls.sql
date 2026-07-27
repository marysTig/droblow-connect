-- Enable RLS for the affiliates table (if not already enabled)
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

-- Allow users to update their own affiliate profile
CREATE POLICY "Users can update their own affiliate profile" 
ON public.affiliates 
FOR UPDATE 
USING (auth.uid() = id);

-- If they also need to be able to insert their own profile
CREATE POLICY "Users can insert their own affiliate profile" 
ON public.affiliates 
FOR INSERT 
WITH CHECK (auth.uid() = id);

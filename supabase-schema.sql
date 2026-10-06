-- ==============================================================================
-- CLASSIC MUSIC INSTITUTE (classicinstitute.com) - SUPABASE DATABASE SCHEMA
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. Table for Free Audition Bookings
CREATE TABLE IF NOT EXISTS public.audition_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    email_address TEXT NOT NULL,
    course_interest TEXT NOT NULL,
    location_preference TEXT DEFAULT 'Chandigarh Campus (SCO 64-65, Sector 34-A)',
    status TEXT DEFAULT 'pending_consultation',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.audition_bookings ENABLE ROW LEVEL SECURITY;

-- Allow public anonymous visitors to submit audition requests
CREATE POLICY "Allow public insert on audition_bookings"
ON public.audition_bookings
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow authenticated staff to view all bookings
CREATE POLICY "Allow staff to read audition_bookings"
ON public.audition_bookings
FOR SELECT
TO authenticated
USING (true);


-- 2. Table for Contact Form Inquiries
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone_number TEXT,
    email_address TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow public anonymous visitors to submit contact messages
CREATE POLICY "Allow public insert on contact_inquiries"
ON public.contact_inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow authenticated staff to view all messages
CREATE POLICY "Allow staff to read contact_inquiries"
ON public.contact_inquiries
FOR SELECT
TO authenticated
USING (true);


-- 3. Table for Conservatory Fee Packages
CREATE TABLE IF NOT EXISTS public.fee_packages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    badge TEXT,
    is_featured BOOLEAN DEFAULT false,
    subtitle TEXT,
    monthly_price NUMERIC NOT NULL,
    quarterly_price NUMERIC,
    annual_price NUMERIC,
    session_info TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    button_text TEXT DEFAULT 'Enroll Now',
    status TEXT DEFAULT 'active',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.fee_packages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read active packages
CREATE POLICY "Allow public select on fee_packages"
ON public.fee_packages
FOR SELECT
TO anon, authenticated
USING (true);

-- Allow staff to insert/update/delete packages
CREATE POLICY "Allow staff to manage fee_packages"
ON public.fee_packages
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

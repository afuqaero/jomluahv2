-- supabase_quotes.sql
-- Create daily_quotes table and seed it with inspirational quotes

CREATE TABLE IF NOT EXISTS public.daily_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text TEXT NOT NULL,
    author TEXT NOT NULL DEFAULT 'Unknown',
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- User who added/owns it, if any
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_quotes ENABLE ROW LEVEL SECURITY;

-- Select policy: anyone (public) can read quotes
CREATE POLICY "Allow public read access to daily_quotes" ON public.daily_quotes
    FOR SELECT USING (true);

-- Insert policy: authenticated users can add quotes
CREATE POLICY "Allow authenticated users to insert quotes" ON public.daily_quotes
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Seed initial quotes
INSERT INTO public.daily_quotes (text, author) VALUES
('Calmness is the cradle of power.', 'Josiah Gilbert Holland'),
('Small steps every day lead to big changes.', 'Danielle Koepke'),
('Your feelings are valid, even on the hard days.', 'Unknown'),
('Write it down — even the messy thoughts deserve a page.', 'Unknown'),
('Progress, not perfection.', 'Confucius'),
('Be gentle with yourself today.', 'Unknown'),
('Every entry brings you closer to understanding yourself.', 'Unknown'),
('The present moment is the only one that truly matters.', 'Thich Nhat Hanh'),
('Courage does not always roar. Sometimes courage is the quiet voice at the end of the day saying, "I will try again tomorrow."', 'Mary Anne Radmacher'),
('You do not have to be good. You only have to let the soft animal of your body love what it loves.', 'Mary Oliver'),
('What lies behind us and what lies before us are tiny matters compared to what lies within us.', 'Ralph Waldo Emerson'),
('There is a crack in everything. That’s how the light gets in.', 'Leonard Cohen'),
('Nurturing yourself is not selfish, it’s essential to your survival and your well-being.', 'Renee Peterson Trudeau'),
('Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.', 'Thich Nhat Hanh'),
('Self-care is how you take your power back.', 'Lalah Delia');

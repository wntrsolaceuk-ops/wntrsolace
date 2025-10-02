-- Create contact_messages table for storing customer contact form submissions
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    order_number VARCHAR(50),
    message TEXT NOT NULL,
    newsletter_subscription BOOLEAN DEFAULT FALSE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    admin_notes TEXT,
    response_sent BOOLEAN DEFAULT FALSE,
    response_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_messages_user_id ON contact_messages(user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contact_messages_updated_at 
    BEFORE UPDATE ON contact_messages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Users can only see their own messages
CREATE POLICY "Users can view own contact messages" ON contact_messages
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own messages
CREATE POLICY "Users can insert own contact messages" ON contact_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- Users can update their own messages (for status changes)
CREATE POLICY "Users can update own contact messages" ON contact_messages
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can see all messages (you'll need to create an admin role)
-- CREATE POLICY "Admins can view all contact messages" ON contact_messages
--     FOR ALL USING (
--         EXISTS (
--             SELECT 1 FROM user_roles 
--             WHERE user_id = auth.uid() 
--             AND role = 'admin'
--         )
--     );

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON contact_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE ON contact_messages TO anon;

-- Insert some sample data (optional)
INSERT INTO contact_messages (name, email, subject, message, newsletter_subscription) VALUES
('John Doe', 'john@example.com', 'order_inquiry', 'I have a question about my recent order. Can you help me track it?', true),
('Jane Smith', 'jane@example.com', 'shipping_question', 'How long does shipping usually take to California?', false),
('Mike Johnson', 'mike@example.com', 'product_question', 'Do you have this product in different sizes?', true);

-- Create a view for admin dashboard (optional)
CREATE OR REPLACE VIEW contact_messages_summary AS
SELECT 
    id,
    name,
    email,
    subject,
    order_number,
    LEFT(message, 100) as message_preview,
    status,
    priority,
    newsletter_subscription,
    response_sent,
    created_at,
    updated_at,
    CASE 
        WHEN created_at > NOW() - INTERVAL '24 hours' THEN 'new'
        WHEN created_at > NOW() - INTERVAL '7 days' THEN 'recent'
        ELSE 'old'
    END as age_category
FROM contact_messages
ORDER BY created_at DESC;

-- Grant access to the view
GRANT SELECT ON contact_messages_summary TO authenticated;


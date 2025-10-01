-- SequenceHub Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'USER' CHECK (role IN ('USER', 'SELLER', 'ADMIN')),
  bio TEXT,
  website_url TEXT,
  stripe_account_id TEXT,
  stripe_onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sequences table
CREATE TABLE sequences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT,
  preview_url TEXT,
  thumbnail_url TEXT,
  file_size BIGINT,
  duration INTEGER, -- in seconds
  bpm INTEGER,
  key_signature VARCHAR(10),
  tags TEXT[], -- Array of tags
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'suspended', 'rejected')),
  download_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  rating_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  sequence_id UUID REFERENCES sequences(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  seller_payout DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart items table
CREATE TABLE cart_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  sequence_id UUID REFERENCES sequences(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, sequence_id)
);

-- Downloads table (track user downloads)
CREATE TABLE downloads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  sequence_id UUID REFERENCES sequences(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  download_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  downloaded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  sequence_id UUID REFERENCES sequences(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, sequence_id)
);

-- Seller payouts table
CREATE TABLE seller_payouts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_transfer_id TEXT UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, description) VALUES
  ('Holiday & Seasonal', 'Christmas, Halloween, and other seasonal sequences'),
  ('Music Sync', 'Sequences synchronized to popular music'),
  ('Traditional', 'Classic holiday and traditional sequences'),
  ('Modern', 'Contemporary and modern light sequences'),
  ('RGB Effects', 'Advanced RGB color-changing sequences'),
  ('Mega Tree', 'Sequences designed for mega tree displays'),
  ('House Outline', 'Sequences for house outline lighting'),
  ('Props & Elements', 'Sequences for specific props and elements');

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_payouts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Sequences policies
CREATE POLICY "Anyone can view published sequences" ON sequences FOR SELECT USING (status = 'published' OR seller_id = auth.uid());
CREATE POLICY "Sellers can manage own sequences" ON sequences FOR ALL USING (seller_id = auth.uid());
CREATE POLICY "Admins can manage all sequences" ON sequences FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Sellers can view orders for their sequences" ON orders FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM order_items oi 
    JOIN sequences s ON oi.sequence_id = s.id 
    WHERE oi.order_id = orders.id AND s.seller_id = auth.uid()
  )
);

-- Order items policies
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid())
);
CREATE POLICY "Users can create order items for own orders" ON order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid())
);

-- Cart policies
CREATE POLICY "Users can manage own cart" ON cart_items FOR ALL USING (user_id = auth.uid());

-- Downloads policies
CREATE POLICY "Users can view own downloads" ON downloads FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own downloads" ON downloads FOR INSERT WITH CHECK (user_id = auth.uid());

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can manage own reviews" ON reviews FOR ALL USING (user_id = auth.uid());

-- Seller payouts policies
CREATE POLICY "Sellers can view own payouts" ON seller_payouts FOR SELECT USING (seller_id = auth.uid());

-- Categories are public
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true);

-- Functions and triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sequences_updated_at BEFORE UPDATE ON sequences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seller_payouts_updated_at BEFORE UPDATE ON seller_payouts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update sequence ratings
CREATE OR REPLACE FUNCTION update_sequence_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE sequences 
    SET 
        rating = (SELECT AVG(rating)::DECIMAL(3,2) FROM reviews WHERE sequence_id = NEW.sequence_id),
        rating_count = (SELECT COUNT(*) FROM reviews WHERE sequence_id = NEW.sequence_id)
    WHERE id = NEW.sequence_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sequence_rating_trigger 
    AFTER INSERT OR UPDATE OR DELETE ON reviews 
    FOR EACH ROW EXECUTE FUNCTION update_sequence_rating();

-- Indexes for performance
CREATE INDEX idx_sequences_seller_id ON sequences(seller_id);
CREATE INDEX idx_sequences_category_id ON sequences(category_id);
CREATE INDEX idx_sequences_status ON sequences(status);
CREATE INDEX idx_sequences_created_at ON sequences(created_at DESC);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_downloads_user_id ON downloads(user_id);
CREATE INDEX idx_reviews_sequence_id ON reviews(sequence_id);
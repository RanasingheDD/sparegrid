-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'buyer',
    phone TEXT,
    phone2 TEXT,
    address TEXT,
    bank_name TEXT,
    bank_branch TEXT,
    account_number TEXT,
    account_name TEXT,
    earnings NUMERIC DEFAULT 0,
    is_restricted BOOLEAN DEFAULT FALSE,
    restriction_reason TEXT,
    failed_orders_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    condition TEXT NOT NULL,
    category TEXT NOT NULL,
    images JSONB DEFAULT '[]',
    model_number TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    stock_count INTEGER DEFAULT 1
);

-- REQUESTS TABLE
CREATE TABLE IF NOT EXISTS requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending_admin',
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    delivery_status TEXT NOT NULL DEFAULT 'pending',
    quantity INTEGER DEFAULT 1,
    shipping_address TEXT,
    message TEXT,
    tracking_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

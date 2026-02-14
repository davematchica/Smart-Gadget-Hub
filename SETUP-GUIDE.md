# Smart GadgetHub - Setup Guide

## Owner: Ann Montenegro

## Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account (free tier works)
- Git (optional)

### 1. Supabase Setup

#### Create Supabase Project
1. Go to https://supabase.com and create an account
2. Create a new project
3. Note down your project URL and anon key from Settings > API

#### Database Setup
Run the following SQL in Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Seller Profile Table
CREATE TABLE seller_profile (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  business_name VARCHAR(255),
  dti_registration VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  profile_image_url TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Products Table
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  specifications JSONB,
  availability BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  stock_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Product Images Table
CREATE TABLE product_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Inquiries Table
CREATE TABLE inquiries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_availability ON products(availability);
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at DESC);

-- Insert default seller profile
INSERT INTO seller_profile (name, business_name, email, phone, bio)
VALUES (
  'Ann Montenegro',
  'Smart GadgetHub',
  'contact@smartgadgethub.com',
  '+63 XXX XXX XXXX',
  'Your trusted source for premium gadgets and devices.'
);
```

#### Storage Setup
1. Go to Storage in Supabase dashboard
2. Create a bucket named `product-images`
3. Make it public by clicking the bucket > Settings > Public bucket (toggle on)
4. Set the following policies:

```sql
-- Allow public to read images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'product-images' );

-- Allow authenticated users (admin) to upload
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'product-images' AND auth.role() = 'authenticated' );

-- Allow authenticated users (admin) to delete
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'product-images' AND auth.role() = 'authenticated' );
```

#### Authentication Setup
1. Go to Authentication > Providers
2. Enable Email provider
3. Disable "Confirm email" for easier admin setup
4. Create admin user:
   - Go to Authentication > Users
   - Click "Add user"
   - Email: admin@smartgadgethub.com
   - Password: (create a strong password)
   - Auto Confirm User: Yes

### 2. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit `.env` file:
```
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key
NODE_ENV=development
```

Start backend:
```bash
npm run dev
```

Backend will run on http://localhost:5000

### 3. Frontend Setup

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit `.env` file:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm run dev
```

Frontend will run on http://localhost:5173

### 4. Admin Access

Navigate to http://localhost:5173/admin/login

Login with:
- Email: admin@smartgadgethub.com
- Password: (the password you created)

### 5. Adding Your First Product

1. Login to admin panel
2. Go to "Products" section
3. Click "Add New Product"
4. Fill in product details
5. Upload multiple images (drag & drop)
6. Save product

### 6. Updating Seller Profile

1. Login to admin panel
2. Go to "Profile" section
3. Update your business information
4. Upload profile photo
5. Add DTI registration number
6. Save changes

## Deployment Guide

### Backend Deployment (Railway/Render)

1. Push code to GitHub
2. Connect to Railway or Render
3. Add environment variables
4. Deploy

### Frontend Deployment (Vercel/Netlify)

1. Push code to GitHub
2. Connect to Vercel or Netlify
3. Add environment variables
4. Deploy

### Update Environment Variables in Production

Update `VITE_API_URL` in frontend to your production backend URL.

## Folder Structure

```
smart-gadgethub/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── server.js
│   ├── .env.example
│   └── package.json
└── SETUP_GUIDE.md
```

## Troubleshooting

### Images not uploading
- Check Supabase storage policies
- Verify bucket is public
- Check file size limits (5MB default)

### CORS errors
- Verify backend URL in frontend .env
- Check CORS configuration in backend

### Authentication issues
- Verify Supabase credentials
- Check if admin user is created
- Clear browser cache

## Support

For issues or questions, contact: Ann Montenegro
Email: contact@smartgadgethub.com
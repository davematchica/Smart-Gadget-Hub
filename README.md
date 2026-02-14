# Smart GadgetHub

**Owner: Ann Montenegro**

A modern, mobile-first web platform for browsing and inquiring about premium gadgets including iPhones, Android smartphones, and laptops.

## ✨ Features

### Customer Features
- 📱 Browse gadgets by category (iPhones, Android, Laptops, Accessories)
- 🖼️ View products with multiple image galleries
- 🔍 Search and filter products
- 💬 Submit guest inquiries without registration
- ✅ View verified seller profile with DTI registration
- 🎨 Modern, eye-catching UI with smooth animations

### Admin Features
- 🔐 Secure admin authentication
- 📦 Manage products (add, edit, delete)
- 🖼️ Upload multiple images per product with drag & drop
- 📬 View and manage customer inquiries
- 👤 Update seller profile information
- 📊 Dashboard with key metrics

## 🚀 Technology Stack

- **Frontend**: React 18, Tailwind CSS, Framer Motion, Swiper
- **Backend**: Node.js, Express
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Authentication**: Supabase Auth (admin only)

## 📋 Prerequisites

- Node.js v18 or higher
- npm or yarn
- Supabase account (free tier works)

## 🛠️ Installation

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup instructions.

### Quick Start

1. **Setup Supabase**
   - Create a Supabase project
   - Run the SQL scripts in SETUP_GUIDE.md
   - Create storage bucket and set policies

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your Supabase credentials
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with your Supabase credentials
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - Admin Panel: http://localhost:5173/admin/login

## 📁 Project Structure

```
smart-gadgethub/
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── store/         # State management (Zustand)
│   │   └── App.jsx        # Main app component
│   └── package.json
├── backend/               # Node.js backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Custom middleware
│   │   └── server.js      # Express server
│   └── package.json
└── SETUP_GUIDE.md         # Detailed setup instructions
```

## 🎨 Design Features

- **Modern Aesthetic**: Custom gradient themes with Clash Display and Plus Jakarta Sans fonts
- **Mobile-First**: Fully responsive design optimized for all devices
- **Smooth Animations**: Framer Motion for delightful interactions
- **Glass Morphism**: Modern glassmorphic effects and gradients
- **Image Carousels**: Swiper integration for product galleries

## 🔒 Security

- Admin-only authentication
- Supabase Row Level Security (RLS) policies
- Environment variable protection
- Input validation on all forms
- CORS protection

## 📝 License

Copyright © 2024 Ann Montenegro. All rights reserved.

## 📞 Support

For questions or issues:
- Email: contact@smartgadgethub.com
- Owner: Ann Montenegro

## 🙏 Acknowledgments

- Built with love for quality gadgets
- Designed for modern web standards
- Optimized for user experience
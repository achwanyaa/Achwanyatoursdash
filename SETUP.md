# Achwanya 3D Tours - Setup Instructions

## Overview
Achwanya 3D Tours is a managed 3D virtual tour service for Nairobi real estate agents. This MVP provides a branded client dashboard where agents can track leads and view their tours, while the admin handles physical shoots and technical uploads.

## Features
- 🏠 **Client Dashboard**: View and manage 3D virtual tours
- 📊 **Lead Capture**: Automatic WhatsApp notifications for new leads
- 🔐 **User Authentication**: Secure login with trial and subscription management
- 👨‍💼 **Admin Panel**: Assign tours to clients and manage users
- 📱 **Mobile-First**: Optimized for Kenyan real estate agents

## Tech Stack
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (Database, Auth, RLS)
- **Integration**: Realsee.ai 3D Tours via iframe embeds
- **Communication**: WhatsApp API for lead notifications

## Quick Start

### 1. Environment Setup
Copy the environment template and configure your Supabase credentials:

```bash
cp env.template .env.local
```

Update `.env.local` with your Supabase project details:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Achwanya 3D Tours
ADMIN_EMAIL=admin@achwanya.co.ke
```

### 2. Database Setup
1. Create a new Supabase project
2. Run the SQL schema in `database-schema.sql` in your Supabase SQL Editor
3. Enable Authentication in Supabase with email/password providers
4. Set up Row Level Security (RLS) policies are included in the schema

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```

Navigate to `http://localhost:3000`

## User Guide

### Admin Setup
1. Register as first user with email `admin@achwanya.co.ke`
2. Access admin panel at `/admin`
3. Add new Realsee tour URLs
4. Assign tours to clients

### Client Workflow
1. Clients register for 7-day free trial
2. Admin assigns tours to client profiles
3. Clients view tours in their dashboard
4. Leads are captured and sent via WhatsApp

## Key Pages

### `/login` - User Authentication
- Sign in for existing users
- Sign up for new trials (7 days, 1 tour, <3 bedrooms)

### `/dashboard` - Client Dashboard
- View active tours and statistics
- Monitor leads and tour views
- Access individual tour pages

### `/tours/[id]` - Tour Viewer
- Embedded Realsee 3D tour
- Lead capture form with WhatsApp integration
- Real-time analytics tracking

### `/admin` - Admin Panel
- Add new tours from Realsee URLs
- Assign tours to clients
- View system statistics

## Business Model

### Subscription Plans
- **Trial**: Free (7 days, 1 tour, <3 bedrooms)
- **Basic**: KSh 18,000/month (5 tours, unlimited bedrooms)
- **Pro**: KSh 35,000/month (15 tours, unlimited bedrooms, advanced analytics)

### Revenue Calculation
At KSh 25,000/month average:
- 10 clients = KSh 250,000/month
- 25 clients = KSh 625,000/month
- 50 clients = KSh 1,250,000/month

## WhatsApp Integration
The system automatically:
- Sends lead notifications to agents
- Confirms receipt to leads
- Formats messages for Kenyan market

## Security Features
- Row Level Security (RLS) for data isolation
- JWT-based authentication
- Subscription limit enforcement
- Admin access controls

## Deployment

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`

## Support
- Email: support@achwanya.co.ke
- Location: Nairobi, Kenya

## Next Steps
1. Set up Supabase project
2. Configure environment variables
3. Run database schema
4. Test user registration and admin functions
5. Add your first Realsee tour URL
6. Onboard your first client

The MVP is ready for immediate deployment and client onboarding!

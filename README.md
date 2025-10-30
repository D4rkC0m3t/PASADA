# 🏢 PASADA Interior Design CRM

**Modern, Serverless Quotation & Project Management System**

Built with Next.js 14, Supabase, and TypeScript for professional interior design businesses.

---

## 🎯 Features

### Core Functionality
- ✅ **Client Management** - Complete client database with contact info and project history
- ✅ **Project Tracking** - Status-based project management with budget and timeline tracking
- ✅ **Quotation Builder** - Drag-and-drop itemized quotes with automatic calculations
- ✅ **Material Catalog** - Searchable product database with pricing and supplier info
- ✅ **PDF Generation** - Branded quotation PDFs with terms and conditions
- ✅ **Booking System** - Consultation and site visit scheduler with calendar integration
- ✅ **Vendor Management** - Supplier database with ratings and payment terms
- ✅ **Audit Logging** - Complete audit trail for all operations

### User Roles
- **Admin** - Full system access, user management, settings
- **Staff** - Manage clients, projects, quotations, bookings
- **Client** - View projects, approve quotations, book consultations

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18.17.0 or higher
- npm 9.0.0 or higher
- Supabase account

### 1. Clone & Install

```bash
git clone <repository-url>
cd Pasada
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

### 3. Database Setup

Follow the comprehensive guide in `SUPABASE-SETUP-GUIDE.md`:

1. Create Supabase project
2. Run `database/schema.sql` in Supabase SQL Editor
3. Run `database/rls-policies.sql` for security
4. Run `database/storage-setup.sql` for file storage

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
Pasada/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/
│   │   └── signup/
│   ├── admin/                    # Admin dashboard
│   │   ├── dashboard/
│   │   ├── clients/
│   │   ├── projects/
│   │   ├── quotations/
│   │   ├── materials/
│   │   └── settings/
│   ├── client/                   # Client portal
│   │   ├── dashboard/
│   │   ├── projects/
│   │   └── bookings/
│   ├── api/                      # API routes
│   │   ├── pdf/
│   │   └── email/
│   ├── layout.tsx
│   ├── page.tsx                  # Landing page
│   └── globals.css
├── components/                   # React components
│   ├── ui/                       # Base UI components
│   ├── forms/                    # Form components
│   ├── tables/                   # Data tables
│   └── layout/                   # Layout components
├── lib/                          # Utilities & config
│   ├── supabase/
│   │   ├── client.ts            # Supabase client
│   │   └── database.types.ts    # Generated types
│   ├── utils/                    # Utility functions
│   └── validations/              # Zod schemas
├── hooks/                        # Custom React hooks
├── database/                     # SQL files
│   ├── schema.sql
│   ├── rls-policies.sql
│   └── storage-setup.sql
├── public/                       # Static assets
├── .env.example
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 🗄️ Database Schema

### Core Tables

#### `clients`
Client information and contact details

#### `projects`
Project tracking with status, budget, timeline

#### `quotations`
Quote headers with totals and status

#### `quote_items`
Individual line items with auto-calculated totals

#### `materials`
Material catalog with pricing and suppliers

#### `vendors`
Vendor/supplier information

#### `templates`
Quotation and email templates

#### `bookings`
Consultation and appointment scheduling

#### `audit_logs`
Complete audit trail (auto-populated)

#### `user_profiles`
Extended user info beyond Supabase auth

---

## 🔐 Security

### Row Level Security (RLS)
All tables have RLS policies enforcing role-based access:

- **Admins**: Full access to all data
- **Staff**: Access to clients, projects, quotations
- **Clients**: Access to their own data only

### Authentication
- Email/password authentication via Supabase Auth
- Email confirmation required
- Password reset flow
- Session management

### Storage Security
- Public buckets: logos, projects, materials
- Private buckets: quotations (requires authentication)
- Role-based upload/delete permissions

---

## 📊 API Routes

### PDF Generation
`POST /api/pdf/generate`
- Generates branded quotation PDFs
- Uploads to Supabase Storage
- Returns signed URL

### Email
`POST /api/email/send-quotation`
- Sends quotation email with PDF attachment
- Uses Resend or SMTP

### Quotations
`GET /api/quotations/[id]`
`POST /api/quotations`
`PATCH /api/quotations/[id]`
`DELETE /api/quotations/[id]`

---

## 🎨 UI Components

Built with Tailwind CSS and custom components:

- **Button** - Primary, secondary, destructive variants
- **Card** - Container with header, content, footer
- **Input** - Text, number, date, select
- **Table** - Sortable, filterable data tables
- **Modal** - Confirmation dialogs
- **Toast** - Success/error notifications

---

## 🧪 Development

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

### Formatting
```bash
npm run format
```

### Generate Supabase Types
```bash
npm run supabase:types
```

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables in Vercel

Add these in Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
```

### Database Migrations

Run migrations in Supabase Dashboard → SQL Editor

---

## 📈 Monitoring

### Supabase Dashboard
- Database performance
- API usage
- Storage usage
- Authentication metrics

### Vercel Analytics
- Page views
- User interactions
- Performance metrics

---

## 🔄 Backup & Recovery

### Automated Backups
Supabase provides automated daily backups (paid plans)

### Manual Backup
```bash
# Export database
pg_dump -h db.your-project.supabase.co -U postgres -d postgres > backup.sql

# Restore
psql -h db.your-project.supabase.co -U postgres -d postgres < backup.sql
```

---

## 🆘 Troubleshooting

### Common Issues

**RLS Blocking Queries**
- Check RLS policies in database
- Verify user role is set correctly
- Check `user_profiles` table

**File Upload Fails**
- Check storage bucket policies
- Verify file size limits
- Check CORS settings

**PDF Generation Errors**
- Check Puppeteer installation
- Verify template exists
- Check storage permissions

---

## 📚 Documentation

- [Supabase Setup Guide](./SUPABASE-SETUP-GUIDE.md)
- [Implementation TODO](./IMPLEMENTATION-TODO.md)
- [Database Schema](./database/schema.sql)
- [RLS Policies](./database/rls-policies.sql)

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Email**: Resend
- **PDF**: Puppeteer
- **Forms**: React Hook Form + Zod
- **UI**: Lucide Icons, React Hot Toast

---

## 📝 License

Private - PASADA Interior Design

---

## 👥 Support

For issues or questions:
- Check documentation in `/docs`
- Review Supabase logs
- Contact development team

---

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Database schema
- ✅ Authentication
- ✅ Basic CRUD operations
- 🔄 Quotation builder
- 🔄 PDF generation

### Phase 2
- [ ] Email notifications
- [ ] Payment integration
- [ ] Advanced reporting
- [ ] Mobile app

### Phase 3
- [ ] AI quotation assistant
- [ ] WhatsApp integration
- [ ] Multi-language support
- [ ] Advanced analytics

---

**Built with ❤️ for PASADA Interior Design**

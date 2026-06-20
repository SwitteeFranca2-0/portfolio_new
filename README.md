# Franca Uvere — Portfolio

A personal portfolio and CMS built with Next.js, featuring 3D visuals, a full admin dashboard, and a custom data layer on PostgreSQL.

**Live site:** [franca-uvere.vercel.app](https://franca-uvere.vercel.app)

---

## ✨ Features

- **3D Hero** — Interactive Three.js scenes (laptop or particle background), switchable from the admin panel
- **Dynamic Sections** — Typewriter hero, tech marquee, skills with proficiency bars, project showcase with category filtering, experience timeline, and contact form
- **Project Detail Pages** — Rich text body, tech stack chips, feature lists, media gallery, and automation metadata (for n8n workflows)
- **Admin CMS** — Full content management dashboard for bio, contact info, projects, skills, experience, and file uploads
- **Custom Auth** — JWT-based admin authentication (jose + bcryptjs) with edge-safe middleware
- **Dual Upload System** — Store files locally or in Supabase Storage, toggled via environment config
- **Custom Cursor & Scroll Animations** — Intersection observer–driven reveals and a bespoke cursor
- **Dark Theme** — Designed around deep blacks with accent colors (purple, coral, teal)

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org) (App Router, RSC) |
| Language | TypeScript 5 |
| Database | PostgreSQL (Railway) via [Prisma 7](https://www.prisma.io) with `@prisma/adapter-pg` |
| Auth | Custom JWT (jose) + bcryptjs |
| Storage | Local filesystem or [Supabase Storage](https://supabase.com) |
| 3D Graphics | [Three.js](https://threejs.org) |
| Rich Text | [TipTap](https://tiptap.dev) (v3) |
| Styling | Tailwind CSS v4 + CSS Modules + design tokens |
| Deployment | [Vercel](https://vercel.com) |

---

## 📁 Project Structure

```
my_portfolio/
├── app/
│   ├── page.tsx                  # Home (Hero → Marquee → Skills → Projects → Experience → Contact)
│   ├── layout.tsx                # Root layout (fetches Bio, renders PublicShell)
│   ├── globals.css               # Design tokens & global styles
│   ├── skills/                   # Skills page
│   ├── projects/                 # Project listing + [slug] detail pages
│   ├── contact/                  # Contact page
│   ├── admin/                    # Admin CMS dashboard
│   │   ├── layout.tsx            # Admin shell (Sidebar + Topbar)
│   │   ├── login/                # Admin login
│   │   ├── bio/                  # Bio editor
│   │   ├── contact/             # Contact editor
│   │   ├── projects/             # Project CRUD (list, new, edit)
│   │   ├── skills/               # Skill CRUD (list, edit)
│   │   └── experience/           # Experience CRUD (list, edit)
│   └── api/admin/                # API routes (auth, CRUD, uploads)
├── components/
│   ├── admin/                    # MediaUpload, RichTextEditor, Sidebar, Topbar
│   ├── home/                     # Hero, Marquee, Skills, Projects, Experience, Contact sections
│   ├── layout/                   # Nav, Footer, Cursor, PublicShell, ScrollReveal
│   ├── projects/                 # MediaGallery
│   ├── three/                    # HeroScene, HeroSceneLaptop, HeroSceneParticles, GlobalBackground
│   └── ui/                       # Chip, RichText, SectionHeader, Typewriter
├── lib/
│   ├── auth.ts                   # JWT sign/verify, bcrypt, pg pool
│   ├── auth-edge.ts              # Edge-safe JWT verify (for middleware)
│   ├── prisma.ts                 # Prisma client singleton
│   ├── supabase.ts               # Supabase server client
│   ├── supabase-client.ts        # Supabase browser client
│   └── models/                   # BaseModel, BioModel, ContactModel, ExperienceModel, ProjectModel, SkillModel
├── prisma/
│   ├── schema.prisma             # 17-model database schema
│   ├── seed.ts                   # Realistic portfolio seed data
│   └── migrations/               # Database migrations
├── scripts/
│   └── migrate-uploads-to-s3.ts  # Local → Supabase Storage migration
└── public/uploads/                # Local file uploads
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm
- PostgreSQL database

### 1. Clone & Install

```bash
git clone https://github.com/franca-uvere/portfolio.git
cd portfolio/my_portfolio
npm install
```

### 2. Configure Environment

Create a `.env` file in `my_portfolio/` (see available variables below):

```env
DATABASE_URL="postgresql://user:password@host:5432/db?schema=portfolio"
DIRECT_URL="postgresql://user:password@host:5432/db?schema=portfolio"

# Supabase (for cloud storage — optional if using local uploads)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Upload mode: "local" or "online"
NEXT_PUBLIC_UPLOAD_BUCKET="local"
UPLOAD_BUCKET="local"

# Supabase Storage (required if UPLOAD_BUCKET=online)
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
BUCKET_NAME="portfolio"
REGION="us-west-1"
S3_ENDPOINT="https://your-project.supabase.co/storage/v1/s3"

# Admin auth
JWT_SECRET="your-jwt-secret"
```

### 3. Set Up the Database

```bash
# Run migrations
npx prisma migrate deploy

# Seed with sample data
npm run seed
```

### 4. Run the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the portfolio.

### 5. Access the Admin

Navigate to `/admin/login`. Default credentials are set up in the seed script — check `prisma/seed.ts` for details.

---

## 📜 Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start Next.js development server |
| `build` | `npm run build` | Production build |
| `start` | `npm run start` | Start production server |
| `lint` | `npm run lint` | Run ESLint |
| `seed` | `npm run seed` | Seed database with portfolio data |

**Manual scripts:**

```bash
# Migrate local uploads to Supabase Storage
npx tsx scripts/migrate-uploads-to-s3.ts
```

---

## 🗄 Database

The schema lives in `prisma/schema.prisma` and covers **17 models**:

| Model | Purpose |
|-------|---------|
| `Bio` | Singleton — name, headline, tagline, photo, resume, background style |
| `Contact` | Singleton — email, socials, availability |
| `Project` | Portfolio projects with slug, type, stack, features, media, automation details |
| `ProjectCategory` | Project type categories |
| `ProjectStack` | Tech stack entries per project |
| `ProjectFeature` | Feature highlights per project |
| `ProjectMedia` | Images/videos per project |
| `AutomationDetails` | n8n automation metadata (tool, trigger, workflow, time saved) |
| `AutomationIntegration` | Services connected by an automation |
| `Skill` | Skill groups with icon and proficiency |
| `SkillItem` | Individual items within a skill group |
| `Experience` | Work experience entries |
| `ExperienceTag` | Tags on experience entries |
| `Education` | Education history |
| `Testimonial` | Client/colleague testimonials |
| `Certification` | Professional certifications |
| `Service` | Services offered |

All models use a `portfolio` schema namespace. Migrations are managed via Prisma.

---

## 🎨 Design System

The portfolio uses CSS custom properties for theming, defined in `app/globals.css`:

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#060608` | Page background |
| `--acc` | `#7B5EA7` | Primary accent (purple) |
| `--acc2` | `#E85D75` | Secondary accent (coral) |
| `--acc3` | `#3ECFCF` | Tertiary accent (teal) |
| `--font-display` | Bebas Neue | Headings |
| `--font-body` | DM Sans | Body text |
| `--font-mono` | DM Mono | Code & labels |

---

## 🔐 Authentication

Admin auth is a custom implementation:

- **Login** — POST `/api/admin/auth/login` verifies credentials against `auth.users` (bcryptjs), returns an HTTP-only cookie (`admin_session`) containing a signed JWT (jose, HS256, 7-day expiry)
- **Middleware** — `proxy.ts` verifies the JWT on every `/admin/*` and `/api/admin/*` route (except `/admin/login` and `/api/admin/auth/login`)
- **Edge-safe verification** — `lib/auth-edge.ts` provides JWT verification without Node.js-specific APIs for use in middleware
- **Logout** — POST `/api/admin/auth/logout` clears the cookie

---

## ☁️ Upload System

Files can be stored in two modes, controlled by the `UPLOAD_BUCKET` environment variable:

| Mode | `UPLOAD_BUCKET` | Storage Location |
|------|----------------|-----------------|
| **Local** | `"local"` | `public/uploads/` |
| **Cloud** | `"online"` | Supabase Storage bucket |

Switching modes only requires changing the env var. To migrate existing local uploads to Supabase Storage, run:

```bash
npx tsx scripts/migrate-uploads-to-s3.ts
```

---

## 🚢 Deployment

The project is deployed on **Vercel**. Push to the main branch to trigger a deployment.

Required environment variables must be set in the Vercel project settings.

For other platforms, the standard Next.js deployment applies:

```bash
npm run build
npm run start
```

---

## 📄 License

This project is private and unlicensed. All rights reserved.

---

Built by [Franca Chigoziem Uvere](https://franca-uvere.vercel.app) — Full-Stack & Backend Engineer, Lagos Nigeria.
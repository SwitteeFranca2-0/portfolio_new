# Portfolio — Next.js 16 + Prisma + PostgreSQL

A fully featured personal portfolio with a CMS-style admin panel. All content is stored in a database and managed from `/admin` — no hardcoding required. Clone it, seed it, make it yours.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| ORM | Prisma 7 |
| Database | PostgreSQL (Railway or any provider) |
| Auth | Custom JWT (bcrypt + pg) |
| File Storage | Local / S3-compatible / Supabase Storage |
| Email | Mailjet |
| 3D Background | Three.js |
| Rich Text | Tiptap |

## Features

- **DB-driven content** — bio, projects, skills, experience, education, services, testimonials, certifications, stats, contact — all managed from `/admin`
- **Two 3D backgrounds** — scroll-driven laptop animation or atmospheric particle field, switchable from admin
- **Demo mode** — one toggle in the admin serves placeholder data from `lib/data.ts` — great for previewing before your content is ready
- **Flexible file uploads** — local, S3-compatible (AWS/R2/MinIO/Spaces/Backblaze), or Supabase Storage — auto-detected from env vars. Uploaded images are served through `/api/images/[...key]`, so the bucket itself never needs to be public.
- **Contact form** — sends real emails via Mailjet
- **Curated homepage** — pick which projects (max 4, incl. the sticky one), experience entries (max 3), and skills (max 8, shown in the Hero) actually appear on the landing page; everything else stays on its full listing page (`/projects`, `/experience`, `/skills`)
- **Hide projects** — mark any project hidden from an eye-icon toggle in the admin list; hidden projects 404 publicly but stay editable in admin
- **Paginated projects page** — `/projects` paginates at 9 per page
- **SEO** — dynamic Open Graph images (with your profile photo), sitemap.xml, robots.txt
- **Responsive** — mobile hamburger nav, breakpoints at 640px and 900px

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/SwitteeFranca2-0/portfolio_new.git my-portfolio
cd my-portfolio
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in `.env`. At minimum you need `DATABASE_URL` and `NEXTAUTH_SECRET`. See `.env.example` for the full reference.

### 3. Set up the database

```bash
npx prisma db push        # create all tables
npx tsx prisma/seed.ts    # seed with starter content
```

`seed.ts` populates portfolio content (bio, projects, skills, etc.) **and** creates a default admin login via an `AdminUser` upsert:

- Email: `temp@email.com`
- Password: `ChangeMe124`

Log in with those credentials, then go straight to `/admin/settings` and change both the password and email — there is no "forgot password" recovery flow in this app, so don't lose whatever you set.

### 4. Run

```bash
npm run dev
```

- Portfolio: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## Demo Mode

Not ready to populate real content yet? Go to **Admin → Bio → Demo Mode** and turn it on. The public site immediately switches to the generic placeholder data in `lib/data.ts`. Turn it off when you're ready to go live — no restart needed.

---

## File Storage

Three options, auto-detected from your env vars:

| Option | How to activate |
|---|---|
| **Local** (default) | No extra config. Files go to `public/uploads/`, served at `/uploads/`. |
| **S3-compatible** | Set `IS_S3_ENDPOINT=true` + S3 credentials. Works with AWS S3, Cloudflare R2, MinIO, DigitalOcean Spaces, Backblaze B2, self-hosted Tigris OS, etc. |
| **Supabase Storage** | Set `S3_ENDPOINT` to your Supabase storage URL + `JWT_SECRET`. Do **not** set `IS_S3_ENDPOINT`. |

See `.env.example` for the exact variable names.

The S3 bucket does **not** need to be publicly readable. Uploads are proxied through `GET /api/images/[...key]`, which fetches the object server-side using your configured credentials and streams it back — this works the same whether the bucket is public or fully private.

---

## Deploying

### Vercel (recommended)

1. Push to GitHub
2. Import at [vercel.com](https://vercel.com)
3. Add all env vars from `.env.example`
4. Deploy

After deploying, update these three files with your real domain:
- `app/layout.tsx` — `metadataBase`
- `app/sitemap.ts` — `BASE` constant
- `app/robots.ts` — `sitemap` URL

---

## Project Structure

```
app/
├── admin/           ← protected admin panel (bio, projects, skills, etc.)
├── api/             ← API routes (CRUD, uploads, image proxy, contact form, OG image)
├── page.tsx         ← public landing page
├── projects/        ← /projects listing (paginated, 9/page) + /projects/[slug] detail
├── skills/          ← /skills page
├── experience/      ← /experience page (full work history)
└── contact/         ← /contact page

components/
├── home/            ← landing page sections (Hero, Skills, Projects, etc.)
├── admin/           ← admin UI (Sidebar, Topbar, MediaUpload, RichTextEditor)
├── layout/          ← Nav, Footer, Cursor, PublicShell
├── three/           ← Three.js scenes (laptop journey + particle field)
└── ui/              ← shared primitives (Chip, SectionHeader, RichText, etc.)

lib/
├── models/          ← OOP model layer (BaseModel → BioModel, ProjectModel, etc.)
├── data.ts          ← demo placeholder data (shown in demo mode)
├── auth.ts          ← NextAuth setup — Credentials provider, session/JWT callbacks
├── auth.config.ts   ← Edge-safe NextAuth config (used by proxy.ts)
├── s3.ts            ← shared S3 client/bucket helpers
└── prisma.ts        ← Prisma client singleton

prisma/
├── schema.prisma    ← full database schema (20+ models)
└── seed.ts          ← populates DB with starter content

scripts/
└── migrate-uploads-to-s3.ts  ← migrates local uploads to cloud storage
```

---

## Content Types

Managed entirely from the admin panel:

| Section | Admin page |
|---|---|
| Bio, photo, resume, typed role | `/admin/bio` |
| Projects (media gallery, hide/show, homepage pick) | `/admin/projects` |
| Skills & technologies (hero pick, max 8) | `/admin/skills` |
| Work experience (homepage pick, max 3) | `/admin/experience` |
| Education | `/admin/education` |
| Services offered | `/admin/services` |
| Testimonials | `/admin/testimonials` |
| Certifications | `/admin/certifications` |
| Stats / numbers | `/admin/stats` |
| Contact info & socials | `/admin/contact` |

---

## License

MIT

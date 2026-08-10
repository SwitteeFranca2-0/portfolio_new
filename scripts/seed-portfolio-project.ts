/**
 * Adds this portfolio site itself as a Project entry (category: Software).
 * No images — Franca is adding those herself via /admin.
 *
 * Usage: npx tsx scripts/seed-portfolio-project.ts
 */
import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../lib/generated/prisma/client'

const pool    = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false })
const adapter = new PrismaPg(pool, { schema: 'portfolio' })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma  = new PrismaClient({ adapter } as any)

async function main() {
  const slug = 'portfolio-website'
  const existing = await prisma.project.findUnique({ where: { slug } })
  if (existing) {
    console.log(`⏭  "${slug}" already exists (#${existing.id}) — skipping`)
    return
  }

  const maxOrder = await prisma.project.aggregate({ _max: { order: true } })
  const order = (maxOrder._max.order ?? -1) + 1

  const project = await prisma.project.create({
    data: {
      slug, title: 'Portfolio Website', type: 'Fullstack · Personal', categoryId: 'software', year: 2026,
      description: 'A fully database-driven personal portfolio with a CMS-style admin panel — every section (bio, projects, skills, experience, testimonials) is editable from /admin with no hardcoding.',
      body: `
<h3>Overview</h3>
<p>This site itself — built on Next.js 16 (App Router) with a Prisma/PostgreSQL backend and a custom JWT-authenticated admin panel. Every public section is stored in the database and managed from <code>/admin</code>, including a rich text editor for project write-ups, a media gallery per project, and a demo mode that serves placeholder content while real content isn't ready yet.</p>
<h3>Problem</h3>
<p>Most portfolio templates hardcode content into components, so updating a bio line or adding a project means editing and redeploying code. I wanted a portfolio I could maintain like a real product — content changes through an admin UI, not a git commit.</p>
<h3>Solution</h3>
<ul>
<li>Full CMS-style admin panel (JWT auth) covering bio, projects, skills, experience, education, services, testimonials, certifications, stats, and contact info.</li>
<li>Flexible file storage that auto-detects local filesystem, S3-compatible buckets (AWS/R2/MinIO/Spaces), or Supabase Storage from env vars.</li>
<li>Two switchable Three.js backgrounds — a scroll-driven laptop animation and an atmospheric particle field.</li>
<li>Demo mode toggle that serves generic placeholder data site-wide for previewing before real content is added.</li>
<li>Dynamic Open Graph images, sitemap, and robots.txt for SEO.</li>
</ul>`.trim(),
      outcome: 'Live — the site you\'re looking at.',
      featured: false, order,
    },
  })

  await prisma.projectStack.createMany({
    data: [
      'Next.js 16', 'TypeScript', 'Prisma 7', 'PostgreSQL', 'Three.js', 'Tiptap', 'JWT Auth', 'Resend',
    ].map((name, i) => ({ name, order: i, projectId: project.id })),
  })

  await prisma.projectFeature.createMany({
    data: [
      'DB-driven content across every section, managed from /admin',
      'Two switchable Three.js backgrounds (laptop journey / particle field)',
      'Demo mode — one toggle serves placeholder content site-wide',
      'Auto-detected file storage: local, S3-compatible, or Supabase',
      'Contact form with real email delivery via Resend',
      'Dynamic OG images, sitemap.xml, and robots.txt for SEO',
    ].map((text, i) => ({ text, order: i, projectId: project.id })),
  })

  console.log(`✓ created project #${project.id} "${project.title}" (no images — add via /admin)`)
}

main()
  .catch(e => { console.error('Failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect().then(() => pool.end()))

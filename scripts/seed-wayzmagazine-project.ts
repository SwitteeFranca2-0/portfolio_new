/**
 * Adds WayzMagazine — a custom WordPress/WooCommerce/Elementor Pro client
 * site — as a Project entry (category: Software). Marked hidden since the
 * site is still "coming soon"; flip Project.hidden to false at launch.
 *
 * Usage: npx tsx scripts/seed-wayzmagazine-project.ts
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
  const slug = 'wayzmagazine'
  const existing = await prisma.project.findUnique({ where: { slug } })
  if (existing) {
    console.log(`⏭  "${slug}" already exists (#${existing.id}) — skipping`)
    return
  }

  const maxOrder = await prisma.project.aggregate({ _max: { order: true } })
  const order = (maxOrder._max.order ?? -1) + 1

  const project = await prisma.project.create({
    data: {
      slug, title: 'WayzMagazine', type: 'Fullstack · Client (WayzMagazine)', categoryId: 'software', year: 2026,
      description: 'A fully custom-built WordPress magazine site — no pre-made templates — with WooCommerce print sales, multi-author publishing, Pinterest integration, and Google Analytics-backed post analytics.',
      body: `
<h3>Overview</h3>
<p>WayzMagazine is a client magazine website built entirely from scratch on WordPress with Elementor Pro — every page and layout is custom-designed rather than assembled from a pre-built theme or template. The site combines editorial publishing with e-commerce: readers can purchase physical prints directly from articles via WooCommerce, and multiple authors can publish under their own bylines.</p>
<h3>Problem</h3>
<p>The client needed a magazine platform that looked and felt fully bespoke — not another templated WordPress site — while still supporting real commerce (print sales) and an editorial team of multiple writers, plus visibility into which content and products actually perform.</p>
<h3>Solution</h3>
<ul>
<li><strong>Fully custom design:</strong> every layout built from scratch in Elementor Pro — no pre-defined templates.</li>
<li><strong>WooCommerce print sales:</strong> readers can buy physical prints of featured content directly from the site.</li>
<li><strong>Multi-author publishing:</strong> role-based author accounts with individual bylines and profiles.</li>
<li><strong>Pinterest integration:</strong> content is pinnable and syndicated to extend organic reach.</li>
<li><strong>Site & post analytics:</strong> Google Analytics tracks site-wide traffic alongside per-post performance for editorial insight.</li>
</ul>
<p>Currently in "coming soon" mode ahead of public launch.</p>`.trim(),
      outcome: 'In progress — coming soon page live ahead of full launch.',
      featured: false, hidden: true, order,
    },
  })

  await prisma.projectStack.createMany({
    data: [
      'WordPress', 'Elementor Pro', 'WooCommerce', 'Pinterest', 'Google Analytics', 'PHP',
    ].map((name, i) => ({ name, order: i, projectId: project.id })),
  })

  await prisma.projectFeature.createMany({
    data: [
      'Fully custom Elementor Pro design — no pre-built templates',
      'WooCommerce store for purchasing physical prints',
      'Multi-author publishing with individual bylines',
      'Pinterest integration for content syndication',
      'Google Analytics site-wide + per-post analytics',
      'Coming-soon launch page',
    ].map((text, i) => ({ text, order: i, projectId: project.id })),
  })

  console.log(`✓ created project #${project.id} "${project.title}" (hidden: true — flip to false at launch)`)
}

main()
  .catch(e => { console.error('Failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect().then(() => pool.end()))

/**
 * Adds an "Automation" skill group (n8n, Make, Apify, LLMs, etc.) sourced from
 * the Notion skills export, and fills a gap in the existing Backend group
 * (Flask, listed in the bio's stack but missing from Skill items).
 *
 * Usage: npx tsx scripts/seed-automation-skills.ts
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
  const existing = await prisma.skill.findFirst({ where: { title: 'Automation' } })
  if (existing) {
    console.log('⏭  "Automation" skill group already exists — skipping create')
  } else {
    const maxOrder = await prisma.skill.aggregate({ _max: { order: true } })
    const order = (maxOrder._max.order ?? -1) + 1

    const skill = await prisma.skill.create({
      data: {
        icon: '⚙️', title: 'Automation', proficiency: 'expert', yearsExp: 2, order,
        description: 'I design and ship AI-driven automation workflows — connecting APIs, LLMs, and data pipelines to turn manual processes into reliable, observable systems.',
      },
    })
    await prisma.skillItem.createMany({
      data: [
        { name: 'n8n',       highlight: true,  order: 0, skillId: skill.id },
        { name: 'Make',      highlight: true,  order: 1, skillId: skill.id },
        { name: 'LLMs / OpenAI', highlight: true, order: 2, skillId: skill.id },
        { name: 'Apify',     highlight: false, order: 3, skillId: skill.id },
        { name: 'Airtable',  highlight: false, order: 4, skillId: skill.id },
        { name: 'Webhooks & APIs', highlight: false, order: 5, skillId: skill.id },
      ],
    })
    console.log(`✓ created "Automation" skill group #${skill.id} with 6 items`)
  }

  const backend = await prisma.skill.findFirst({ where: { title: 'Backend' }, include: { items: true } })
  if (backend && !backend.items.some(i => i.name.toLowerCase().includes('flask'))) {
    await prisma.skillItem.create({
      data: { name: 'Python/Flask', highlight: false, order: backend.items.length, skillId: backend.id },
    })
    console.log('✓ added "Python/Flask" to Backend skill items')
  } else {
    console.log('⏭  Backend already has Flask (or Backend group not found) — skipping')
  }

  console.log('Done.')
}

main()
  .catch(e => { console.error('Failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect().then(() => pool.end()))

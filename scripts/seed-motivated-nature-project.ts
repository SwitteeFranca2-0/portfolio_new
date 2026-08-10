/**
 * Adds Motivated Nature — an AI voice-agent automation built for a client,
 * worked on as a two-person agency (Franca as AI & Automation Engineer).
 * Codebase/workflows are confidential — described at architecture level only,
 * with a live link instead of a repo.
 *
 * Usage: npx tsx scripts/seed-motivated-nature-project.ts
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
  const slug = 'motivated-nature'
  const existing = await prisma.project.findUnique({ where: { slug } })
  if (existing) {
    console.log(`⏭  "${slug}" already exists (#${existing.id}) — skipping`)
    return
  }

  const maxOrder = await prisma.project.aggregate({ _max: { order: true } })
  const order = (maxOrder._max.order ?? -1) + 1

  const project = await prisma.project.create({
    data: {
      slug, title: 'Motivated Nature', type: 'AI Voice Automation · Client (Team)', categoryId: 'automation', year: 2025,
      description: 'An AI voice-agent platform that calls users, holds a guided reflective conversation, and turns each call into a personalized audio reflection — built with n8n, Vapi, and 11Labs, with Airtable as the admin backbone.',
      body: `
<h3>Overview</h3>
<p>Motivated Nature calls users and takes them through a guided voice conversation, then turns that call into a personalized spoken reflection. Built as a two-person team — I served as the AI & Automation Engineer, owning the n8n orchestration, the AI agent prompting/logic, and the reflection-generation pipeline; a partner handled the Next.js frontend.</p>
<p>Codebase and internal workflow details are confidential to the client, so this write-up describes the architecture at a high level rather than sharing implementation specifics.</p>
<h3>How it works</h3>
<ul>
<li><strong>Registration:</strong> users sign up via a GoHighLevel (GHL) form; GHL submits the details to an n8n webhook, which creates the user's Airtable record and simultaneously saves the contact in GHL.</li>
<li><strong>Call orchestration (n8n):</strong> n8n owns the voice agent's backend operations — call record-keeping, registration/pass updates, and passing personalization parameters to the Vapi API so each call is tailored to the caller.</li>
<li><strong>Voice agent (Vapi):</strong> Vapi places and conducts the personified call and records it.</li>
<li><strong>Reflection generation:</strong> an AI agent, constrained by a carefully engineered system/user prompt, analyzes the call. Key classification data from the conversation is embedded and stored in a vector database, which the agent uses to rank and retrieve relevant context before generating the written reflection under the defined guidelines.</li>
<li><strong>Audio production (11Labs):</strong> the reflection text is converted to speech via 11Labs; a stitching script joins the generated audio chunks into a single file, which is saved to Airtable.</li>
<li><strong>Admin dashboard (Airtable):</strong> serves as the operational backbone — approving or regenerating reflections, monitoring user activity and entitlements, and generating/storing coupon codes.</li>
</ul>`.trim(),
      outcome: 'Live — production voice-agent pipeline handling registration through to delivered audio reflections.',
      liveUrl: 'https://motivatednature.com/',
      featured: false, order,
    },
  })

  await prisma.projectStack.createMany({
    data: [
      'n8n', 'Vapi', 'Next.js', 'Airtable', 'GoHighLevel', '11Labs', 'Vector Database',
    ].map((name, i) => ({ name, order: i, projectId: project.id })),
  })

  await prisma.projectFeature.createMany({
    data: [
      'GHL intake form → n8n webhook → Airtable record + synced GHL contact',
      'n8n-orchestrated call registration and pass/entitlement updates',
      'Personified voice calls via the Vapi API',
      'Prompt-guided AI agent generating reflections from call content',
      'Vector database ranking/classification of caller data for context-aware reflections',
      '11Labs text-to-speech with audio-chunk stitching',
      'Airtable admin dashboard: approve/regenerate reflections, monitor entitlements, manage coupon codes',
    ].map((text, i) => ({ text, order: i, projectId: project.id })),
  })

  const automation = await prisma.automationDetails.create({
    data: {
      projectId: project.id,
      tool: 'n8n',
      trigger: 'GHL form submission (registration) & Vapi call completion',
      status: 'active',
      timeSaved: 'Fully automated: registration → personalized call → AI reflection → audio delivery',
    },
  })
  await prisma.automationIntegration.createMany({
    data: ['Vapi', 'Airtable', 'GoHighLevel', '11Labs'].map(name => ({ name, automationId: automation.id })),
  })

  console.log(`✓ created project #${project.id} "${project.title}"`)
}

main()
  .catch(e => { console.error('Failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect().then(() => pool.end()))

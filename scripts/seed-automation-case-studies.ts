/**
 * Uploads screenshots from the Notion "automation work" export to the S3 bucket
 * and creates real Project records (category: Automations) from the case-study
 * write-ups, replacing the need to hand-enter them via the admin UI.
 *
 * Usage: npx tsx scripts/seed-automation-case-studies.ts
 */
import 'dotenv/config'
import { readFile } from 'fs/promises'
import path from 'path'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { PrismaClient } from '../lib/generated/prisma/client'
import { getS3Client, getS3Bucket } from '../lib/s3'

const pool    = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false })
const adapter = new PrismaPg(pool, { schema: 'portfolio' })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma  = new PrismaClient({ adapter } as any)

const SOURCE_ROOT = '/Users/Franca/Downloads/my_automation-work/Hi, I’m Franca/Projects (1)'
const S3_FOLDER   = 'portfolio/automations'
const S3_BASE     = '/api/images/portfolio/automations'

type ProjectSeed = {
  slug: string
  title: string
  type: string
  year: number
  description: string
  body: string
  outcome: string
  stack: string[]
  features: string[]
  automation: {
    tool: string
    trigger: string
    workflowNodes?: number
    timeSaved?: string
    status: 'active' | 'archived' | 'in-progress'
    integrations: string[]
  }
  images: { file: string; caption: string }[]
}

const PROJECTS: ProjectSeed[] = [
  {
    slug: 'invoice-inbox-automation',
    title: 'Invoice Inbox — Google Sheets Automation',
    type: 'Automation · Client',
    year: 2025,
    description: 'Monitors Gmail for invoice emails, extracts vendor/amount/date data with an LLM, and logs structured rows to Google Sheets.',
    outcome: 'Live — eliminates manual invoice transcription and gives finance real-time visibility into what has arrived.',
    body: `
<h3>Overview</h3>
<p>Built an end-to-end automation system that monitors the founder's Gmail for invoice emails, extracts text from PDFs or the email body, and uses an LLM to structure the data — logging clean rows and metadata into Google Sheets. The system integrates Google Workspace (Gmail/Drive/Sheets), Make, and OpenAI.</p>
<h3>Problem</h3>
<p>Manually opening each email and transcribing invoice details into a sheet was repetitive, slow, and error-prone, causing delays in payments and poor visibility.</p>
<h3>Solution</h3>
<ul>
<li>Continuously watches Gmail for invoice-related subjects (e.g. "invoice", "billing", "statement").</li>
<li>Downloads PDF attachments and captures email body text; applies OCR when needed.</li>
<li>Uses an LLM to extract vendor, invoice number, dates, amounts, currency, and line items.</li>
<li>Appends a normalized row to Google Sheets with key fields plus sender, thread ID, and file URL.</li>
<li>Labels/archives processed emails, prevents duplicates, and sends error alerts for exceptions.</li>
</ul>`.trim(),
    stack: ['Make', 'Gmail', 'Google Drive', 'Google Sheets', 'OpenAI'],
    features: [
      'Gmail inbox monitoring for invoice-related subjects',
      'PDF & email-body text extraction with OCR fallback',
      'LLM-structured extraction of vendor, amounts, dates, line items',
      'Automatic Google Sheets logging with source metadata',
      'Duplicate prevention & error alerting',
    ],
    automation: {
      tool: 'Make', trigger: 'Gmail new email (invoice-related)',
      workflowNodes: 16, timeSaved: '~4 hrs/week', status: 'active',
      integrations: ['Gmail', 'Google Drive', 'Google Sheets', 'OpenAI'],
    },
    images: [
      { file: 'Invoice Inbox - Google Sheets Automation/Screenshot_from_2025-10-22_16-29-20.png', caption: 'Workflow overview' },
      { file: 'Invoice Inbox - Google Sheets Automation/Screenshot_from_2025-10-27_19-11-52.png', caption: 'Extraction step' },
      { file: 'Invoice Inbox - Google Sheets Automation/Screenshot_from_2025-10-27_19-30-23.png', caption: 'Google Sheets log' },
    ],
  },
  {
    slug: 'proposal-generation-automation',
    title: 'Proposal Generation and Delivery Automation',
    type: 'Automation · Client',
    year: 2025,
    description: 'Turns post-call form inputs into polished, on-brand proposals — AI-drafted, Google Docs-generated, and Airtable-tracked through approval and send.',
    outcome: 'Live — faster turnaround, consistent quality, and full visibility across the sales proposal pipeline.',
    body: `
<h3>Overview</h3>
<p>After each discovery call, sales submits a short form. The automation uses n8n to turn those answers into a polished, on-brand proposal — no copy-paste, no formatting hassle. An LLM (OpenAI) refines the inputs into clear prose, fills a Google Docs template, and creates a record in Airtable for tracking and approval. Once approved, the client receives a professional email with the proposal link, and the system logs status and timing.</p>
<h3>Problem</h3>
<p>Writing proposals from scratch after calls was slow and inconsistent. Reusing old Google Docs meant clashing styles, outdated sections, and manual formatting fixes. Managers had little oversight — no central tracker, unclear approval state, and scattered files.</p>
<h3>Solution</h3>
<ul>
<li><strong>Single intake:</strong> sales completes a short form immediately after the call; entries land in a shared sheet.</li>
<li><strong>AI polishing:</strong> the system rewrites inputs into professional, client-ready language matching the template and tone.</li>
<li><strong>Auto-document:</strong> a new proposal doc is generated and linked back to a central Airtable record.</li>
<li><strong>Human control:</strong> sales leadership approves in Airtable; only then is the client email sent.</li>
<li><strong>Governed and visible:</strong> every step — draft, approval, send — is logged for a clean audit trail.</li>
</ul>`.trim(),
    stack: ['n8n', 'OpenAI', 'Google Docs', 'Airtable', 'Gmail'],
    features: [
      'Post-call intake form → shared sheet',
      'AI rewriting into on-brand, client-ready prose',
      'Automated Google Docs template generation',
      'Airtable tracking with an approval gate',
      'Automatic client email on approval',
    ],
    automation: {
      tool: 'n8n', trigger: 'Form submission (post-call intake)',
      workflowNodes: 20, timeSaved: '~6 hrs/week', status: 'active',
      integrations: ['OpenAI', 'Google Docs', 'Airtable', 'Gmail'],
    },
    images: [
      { file: 'Proposal Generation and Delivery Automatio/Screenshot_from_2025-10-22_17-01-30.png', caption: 'Intake form' },
      { file: 'Proposal Generation and Delivery Automatio/Screenshot_from_2025-10-28_06-54-54.png', caption: 'n8n workflow' },
      { file: 'Proposal Generation and Delivery Automatio/Screenshot_from_2025-10-28_06-55-07.png', caption: 'AI drafting step' },
      { file: 'Proposal Generation and Delivery Automatio/Screenshot_from_2025-10-28_06-55-07 1.png', caption: 'Generated proposal doc' },
      { file: 'Proposal Generation and Delivery Automatio/Screenshot_from_2025-10-28_07-03-50.png', caption: 'Airtable tracker' },
      { file: 'Proposal Generation and Delivery Automatio/Screenshot_from_2025-10-28_07-14-53.png', caption: 'Approval & send' },
    ],
  },
  {
    slug: 'content-generation-publishing-automation',
    title: 'Content Generation and Publishing Automation',
    type: 'Automation · Client',
    year: 2025,
    description: 'Turns a Telegram idea or reference URL into platform-ready posts — three SEO-drafted articles, a human pick, then LinkedIn/X/email adaptations, published or scheduled from the same chat.',
    outcome: 'Live — faster output, consistent tone, and a calm, repeatable content rhythm.',
    body: `
<h3>Overview</h3>
<p>Built an end-to-end system that turns raw ideas or a reference URL (via Telegram) into platform-ready content for LinkedIn, X, and email. The flow drafts multiple SEO-compliant articles, returns options for a human pick, then adapts the chosen draft per platform and publishes or schedules from the same chat — while saving everything for traceability.</p>
<h3>Problem</h3>
<p>The team's content process was creative but slow: scattered ideation, manual drafting, inconsistent formatting across platforms, and context switching between tools. Publishing depended on copy-paste and ad-hoc reviews, so quality varied and deadlines slipped.</p>
<h3>Solution</h3>
<ul>
<li><strong>One chat, full journey:</strong> content kicks off in Telegram with an idea or URL; three SEO-ready drafts come back for instant review.</li>
<li><strong>Human choice, automated follow-through:</strong> the editor picks a draft; the chosen piece is adapted for LinkedIn, X, and newsletter styles, with a fitting visual.</li>
<li><strong>Publish now or schedule:</strong> confirm where and when to go live from the same chat; the system posts or queues and logs everything.</li>
<li><strong>Consistent and scalable:</strong> formatting, tone, and checklists are applied the same way every time.</li>
</ul>`.trim(),
    stack: ['Telegram', 'n8n', 'OpenAI', 'LinkedIn', 'X', 'Email'],
    features: [
      'Telegram-based idea/URL intake',
      'Three SEO-optimised draft articles per request',
      'Human-in-the-loop draft selection',
      'Per-platform adaptation (LinkedIn, X, email)',
      'Publish-now or schedule, controlled from chat',
    ],
    automation: {
      tool: 'n8n', trigger: 'Telegram message (idea or URL)',
      workflowNodes: 24, timeSaved: '~5 hrs/week', status: 'active',
      integrations: ['Telegram', 'OpenAI', 'LinkedIn', 'X'],
    },
    images: [
      { file: 'Content Generation and Publishing Automation/Screenshot_from_2025-10-22_17-04-32.png', caption: 'Telegram intake' },
      { file: 'Content Generation and Publishing Automation/Screenshot_from_2025-11-02_08-13-10.png', caption: 'Draft generation' },
      { file: 'Content Generation and Publishing Automation/Screenshot_from_2025-11-02_08-13-22.png', caption: 'Draft options' },
      { file: 'Content Generation and Publishing Automation/Screenshot_from_2025-11-02_08-12-20.png', caption: 'Platform adaptation' },
      { file: 'Content Generation and Publishing Automation/Screenshot_from_2025-11-02_08-12-25.png', caption: 'LinkedIn version' },
      { file: 'Content Generation and Publishing Automation/Screenshot_from_2025-11-02_08-29-03.png', caption: 'Scheduling step' },
      { file: 'Content Generation and Publishing Automation/Screenshot_from_2025-11-02_08-29-10.png', caption: 'Publish confirmation' },
      { file: 'Content Generation and Publishing Automation/Screenshot_from_2025-11-02_08-29-17.png', caption: 'Workflow overview' },
    ],
  },
  {
    slug: 'reporting-dashboard-automation',
    title: 'Reporting & Dashboard Automation',
    type: 'Automation · Client',
    year: 2025,
    description: 'One-click, button-activated year-end reporting that pulls Sales, Project Delivery, and People Ops data into a standardised, KPI-driven executive dashboard.',
    outcome: 'Live — replaces days of manual spreadsheet consolidation with a single, auditable, repeatable refresh.',
    body: `
<h3>Overview</h3>
<p>Delivers a button-activated refresh that pulls Sales from Google Sheets and Project Delivery and People Ops from Airtable, standardises formats, then computes monthly KPIs. Results are written back to Airtable as a living source of truth, powering an executive dashboard that shows trends, outliers, and progress against goals. Each run leaves an audit trail and exception notes.</p>
<h3>Problem</h3>
<p>The year-end report was a scramble — Sales, Project Delivery, and People Ops each tracked performance in separate tools, so operations had to locate files, reconcile formats, and chase missing entries by hand, inviting copy-paste errors and inconsistent definitions.</p>
<h3>Solution</h3>
<ul>
<li><strong>Single source of truth:</strong> one click in Airtable gathers, aligns, and refreshes the entire year's data.</li>
<li><strong>Frictionless data collection:</strong> each department keeps working in its own tools; the system brings everything together on demand.</li>
<li><strong>Trustworthy, comparable numbers:</strong> dates, statuses, and currencies are standardised so KPIs mean the same thing everywhere.</li>
<li><strong>Exception-first reviews:</strong> anything that looks off is surfaced for a quick human check.</li>
<li><strong>Auditability by design:</strong> each refresh leaves a trail of what was included and when.</li>
</ul>`.trim(),
    stack: ['n8n', 'Airtable', 'Google Sheets'],
    features: [
      'Button-activated multi-source data refresh',
      'Cross-tool standardisation (dates, currency, status)',
      'Automated monthly KPI computation',
      'Executive dashboard with trends & outliers',
      'Exception surfacing and audit trail per run',
    ],
    automation: {
      tool: 'n8n', trigger: 'Airtable button click',
      workflowNodes: 22, timeSaved: 'Days → minutes per refresh', status: 'active',
      integrations: ['Airtable', 'Google Sheets'],
    },
    images: [
      { file: 'Reporting & Dashboard Automation/Screenshot_from_2025-10-22_16-56-13.png', caption: 'Dashboard overview' },
      { file: 'Reporting & Dashboard Automation/Screenshot_from_2025-10-28_06-33-58.png', caption: 'KPI computation' },
      { file: 'Reporting & Dashboard Automation/Screenshot_from_2025-10-28_06-34-04.png', caption: 'Workflow logic' },
      { file: 'Reporting & Dashboard Automation/Screenshot_from_2025-10-28_06-34-10.png', caption: 'Data standardisation' },
      { file: 'Reporting & Dashboard Automation/Screenshot_from_2025-10-27_19-51-55.png', caption: 'Airtable source data' },
      { file: 'Reporting & Dashboard Automation/Screenshot_from_2025-10-28_06-31-17.png', caption: 'Executive dashboard' },
      { file: 'Reporting & Dashboard Automation/Screenshot_from_2025-10-28_06-31-25.png', caption: 'Trend view' },
    ],
  },
  {
    slug: 'lead-generation-outreach-automation',
    title: 'Lead Generation and Outreach Automation',
    type: 'Automation · Client',
    year: 2025,
    description: 'Turns job title, location, company size, and keyword inputs into vetted leads and ready-to-review outreach — discovery, enrichment, email validation, and personalized drafts, all centralized in Airtable.',
    outcome: 'Live — faster prospecting, higher message relevance, and full visibility from discovery to draft outreach.',
    body: `
<h3>Overview</h3>
<p>Built a scalable outbound engine that turns basic inputs — job title, location, company size, and keyword — into a review-ready pipeline of prospects and tailored outreach. The system discovers relevant leads, enriches company context from public sources, validates email deliverability, and centralizes everything in Airtable. For each qualified contact it generates a personalized three-step email sequence and a concise LinkedIn message. Nothing sends automatically — managers review, edit, and approve first.</p>
<h3>Problem</h3>
<p>Outbound was slow, inconsistent, and hard to scale. Teams manually searched for prospects, copied details into spreadsheets, guessed at context, and wrote cold emails from scratch, with no single source of truth for who was researched, validated, or ready for outreach.</p>
<h3>Solution</h3>
<ul>
<li><strong>Guided intake:</strong> start with role, location, company size, and keyword to focus the search.</li>
<li><strong>Automated discovery:</strong> find matching companies and contacts, avoiding duplicates.</li>
<li><strong>Context enrichment:</strong> verify website/LinkedIn, scrape "About" sections, and summarize what each company does.</li>
<li><strong>Quality filters:</strong> validate email deliverability and flag risky addresses.</li>
<li><strong>Personalized drafts:</strong> generate a 3-step email sequence plus a short LinkedIn message per company.</li>
<li><strong>Human control:</strong> nothing sends automatically — edit, approve, then export or push to a sending tool.</li>
</ul>`.trim(),
    stack: ['n8n', 'Apify', 'Airtable', 'OpenAI'],
    features: [
      'Guided intake (role, location, size, keyword)',
      'Automated company & contact discovery with de-duplication',
      'Website/LinkedIn enrichment & "About" summarisation',
      'Email deliverability validation',
      'Personalized 3-step email sequence + LinkedIn note per lead',
      'Central Airtable workspace with human approval gate',
    ],
    automation: {
      tool: 'n8n', trigger: 'Manual intake form (role, location, size, keyword)',
      workflowNodes: 28, timeSaved: '~8 hrs/week', status: 'active',
      integrations: ['Apify', 'Airtable', 'OpenAI', 'LinkedIn'],
    },
    images: [
      { file: 'Lead Generation and Outreach Automation/Screenshot_from_2025-10-22_17-07-16.png', caption: 'Intake inputs' },
      { file: 'Lead Generation and Outreach Automation/Screenshot_from_2025-11-02_08-37-11.png', caption: 'Discovery step' },
      { file: 'Lead Generation and Outreach Automation/Screenshot_from_2025-11-02_08-38-00.png', caption: 'Enrichment step' },
      { file: 'Lead Generation and Outreach Automation/Screenshot_from_2025-11-02_08-38-11.png', caption: 'Email validation' },
      { file: 'Lead Generation and Outreach Automation/Screenshot_from_2025-11-02_08-38-20.png', caption: 'Draft outreach messages' },
      { file: 'Lead Generation and Outreach Automation/Screenshot_from_2025-11-02_08-38-27.png', caption: 'LinkedIn note draft' },
      { file: 'Lead Generation and Outreach Automation/Screenshot_from_2025-11-02_08-38-56.png', caption: 'Airtable workspace' },
      { file: 'Lead Generation and Outreach Automation/Screenshot_from_2025-11-02_08-38-34.png', caption: 'Approval status' },
      { file: 'Lead Generation and Outreach Automation/Screenshot_from_2025-11-02_08-38-41.png', caption: 'Workflow overview' },
    ],
  },
  {
    slug: 'telegram-record-base',
    title: 'Telegram Record Base — SME Bookkeeping Bot',
    type: 'Automation · Personal',
    year: 2025,
    description: 'A lightweight Telegram bot that turns SME sales/expense logging into simple chat commands, validated and stored in Airtable with instant receipts and exportable reports.',
    outcome: 'Working prototype — zero-server, low-cost bookkeeping for small businesses via Telegram, n8n, Python, and Airtable.',
    body: `
<h3>Overview</h3>
<p>SME RecordBase is a lightweight automation that transforms Telegram into a business assistant. Through simple chat commands (<code>/sales</code>, <code>/expense</code>, <code>/metrics</code>), transactions are validated and stored in Airtable, processed in n8n with Python, and summarized into instant receipts and downloadable reports (Excel/PDF).</p>
<h3>Problem</h3>
<p>Most small business owners still record transactions in notebooks or spreadsheets, creating inaccurate and scattered data. Commercial accounting tools are expensive, subscription-based, and require training. This project shows that a zero-server, low-cost stack can automate data capture, storage, and analysis for everyday SMEs.</p>
<h3>Solution</h3>
<ul>
<li><strong>One chat entry point:</strong> a Telegram bot captures finance activity with forgiving commands like <code>/sales &lt;amount&gt; [id|memo] [date]</code>.</li>
<li><strong>Orchestration & validation (n8n):</strong> messages are parsed and normalized; an idempotency key prevents duplicates from retries.</li>
<li><strong>Structured storage (Airtable):</strong> each entry becomes a clean row with type, amount, currency, date, memo, and timestamps.</li>
<li><strong>Exception-first handling:</strong> ambiguous entries are routed back to Telegram for a quick confirm/deny.</li>
<li><strong>Instant receipts & summaries:</strong> the bot replies with a receipt, and <code>/metrics</code> returns month or year snapshots.</li>
<li><strong>Built to extend:</strong> categories, attachments (receipt OCR), or multi-currency support can be added without changing the core command flow.</li>
</ul>`.trim(),
    stack: ['Telegram', 'n8n', 'Python', 'Airtable'],
    features: [
      'Chat-based sales/expense logging (/sales, /expense, /metrics)',
      'Idempotency-key duplicate prevention',
      'Structured Airtable transaction storage',
      'Exception-first confirm/deny flow',
      'Instant receipts + Excel/PDF report export',
    ],
    automation: {
      tool: 'n8n', trigger: 'Telegram bot command',
      workflowNodes: 15, timeSaved: 'Replaces manual notebook bookkeeping', status: 'in-progress',
      integrations: ['Telegram', 'Airtable', 'Python'],
    },
    images: [
      { file: 'Telegram Record Base/Screenshot_from_2025-11-02_09-17-13.png', caption: 'Telegram bot commands' },
      { file: 'Telegram Record Base/Screenshot_from_2025-11-02_09-17-21.png', caption: 'Sales entry' },
      { file: 'Telegram Record Base/Screenshot_from_2025-11-02_09-17-27.png', caption: 'Expense entry' },
      { file: 'Telegram Record Base/Screenshot_from_2025-11-02_09-17-33.png', caption: 'Instant receipt' },
      { file: 'Telegram Record Base/Screenshot_from_2025-11-02_09-17-39.png', caption: 'Airtable record' },
      { file: 'Telegram Record Base/Screenshot_from_2025-11-02_09-17-50.png', caption: 'Metrics summary' },
      { file: 'Telegram Record Base/Screenshot_from_2025-11-02_09-17-56.png', caption: 'n8n workflow' },
    ],
  },
  {
    slug: 'meeting-transcript-proposal-automation',
    title: 'Meeting-to-Proposal Automation (Claude MCP)',
    type: 'Automation · Personal',
    year: 2025,
    description: 'Transforms meeting transcripts into client-ready proposals using Claude MCP, natural-language commands, and an n8n → Make.com → PandaDoc delivery pipeline.',
    outcome: 'Prototype — proposals drafted, edited, and sent entirely through natural language.',
    body: `
<h3>Overview</h3>
<p>Built an end-to-end automation system that transforms meeting transcripts into client-ready proposals using AI and workflow automation. The system integrates Claude MCP, Google Workspace, n8n, Make.com, and PandaDoc — allowing the team to draft, edit, and send proposals entirely through natural language.</p>
<h3>Problem</h3>
<p>Manually drafting proposals after meetings was time-consuming and inconsistent, often delaying client responses and losing deal momentum.</p>
<h3>Solution</h3>
<ul>
<li>Captures meeting transcripts from Google Drive.</li>
<li>Lets users interact with the transcript in Claude MCP to generate and refine proposals.</li>
<li>Uses natural language commands to trigger automated delivery via n8n → Make.com → PandaDoc.</li>
<li>Logs all activity in Google Sheets for visibility and tracking.</li>
</ul>`.trim(),
    stack: ['Claude MCP', 'Google Workspace', 'n8n', 'Make.com', 'PandaDoc'],
    features: [
      'Transcript capture from Google Drive',
      'Conversational proposal drafting via Claude MCP',
      'Natural-language triggered delivery pipeline',
      'n8n → Make.com → PandaDoc handoff',
      'Google Sheets activity logging',
    ],
    automation: {
      tool: 'n8n', trigger: 'Natural-language command (Claude MCP)',
      workflowNodes: 12, timeSaved: '~2 hrs per proposal', status: 'in-progress',
      integrations: ['Claude MCP', 'Google Workspace', 'Make.com', 'PandaDoc'],
    },
    images: [
      { file: '[Automation Project]/duxsoup-integromat.png', caption: 'Workflow overview' },
    ],
  },
]

function mimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  return ({ png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp' } as Record<string, string>)[ext ?? ''] ?? 'application/octet-stream'
}

async function uploadImage(client: ReturnType<typeof getS3Client>, bucket: string, slug: string, index: number, relPath: string) {
  const absPath   = path.join(SOURCE_ROOT, relPath)
  const buffer    = await readFile(absPath)
  const ext       = relPath.split('.').pop()
  const key       = `${S3_FOLDER}/${slug}/${index}.${ext}`
  await client.send(new PutObjectCommand({
    Bucket: bucket, Key: key, Body: buffer, ContentType: mimeType(relPath),
  }))
  return `${S3_BASE}/${slug}/${index}.${ext}`
}

async function main() {
  const client = getS3Client()
  const bucket = getS3Bucket()

  const maxOrder = await prisma.project.aggregate({ _max: { order: true } })
  let order = (maxOrder._max.order ?? 0) + 1

  console.log(`Uploading images to s3://${bucket}/${S3_FOLDER}/ and creating ${PROJECTS.length} project(s)...\n`)

  for (const p of PROJECTS) {
    const existing = await prisma.project.findUnique({ where: { slug: p.slug } })
    if (existing) {
      console.log(`⏭  ${p.slug} already exists — skipping`)
      continue
    }

    console.log(`→ ${p.title}`)
    const media: { type: string; url: string; caption?: string; order: number }[] = []
    for (let i = 0; i < p.images.length; i++) {
      const url = await uploadImage(client, bucket, p.slug, i, p.images[i].file)
      media.push({ type: 'image', url, caption: p.images[i].caption, order: i })
      console.log(`   ✓ uploaded ${p.images[i].file.split('/').pop()}`)
    }

    const project = await prisma.project.create({
      data: {
        slug: p.slug, title: p.title, type: p.type, categoryId: 'automation', year: p.year,
        description: p.description, body: p.body, outcome: p.outcome,
        imageUrl: media[0]?.url, featured: false, order: order++,
      },
    })

    await prisma.projectStack.createMany({
      data: p.stack.map((name, i) => ({ name, order: i, projectId: project.id })),
    })
    await prisma.projectFeature.createMany({
      data: p.features.map((text, i) => ({ text, order: i, projectId: project.id })),
    })
    await prisma.projectMedia.createMany({
      data: media.map(m => ({ ...m, projectId: project.id })),
    })
    const automationDetails = await prisma.automationDetails.create({
      data: {
        projectId: project.id,
        tool: p.automation.tool,
        trigger: p.automation.trigger,
        workflowNodes: p.automation.workflowNodes,
        timeSaved: p.automation.timeSaved,
        status: p.automation.status,
      },
    })
    await prisma.automationIntegration.createMany({
      data: p.automation.integrations.map(name => ({ name, automationId: automationDetails.id })),
    })

    console.log(`   ✓ created project #${project.id} (${p.images.length} images)\n`)
  }

  console.log('Done.')
}

main()
  .catch(e => { console.error('Failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect().then(() => pool.end()))

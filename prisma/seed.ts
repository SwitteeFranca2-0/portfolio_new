import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../lib/generated/prisma/client'

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false })
const adapter = new PrismaPg(pool, { schema: 'portfolio' })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  console.log('🌱 Seeding portfolio schema...')

  // ── Categories ────────────────────────────────────────────────────────────
  await prisma.projectCategory.createMany({
    data: [
      { id: 'software',   label: 'Software Projects', order: 0 },
      { id: 'automation', label: 'Automations',        order: 1 },
      { id: 'scripts',    label: 'Scripts & Others',   order: 2 },
    ],
    skipDuplicates: true,
  })
  console.log('✓ Categories')

  // ── Bio ───────────────────────────────────────────────────────────────────
  await prisma.bio.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name:         'Franca Uvere',
      headline:     'Full-Stack & Backend Engineer · Lagos, NG',
      tagline:      'I build scalable full-stack and backend systems with Python, React, and Node.js — shipping real products that work at scale.',
      typedRole:    'Software & Automation Engineer',
      location:     'Lagos, Nigeria',
      availability: 'Open — remote & on-site',
      responseTime: 'Within 24 hours',
      resumeUrl:    'https://franca-uvere.vercel.app/franca_uvere_resume.pdf',
    },
  })
  console.log('✓ Bio')

  // ── Contact ───────────────────────────────────────────────────────────────
  await prisma.contact.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id:           1,
      email:        'francauvere1@gmail.com',
      location:     'Lagos, Nigeria',
      availability: 'Open — remote & on-site',
      responseTime: 'Within 24 hours',
      github:       'https://github.com/FrancaUvere',
      linkedin:     'https://www.linkedin.com/in/franca-uvere/',
      instagram:    'https://www.instagram.com/switteefranca/',
      whatsapp:     'https://wa.me/2349020949301',
      formEnabled:  true,
    },
  })
  console.log('✓ Contact')

  // ── Skills ────────────────────────────────────────────────────────────────
  const skillsData = [
    {
      icon: '⚛️', title: 'Frontend', proficiency: 'proficient', yearsExp: 3, order: 0,
      description: 'Responsive, interactive UIs built for performance and real users.',
      items: [
        { name: 'React JS',   highlight: true,  order: 0 },
        { name: 'Next.js',    highlight: true,  order: 1 },
        { name: 'TypeScript', highlight: true,  order: 2 },
        { name: 'HTML/CSS',   highlight: false, order: 3 },
        { name: 'Tailwind',   highlight: false, order: 4 },
        { name: 'Redux',      highlight: false, order: 5 },
      ],
    },
    {
      icon: '🐍', title: 'Backend', proficiency: 'expert', yearsExp: 4, order: 1,
      description: 'Robust APIs and server-side systems that scale without breaking.',
      items: [
        { name: 'Python',  highlight: true,  order: 0 },
        { name: 'Django',  highlight: true,  order: 1 },
        { name: 'Flask',   highlight: false, order: 2 },
        { name: 'Odoo',    highlight: false, order: 3 },
        { name: 'Node.js', highlight: true,  order: 4 },
        { name: 'Express', highlight: false, order: 5 },
      ],
    },
    {
      icon: '🗄️', title: 'Database', proficiency: 'proficient', yearsExp: 3, order: 2,
      description: 'Relational, document, and cloud-native data storage solutions.',
      items: [
        { name: 'PostgreSQL', highlight: true,  order: 0 },
        { name: 'Firestore',  highlight: true,  order: 1 },
        { name: 'MongoDB',    highlight: false, order: 2 },
        { name: 'SQLite',     highlight: false, order: 3 },
        { name: 'SQL',        highlight: false, order: 4 },
      ],
    },
    {
      icon: '☁️', title: 'DevOps & Tools', proficiency: 'proficient', yearsExp: 2, order: 3,
      description: 'Shipping and maintaining software with modern tooling and workflows.',
      items: [
        { name: 'Git / GitHub', highlight: true,  order: 0 },
        { name: 'Docker',       highlight: false, order: 1 },
        { name: 'Vercel',       highlight: false, order: 2 },
        { name: 'Linux',        highlight: false, order: 3 },
        { name: 'Agile',        highlight: false, order: 4 },
      ],
    },
    {
      icon: '🛒', title: 'CMS & E-Commerce', proficiency: 'proficient', yearsExp: 2, order: 4,
      description: 'Custom WordPress and WooCommerce builds for clients that need reliability.',
      items: [
        { name: 'WordPress',   highlight: true,  order: 0 },
        { name: 'WooCommerce', highlight: true,  order: 1 },
        { name: 'PHP',         highlight: false, order: 2 },
      ],
    },
    {
      icon: '🏗️', title: 'Architecture', proficiency: 'proficient', yearsExp: 3, order: 5,
      description: 'Designing systems that are maintainable, testable, and built to last.',
      items: [
        { name: 'REST APIs',     highlight: true,  order: 0 },
        { name: 'MVC',           highlight: false, order: 1 },
        { name: 'Clean Code',    highlight: false, order: 2 },
        { name: 'Auth Systems',  highlight: false, order: 3 },
        { name: 'Microservices', highlight: false, order: 4 },
      ],
    },
  ]

  for (const s of skillsData) {
    const { items, ...skill } = s
    const created = await prisma.skill.create({ data: skill })
    await prisma.skillItem.createMany({
      data: items.map(i => ({ ...i, skillId: created.id })),
    })
  }
  console.log('✓ Skills')

  // ── Experience ────────────────────────────────────────────────────────────
  const expData = [
    {
      company: 'Freelance', role: 'Full-Stack Developer',
      startDate: '2023', endDate: undefined, order: 0,
      description: 'Working with clients across research, e-commerce, and fintech — owning architecture, backend, and frontend delivery end-to-end.',
      tags: ['React', 'Python', 'Node.js', 'PostgreSQL', 'Firebase'],
    },
    {
      company: 'Personal Projects', role: 'Backend Engineer',
      startDate: '2022', endDate: '2023', order: 1,
      description: 'Built a portfolio of backend systems including a secure banking platform and RESTful task API. Focus on auth, data modeling, and clean code.',
      tags: ['Flask', 'Django', 'Express', 'SQLite', 'PostgreSQL'],
    },
  ]

  for (const e of expData) {
    const { tags, ...exp } = e
    const created = await prisma.experience.create({ data: exp })
    await prisma.experienceTag.createMany({
      data: tags.map(name => ({ name, experienceId: created.id })),
    })
  }
  console.log('✓ Experience')

  // ── Projects ──────────────────────────────────────────────────────────────
  const projectsData = [
    {
      slug: 'academic-connect', title: 'Academic Connect',
      type: 'Fullstack · Client', categoryId: 'software', year: 2024,
      featured: true, order: 0,
      description: 'A collaboration platform for researchers, institutions, and organizations. Features real-time feeds, role-based access control, and institution management dashboards.',
      body: 'Built from the ground up for a client in the academic research space. The platform allows researchers to post updates, follow institutions, and collaborate on projects.',
      outcome: 'Live client project — actively used by researchers and academic institutions.',
      imageUrl: 'https://franca-uvere.vercel.app/images/Acadmic-Connect-Feeds-Page.png',
      liveUrl: 'https://franca-uvere.vercel.app/projects/1',
      stack: ['Next.js', 'React', 'Firestore', 'TypeScript'],
      features: ['Real-time activity feed', 'Role-based access control', 'Institution management dashboard', 'Researcher profiles & connections', 'Publication tracking'],
      media: [
        { type: 'image', url: 'https://franca-uvere.vercel.app/images/Acadmic-Connect-Feeds-Page.png', caption: 'Feeds page', order: 0 },
        { type: 'image', url: 'https://picsum.photos/seed/ac2/1200/700', caption: 'Institution dashboard', order: 1 },
        { type: 'image', url: 'https://picsum.photos/seed/ac3/1200/700', caption: 'Researcher profile', order: 2 },
      ],
    },
    {
      slug: 'banking-platform', title: 'Banking Platform',
      type: 'Backend · Personal', categoryId: 'software', year: 2024,
      featured: false, order: 1,
      description: 'Secure online banking backend — account management, fund transfers, transaction tracking, full auth and audit logging.',
      body: 'A backend-only project focused on building a production-grade banking API. Implements JWT authentication with refresh token rotation, account management, and atomic transactions.',
      liveUrl: 'https://franca-uvere.vercel.app/projects/2',
      stack: ['Python', 'Flask', 'SQLite'],
      features: ['JWT auth with refresh token rotation', 'Atomic fund transfers', 'Account lifecycle management', 'Full audit logging', 'Comprehensive test coverage'],
      media: [
        { type: 'image', url: 'https://picsum.photos/seed/bank1/1200/700', caption: 'API documentation', order: 0 },
        { type: 'image', url: 'https://picsum.photos/seed/bank2/1200/700', caption: 'Transaction flow', order: 1 },
      ],
    },
    {
      slug: 'ecommerce-store', title: 'E-Commerce Store',
      type: 'Fullstack · Client', categoryId: 'software', year: 2023,
      featured: false, order: 2,
      description: 'Full-featured e-commerce platform with product management, cart, Stripe payment processing, and order tracking.',
      body: 'A WooCommerce build for a fashion client. Custom theme development, Stripe payment gateway integration, and a bespoke product management workflow.',
      liveUrl: 'https://franca-uvere.vercel.app/projects/3',
      stack: ['WordPress', 'WooCommerce', 'PHP'],
      features: ['Custom WordPress theme', 'Stripe payment integration', 'Inventory & shipping management', 'Mobile-first responsive design', 'Discount & coupon engine'],
      media: [
        { type: 'image', url: 'https://picsum.photos/seed/ecom1/1200/700', caption: 'Storefront', order: 0 },
        { type: 'image', url: 'https://picsum.photos/seed/ecom2/1200/700', caption: 'Product detail', order: 1 },
        { type: 'image', url: 'https://picsum.photos/seed/ecom3/1200/700', caption: 'Checkout', order: 2 },
      ],
    },
    {
      slug: 'task-mgmt-api', title: 'Task Mgmt API',
      type: 'Backend · Personal', categoryId: 'scripts', year: 2023,
      featured: false, order: 3,
      description: 'RESTful API with JWT auth, role-based authorization, and full CRUD. Clean architecture with test coverage throughout.',
      body: 'A clean, well-tested REST API for task management. Features workspace-based multi-tenancy, role-based authorization, and comprehensive test coverage using Jest.',
      liveUrl: 'https://franca-uvere.vercel.app/projects/4',
      stack: ['Node.js', 'Express', 'PostgreSQL'],
      features: ['Workspace-based multi-tenancy', 'Role-based authorization', 'Full CRUD on tasks & boards', 'Clean architecture', '94% test coverage with Jest'],
      media: [
        { type: 'image', url: 'https://picsum.photos/seed/task1/1200/700', caption: 'API routes', order: 0 },
        { type: 'image', url: 'https://picsum.photos/seed/task2/1200/700', caption: 'Test suite', order: 1 },
      ],
    },
    {
      slug: 'lead-capture-automation', title: 'Lead Capture Pipeline',
      type: 'Automation · Client', categoryId: 'automation', year: 2024,
      featured: false, order: 4,
      description: 'Automated lead capture from Typeform into Notion CRM, with Slack notifications and Gmail follow-up sequence.',
      body: 'An n8n workflow that watches for new Typeform submissions, creates a structured record in Notion, posts to Slack, and triggers a 3-step Gmail follow-up sequence.',
      outcome: 'Live — processing 40–60 leads/month with zero manual intervention.',
      stack: ['n8n', 'Typeform', 'Notion', 'Slack', 'Gmail'],
      features: ['Typeform → Notion record creation', 'Slack real-time notifications', '3-step Gmail follow-up sequence', '24hr delay logic', 'Error handling with Slack alerts'],
      media: [
        { type: 'image', url: 'https://picsum.photos/seed/auto1/1200/700', caption: 'n8n workflow', order: 0 },
        { type: 'image', url: 'https://picsum.photos/seed/auto2/1200/700', caption: 'Notion CRM', order: 1 },
      ],
      automation: {
        tool: 'n8n', trigger: 'Typeform submission (webhook)',
        workflowNodes: 14, timeSaved: '~5 hrs/week', status: 'active',
        integrations: ['Typeform', 'Notion', 'Slack', 'Gmail'],
      },
    },
    {
      slug: 'invoice-automation', title: 'Invoice & Payment Tracker',
      type: 'Automation · Personal', categoryId: 'automation', year: 2024,
      featured: false, order: 5,
      description: 'n8n workflow that monitors Gmail for payment confirmations, updates Airtable, and sends WhatsApp receipts automatically.',
      body: 'Built to eliminate the overhead of manually tracking freelance payments. Monitors Gmail, logs to Airtable, marks invoices as paid, and sends WhatsApp confirmations.',
      outcome: 'Handles all payment tracking across 8 active clients — fully automated.',
      stack: ['n8n', 'Gmail', 'Airtable', 'WhatsApp API'],
      features: ['Gmail label monitoring', 'Payment data extraction', 'Airtable invoice status update', 'WhatsApp client receipt', 'Monthly summary report'],
      media: [
        { type: 'image', url: 'https://picsum.photos/seed/auto3/1200/700', caption: 'Workflow overview', order: 0 },
        { type: 'image', url: 'https://picsum.photos/seed/auto4/1200/700', caption: 'Airtable tracker', order: 1 },
      ],
      automation: {
        tool: 'n8n', trigger: 'Gmail label trigger + Monthly schedule',
        workflowNodes: 18, timeSaved: '~3 hrs/month', status: 'active',
        integrations: ['Gmail', 'Airtable', 'WhatsApp Business API'],
      },
    },
  ]

  for (const p of projectsData) {
    const { stack, features, media, automation, ...projectData } = p
    const project = await prisma.project.create({ data: projectData })

    await prisma.projectStack.createMany({
      data: stack.map((name, i) => ({ name, order: i, projectId: project.id })),
    })
    if (features?.length) {
      await prisma.projectFeature.createMany({
        data: features.map((text, i) => ({ text, order: i, projectId: project.id })),
      })
    }
    if (media?.length) {
      await prisma.projectMedia.createMany({
        data: media.map(m => ({ ...m, projectId: project.id })),
      })
    }
    if (automation) {
      const { integrations, ...autoData } = automation
      const auto = await prisma.automationDetails.create({
        data: { ...autoData, projectId: project.id },
      })
      await prisma.automationIntegration.createMany({
        data: integrations.map(name => ({ name, automationId: auto.id })),
      })
    }
  }
  console.log('✓ Projects')

  console.log('\n✅ Seed complete — portfolio schema populated!')
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())

// ── DEMO DATA ─────────────────────────────────────────────────────────────────
// This file contains placeholder data shown when DEMO_MODE=true.
// Replace with your own details in the admin dashboard.

export const bio = {
  name: 'Alex Johnson',
  headline: 'Full-Stack & Automation Engineer · New York, US',
  tagline: 'I build scalable full-stack systems and intelligent automations — turning complex problems into clean, reliable software.',
  location: 'New York, USA',
  availability: 'Open — remote & on-site',
  responseTime: 'Within 24 hours',
  resumeUrl: null as string | null,
  photoUrl:  null as string | null,
  typedRole: 'Software & Automation Engineer',
}

export const contact = {
  email:     'alex@example.com',
  github:    'https://github.com',
  linkedin:  'https://linkedin.com',
  instagram: null as string | null,
  whatsapp:  null as string | null,
}

export const marqueeItems = [
  'TypeScript', 'React', 'Node.js', 'Python', 'PostgreSQL',
  'Next.js', 'Docker', 'REST APIs', 'GraphQL', 'Open to Work',
]

export type SkillItem      = { name: string; highlight: boolean }
export type SkillProficiency = 'expert' | 'proficient' | 'familiar'

export type Skill = {
  id: number
  icon: string
  title: string
  description: string
  proficiency: SkillProficiency
  yearsExp?: number
  items: SkillItem[]
}

export const skills: Skill[] = [
  {
    id: 1, icon: '⚛️', title: 'Frontend',
    description: 'Responsive, accessible UIs built for performance and real users.',
    proficiency: 'expert', yearsExp: 5,
    items: [
      { name: 'React',      highlight: true  },
      { name: 'Next.js',    highlight: true  },
      { name: 'TypeScript', highlight: true  },
      { name: 'Tailwind',   highlight: false },
      { name: 'HTML/CSS',   highlight: false },
    ],
  },
  {
    id: 2, icon: '🖥️', title: 'Backend',
    description: 'Scalable APIs and server-side systems built for reliability.',
    proficiency: 'expert', yearsExp: 6,
    items: [
      { name: 'Node.js',    highlight: true  },
      { name: 'Python',     highlight: true  },
      { name: 'Express',    highlight: false },
      { name: 'FastAPI',    highlight: false },
      { name: 'GraphQL',    highlight: true  },
    ],
  },
  {
    id: 3, icon: '🗄️', title: 'Database',
    description: 'Relational and document databases, optimised queries and migrations.',
    proficiency: 'proficient', yearsExp: 4,
    items: [
      { name: 'PostgreSQL', highlight: true  },
      { name: 'MongoDB',    highlight: true  },
      { name: 'Redis',      highlight: false },
      { name: 'Prisma',     highlight: false },
    ],
  },
  {
    id: 4, icon: '⚙️', title: 'DevOps & Tools',
    description: 'CI/CD pipelines, containers, and cloud infrastructure.',
    proficiency: 'proficient', yearsExp: 3,
    items: [
      { name: 'Docker',     highlight: true  },
      { name: 'Git',        highlight: false },
      { name: 'GitHub Actions', highlight: false },
      { name: 'Vercel',     highlight: false },
      { name: 'Linux',      highlight: false },
    ],
  },
  {
    id: 5, icon: '🤖', title: 'Automation',
    description: 'Workflow automation, data pipelines, and system integrations.',
    proficiency: 'proficient', yearsExp: 2,
    items: [
      { name: 'n8n',        highlight: true  },
      { name: 'Zapier',     highlight: false },
      { name: 'Webhooks',   highlight: false },
      { name: 'Cron Jobs',  highlight: false },
    ],
  },
]

export type AutomationDetails = {
  tool: string
  trigger: string
  integrations: string[]
  workflowNodes?: number
  timeSaved?: string
  status: 'active' | 'archived' | 'in-progress'
}

export type ProjectMedia = {
  type: 'image' | 'video'
  url: string
  caption?: string
}

export const PROJECT_CATEGORIES = [
  { id: 'all',        label: 'All Projects'      },
  { id: 'software',   label: 'Software Projects' },
  { id: 'automation', label: 'Automations'       },
  { id: 'scripts',    label: 'Scripts & Others'  },
] as const

export type ProjectCategory = typeof PROJECT_CATEGORIES[number]['id']

export type Project = {
  id: number
  slug: string
  title: string
  type: string
  category: ProjectCategory
  year: number
  description: string
  body?: string
  outcome?: string
  imageUrl?: string
  liveUrl?: string
  repoUrl?: string
  featured: boolean
  order: number
  stack: string[]
  features?: string[]
  automation?: AutomationDetails
  media: ProjectMedia[]
}

export const projects: Project[] = [
  {
    id: 1, slug: 'saas-dashboard', title: 'SaaS Analytics Dashboard',
    type: 'Fullstack · Client', category: 'software', year: 2024,
    featured: true, order: 0,
    description: 'A multi-tenant analytics dashboard with real-time data visualisation, role-based access, and automated reporting for a B2B SaaS client.',
    body: 'Built end-to-end for a SaaS company needing visibility into user behaviour across their product. Features a live metrics feed, customisable chart widgets, CSV/PDF export, and a white-label mode for enterprise customers. Role-based access lets admins, analysts, and viewers each see tailored views of the same data.',
    outcome: 'Deployed to 120+ enterprise clients. Reduced manual reporting time by 80%.',
    imageUrl: 'https://picsum.photos/seed/dash1/1200/700',
    liveUrl:  '#',
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Prisma', 'Recharts'],
    features: [
      'Real-time metrics feed',
      'Role-based access control',
      'Customisable chart widgets',
      'Automated PDF/CSV reports',
      'Multi-tenant white-label mode',
    ],
    media: [
      { type: 'image', url: 'https://picsum.photos/seed/dash1/1200/700', caption: 'Main dashboard — real-time analytics overview' },
      { type: 'image', url: 'https://picsum.photos/seed/dash2/1200/700', caption: 'Chart builder — drag-and-drop widget configuration' },
      { type: 'image', url: 'https://picsum.photos/seed/dash3/1200/700', caption: 'Report export — scheduled PDF delivery' },
    ],
  },
  {
    id: 2, slug: 'rest-api-boilerplate', title: 'REST API Boilerplate',
    type: 'Backend · Open Source', category: 'software', year: 2024,
    featured: false, order: 1,
    description: 'A production-ready Node.js REST API starter with JWT auth, role-based permissions, rate limiting, and full test coverage.',
    body: 'A batteries-included API boilerplate designed to eliminate the repetitive setup work on every new project. Ships with user auth, refresh tokens, email verification, role guards, request validation, structured logging, and a full Jest test suite. Used as the starting point for client projects.',
    repoUrl: '#',
    stack: ['Node.js', 'Express', 'PostgreSQL', 'Jest'],
    features: [
      'JWT + refresh token auth',
      'Role-based route guards',
      'Request validation middleware',
      'Rate limiting',
      '95% test coverage',
    ],
    media: [
      { type: 'image', url: 'https://picsum.photos/seed/api1/1200/700', caption: 'API docs — auto-generated Swagger UI' },
      { type: 'image', url: 'https://picsum.photos/seed/api2/1200/700', caption: 'Test suite — full coverage report' },
    ],
  },
  {
    id: 3, slug: 'ecommerce-platform', title: 'E-Commerce Platform',
    type: 'Fullstack · Client', category: 'software', year: 2023,
    featured: false, order: 2,
    description: 'Custom e-commerce storefront with product management, cart, Stripe checkout, and order tracking — built for a fashion brand.',
    body: 'A fully custom storefront replacing an off-the-shelf solution that had become too limiting. Built with Next.js for performance, Stripe for payments, and a headless CMS for product management. The client manages everything — inventory, discounts, shipping — from a purpose-built admin panel.',
    stack: ['Next.js', 'Stripe', 'Sanity CMS', 'Tailwind'],
    features: [
      'Headless CMS product management',
      'Stripe payment integration',
      'Real-time inventory tracking',
      'Mobile-first responsive design',
      'Discount & coupon engine',
    ],
    media: [
      { type: 'image', url: 'https://picsum.photos/seed/shop1/1200/700', caption: 'Storefront — product listing page' },
      { type: 'image', url: 'https://picsum.photos/seed/shop2/1200/700', caption: 'Checkout — Stripe payment flow' },
    ],
  },
  {
    id: 4, slug: 'crm-sync-automation', title: 'CRM Sync Pipeline',
    type: 'Automation · Client', category: 'automation', year: 2024,
    featured: false, order: 3,
    description: 'n8n workflow that syncs leads from multiple sources into a central CRM, deduplicates records, and triggers personalised follow-up sequences.',
    body: 'A client was managing leads across five different tools with no single source of truth. This automation watches for new submissions across all channels, deduplicates by email, enriches with company data, pushes to HubSpot, and triggers a personalised email sequence based on the lead source.',
    outcome: 'Eliminated 6hrs/week of manual CRM work. Lead response time dropped from 4hrs to 12mins.',
    stack: ['n8n', 'HubSpot', 'Typeform', 'Clearbit', 'Gmail'],
    features: [
      'Multi-source lead capture',
      'Email deduplication logic',
      'Company data enrichment',
      'HubSpot CRM sync',
      'Source-based email sequences',
    ],
    automation: {
      tool: 'n8n',
      trigger: 'Webhook (multi-source)',
      integrations: ['HubSpot', 'Typeform', 'Clearbit', 'Gmail'],
      workflowNodes: 22,
      timeSaved: '~6 hrs/week',
      status: 'active',
    },
    media: [
      { type: 'image', url: 'https://picsum.photos/seed/crm1/1200/700', caption: 'n8n workflow — full sync pipeline' },
      { type: 'image', url: 'https://picsum.photos/seed/crm2/1200/700', caption: 'HubSpot — auto-enriched contact records' },
    ],
  },
]

export type ExperienceTag = { name: string }
export type Experience = {
  id: number
  company: string
  role: string
  startDate: string
  endDate?: string
  description: string
  order: number
  tags: ExperienceTag[]
}

export const experiences: Experience[] = [
  {
    id: 1, company: 'Acme Corp', role: 'Senior Full-Stack Engineer',
    startDate: '2022', endDate: undefined, order: 0,
    description: 'Leading frontend and backend development for a suite of B2B SaaS products. Own the architecture, technical decisions, and mentoring of junior engineers across three product teams.',
    tags: [{ name: 'React' }, { name: 'Node.js' }, { name: 'PostgreSQL' }, { name: 'TypeScript' }],
  },
  {
    id: 2, company: 'Startup Studio', role: 'Full-Stack Developer',
    startDate: '2020', endDate: '2022', order: 1,
    description: 'Worked across multiple early-stage startups as a generalist engineer — from MVP build-out to scaling infrastructure. Shipped products in fintech, edtech, and logistics.',
    tags: [{ name: 'Python' }, { name: 'Django' }, { name: 'React' }, { name: 'AWS' }],
  },
  {
    id: 3, company: 'Freelance', role: 'Backend Engineer',
    startDate: '2018', endDate: '2020', order: 2,
    description: 'Built REST APIs, automation workflows, and data pipelines for clients across e-commerce, media, and finance. Focused on clean architecture and long-term maintainability.',
    tags: [{ name: 'Node.js' }, { name: 'Express' }, { name: 'MongoDB' }, { name: 'Docker' }],
  },
]

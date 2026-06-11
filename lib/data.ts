export const bio = {
  name: 'Franca Uvere',
  headline: 'Full-Stack & Backend Engineer · Lagos, NG',
  tagline: 'I build scalable full-stack and backend systems with Python, React, and Node.js — shipping real products that work at scale.',
  location: 'Lagos, Nigeria',
  availability: 'Open — remote & on-site',
  responseTime: 'Within 24 hours',
  resumeUrl: 'https://franca-uvere.vercel.app/franca_uvere_resume.pdf',
  photoUrl: null as string | null,   // set via admin dashboard
  typedRole: 'Software & Automation Engineer',
}

export const contact = {
  email: 'francauvere1@gmail.com',
  github: 'https://github.com/FrancaUvere',
  linkedin: 'https://www.linkedin.com/in/franca-uvere/',
  instagram: 'https://www.instagram.com/switteefranca/',
  whatsapp: 'https://wa.me/2349020949301',
}

export const marqueeItems = [
  'Python', 'React JS', 'Node.js', 'Django', 'PostgreSQL',
  'Full-Stack', 'Next.js', 'Firebase', 'REST APIs', 'Open to Work',
]

export type SkillItem = { name: string; highlight: boolean }
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
    description: 'Responsive, interactive UIs built for performance and real users.',
    proficiency: 'proficient', yearsExp: 3,
    items: [
      { name: 'React JS', highlight: true }, { name: 'Next.js', highlight: true },
      { name: 'TypeScript', highlight: true }, { name: 'HTML/CSS', highlight: false },
      { name: 'Tailwind', highlight: false }, { name: 'Redux', highlight: false },
    ],
  },
  {
    id: 2, icon: '🐍', title: 'Backend',
    description: 'Robust APIs and server-side systems that scale without breaking.',
    proficiency: 'expert', yearsExp: 4,
    items: [
      { name: 'Python', highlight: true }, { name: 'Django', highlight: true },
      { name: 'Flask', highlight: false }, { name: 'Odoo', highlight: false },
      { name: 'Node.js', highlight: true }, { name: 'Express', highlight: false },
    ],
  },
  {
    id: 3, icon: '🗄️', title: 'Database',
    description: 'Relational, document, and cloud-native data storage solutions.',
    proficiency: 'proficient', yearsExp: 3,
    items: [
      { name: 'PostgreSQL', highlight: true }, { name: 'Firestore', highlight: true },
      { name: 'MongoDB', highlight: false }, { name: 'SQLite', highlight: false },
      { name: 'SQL', highlight: false },
    ],
  },
  {
    id: 4, icon: '☁️', title: 'DevOps & Tools',
    description: 'Shipping and maintaining software with modern tooling and workflows.',
    proficiency: 'proficient', yearsExp: 2,
    items: [
      { name: 'Git / GitHub', highlight: true }, { name: 'Docker', highlight: false },
      { name: 'Vercel', highlight: false }, { name: 'Linux', highlight: false },
      { name: 'Agile', highlight: false },
    ],
  },
  {
    id: 5, icon: '🛒', title: 'CMS & E-Commerce',
    description: 'Custom WordPress and WooCommerce builds for clients that need reliability.',
    proficiency: 'proficient', yearsExp: 2,
    items: [
      { name: 'WordPress', highlight: true }, { name: 'WooCommerce', highlight: true },
      { name: 'PHP', highlight: false },
    ],
  },
  {
    id: 6, icon: '🏗️', title: 'Architecture',
    description: 'Designing systems that are maintainable, testable, and built to last.',
    proficiency: 'proficient', yearsExp: 3,
    items: [
      { name: 'REST APIs', highlight: true }, { name: 'MVC', highlight: false },
      { name: 'Clean Code', highlight: false }, { name: 'Auth Systems', highlight: false },
      { name: 'Microservices', highlight: false },
    ],
  },
]

export type AutomationDetails = {
  tool: string              // n8n, Zapier, Make, etc.
  trigger: string           // Webhook, Schedule, Form submit, Email
  integrations: string[]    // Slack, Notion, Gmail, Airtable, etc.
  workflowNodes?: number
  timeSaved?: string        // "~4 hrs/week"
  status: 'active' | 'archived' | 'in-progress'
}

export type ProjectMedia = {
  type: 'image' | 'video'
  url: string
  caption?: string
}

export const PROJECT_CATEGORIES = [
  { id: 'all',      label: 'All Projects' },
  { id: 'software', label: 'Software Projects' },
  { id: 'automation', label: 'Automations' },
  { id: 'scripts',  label: 'Scripts & Others' },
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
  automation?: AutomationDetails   // only set for category: 'automation'
  media: ProjectMedia[]
}

export const projects: Project[] = [
  {
    id: 1, slug: 'academic-connect', title: 'Academic Connect',
    type: 'Fullstack · Client', category: 'software', year: 2024, featured: true, order: 0,
    description: 'A collaboration platform for researchers, institutions, and organizations. Features real-time feeds, role-based access control, and institution management dashboards.',
    body: 'Built from the ground up for a client in the academic research space. The platform allows researchers to post updates, follow institutions, and collaborate on projects. Role-based access control ensures that institution admins can manage their members, while a real-time feed keeps everyone up to date. The dashboard provides analytics on engagement and activity across the platform.',
    outcome: 'Live client project — actively used by researchers and academic institutions.',
    imageUrl: 'https://franca-uvere.vercel.app/images/Acadmic-Connect-Feeds-Page.png',
    liveUrl: 'https://franca-uvere.vercel.app/projects/1',
    stack: ['Next.js', 'React', 'Firestore', 'TypeScript'],
    features: ['Real-time activity feed', 'Role-based access control', 'Institution management dashboard', 'Researcher profiles & connections', 'Publication tracking'],
    media: [
      { type: 'image', url: 'https://franca-uvere.vercel.app/images/Acadmic-Connect-Feeds-Page.png', caption: 'Feeds page — real-time activity from followed researchers' },
      { type: 'image', url: 'https://picsum.photos/seed/ac2/1200/700', caption: 'Institution dashboard — member management and analytics' },
      { type: 'image', url: 'https://picsum.photos/seed/ac3/1200/700', caption: 'Researcher profile — publications and connections' },
      { type: 'video', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', caption: 'Platform walkthrough — 2 min demo' },
    ],
  },
  {
    id: 2, slug: 'banking-platform', title: 'Banking Platform',
    type: 'Backend · Personal', category: 'software', year: 2024, featured: false, order: 1,
    description: 'Secure online banking backend — account management, fund transfers, transaction tracking, full auth and audit logging.',
    body: 'A backend-only project focused on building a production-grade banking API. Implements JWT authentication with refresh token rotation, account management (create, freeze, close), fund transfers with atomic transactions, and a full audit log for compliance. All endpoints are tested and documented.',
    liveUrl: 'https://franca-uvere.vercel.app/projects/2',
    stack: ['Python', 'Flask', 'SQLite'],
    features: ['JWT auth with refresh token rotation', 'Atomic fund transfers', 'Account lifecycle management', 'Full audit logging', 'Comprehensive test coverage'],
    media: [
      { type: 'image', url: 'https://picsum.photos/seed/bank1/1200/700', caption: 'API documentation — Swagger UI' },
      { type: 'image', url: 'https://picsum.photos/seed/bank2/1200/700', caption: 'Transaction flow — fund transfer sequence' },
      { type: 'image', url: 'https://picsum.photos/seed/bank3/1200/700', caption: 'Auth system — JWT + refresh token rotation' },
    ],
  },
  {
    id: 3, slug: 'ecommerce-store', title: 'E-Commerce Store',
    type: 'Fullstack · Client', category: 'software', year: 2023, featured: false, order: 2,
    description: 'Full-featured e-commerce platform with product management, cart, Stripe payment processing, and order tracking.',
    body: 'A WooCommerce build for a fashion client. Custom theme development, Stripe payment gateway integration, and a bespoke product management workflow. The client manages inventory, discounts, and shipping zones entirely from the WordPress admin. Optimised for mobile-first browsing.',
    liveUrl: 'https://franca-uvere.vercel.app/projects/3',
    stack: ['WordPress', 'WooCommerce', 'PHP'],
    features: ['Custom WordPress theme', 'Stripe payment integration', 'Inventory & shipping management', 'Mobile-first responsive design', 'Discount & coupon engine'],
    media: [
      { type: 'image', url: 'https://picsum.photos/seed/ecom1/1200/700', caption: 'Storefront — product listing page' },
      { type: 'image', url: 'https://picsum.photos/seed/ecom2/1200/700', caption: 'Product detail — with variant selection' },
      { type: 'image', url: 'https://picsum.photos/seed/ecom3/1200/700', caption: 'Checkout — Stripe payment flow' },
      { type: 'video', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', caption: 'Store walkthrough' },
    ],
  },
  {
    id: 4, slug: 'task-mgmt-api', title: 'Task Mgmt API',
    type: 'Backend · Personal', category: 'scripts', year: 2023, featured: false, order: 3,
    description: 'RESTful API with JWT auth, role-based authorization, and full CRUD. Clean architecture with test coverage throughout.',
    body: 'A clean, well-tested REST API for task management. Features workspace-based multi-tenancy, role-based authorization (admin, member, viewer), full CRUD on tasks and boards, and comprehensive test coverage using Jest. Designed with clean architecture principles — controllers, services, and repositories are fully decoupled.',
    liveUrl: 'https://franca-uvere.vercel.app/projects/4',
    stack: ['Node.js', 'Express', 'PostgreSQL'],
    features: ['Workspace-based multi-tenancy', 'Role-based authorization', 'Full CRUD on tasks & boards', 'Clean architecture (controller/service/repo)', '94% test coverage with Jest'],
    media: [
      { type: 'image', url: 'https://picsum.photos/seed/task1/1200/700', caption: 'API routes — task and board endpoints' },
      { type: 'image', url: 'https://picsum.photos/seed/task2/1200/700', caption: 'Test suite — 94% coverage' },
    ],
  },
  {
    id: 5, slug: 'lead-capture-automation', title: 'Lead Capture Pipeline',
    type: 'Automation · Client', category: 'automation', year: 2024, featured: false, order: 4,
    description: 'Automated lead capture from Typeform into Notion CRM, with Slack notifications and a follow-up email sequence via Gmail — zero manual data entry.',
    body: 'A client was manually copying leads from their Typeform into a Notion database, then sending individual follow-up emails. This n8n workflow watches for new Typeform submissions, creates a structured record in Notion, posts a real-time notification to their Slack #leads channel, and triggers a 3-step Gmail follow-up sequence with a 24hr delay between each. Saved the client approximately 5 hours of manual work per week.',
    outcome: 'Live and active — processing 40–60 leads/month with zero manual intervention.',
    stack: ['n8n', 'Typeform', 'Notion', 'Slack', 'Gmail'],
    features: ['Typeform → Notion record creation', 'Slack real-time lead notifications', '3-step Gmail follow-up sequence', '24hr delay logic between emails', 'Error handling with Slack alerts'],
    automation: {
      tool: 'n8n',
      trigger: 'Typeform submission (webhook)',
      integrations: ['Typeform', 'Notion', 'Slack', 'Gmail'],
      workflowNodes: 14,
      timeSaved: '~5 hrs/week',
      status: 'active',
    },
    media: [
      { type: 'image', url: 'https://picsum.photos/seed/auto1/1200/700', caption: 'n8n workflow — full pipeline view' },
      { type: 'image', url: 'https://picsum.photos/seed/auto2/1200/700', caption: 'Notion CRM — auto-populated lead records' },
    ],
  },
  {
    id: 6, slug: 'invoice-automation', title: 'Invoice & Payment Tracker',
    type: 'Automation · Personal', category: 'automation', year: 2024, featured: false, order: 5,
    description: 'n8n workflow that monitors a Gmail inbox for payment confirmations, updates an Airtable tracker, and sends a WhatsApp receipt to the client automatically.',
    body: 'Built to eliminate the overhead of manually tracking freelance payments. The workflow monitors a dedicated Gmail label for payment confirmation emails, extracts the amount and client name, logs it to Airtable, marks the corresponding invoice as paid, and sends a WhatsApp confirmation to the client via the WhatsApp Business API. Also generates a monthly summary report sent to a personal email every 1st of the month.',
    outcome: 'Handles all payment tracking across 8 active clients — fully automated.',
    stack: ['n8n', 'Gmail', 'Airtable', 'WhatsApp API'],
    features: ['Gmail label monitoring', 'Payment data extraction', 'Airtable invoice status update', 'WhatsApp client receipt', 'Monthly summary report (scheduled)'],
    automation: {
      tool: 'n8n',
      trigger: 'Gmail label trigger + Monthly schedule',
      integrations: ['Gmail', 'Airtable', 'WhatsApp Business API'],
      workflowNodes: 18,
      timeSaved: '~3 hrs/month',
      status: 'active',
    },
    media: [
      { type: 'image', url: 'https://picsum.photos/seed/auto3/1200/700', caption: 'Workflow overview — Gmail to Airtable + WhatsApp' },
      { type: 'image', url: 'https://picsum.photos/seed/auto4/1200/700', caption: 'Airtable — auto-updated invoice tracker' },
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
    id: 1, company: 'Freelance', role: 'Full-Stack Developer',
    startDate: '2023', endDate: undefined, order: 0,
    description: 'Working with clients across research, e-commerce, and fintech — owning architecture, backend, and frontend delivery end-to-end. Built and shipped Academic Connect and Bodijah e-commerce for live clients.',
    tags: [{ name: 'React' }, { name: 'Python' }, { name: 'Node.js' }, { name: 'PostgreSQL' }, { name: 'Firebase' }],
  },
  {
    id: 2, company: 'Personal Projects', role: 'Backend Engineer',
    startDate: '2022', endDate: '2023', order: 1,
    description: 'Built a portfolio of backend systems including a secure banking platform and RESTful task API. Focus on auth, data modeling, and writing clean, well-tested, maintainable code.',
    tags: [{ name: 'Flask' }, { name: 'Django' }, { name: 'Express' }, { name: 'SQLite' }, { name: 'PostgreSQL' }],
  },
]

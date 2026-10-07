import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../lib/generated/prisma/client'

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false })
const adapter = new PrismaPg(pool, { schema: 'portfolio' })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any)

// Bucket is private — images are served through /api/images/[...key], which
// streams them from S3 using the app's own credentials.
const S3_BASE = '/api/images/portfolio'

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
      id:           1,
      name:         'Franca Uvere',
      headline:     'Software Engineer & Problem Solver · Lagos, NG',
      tagline:      "I'm a passionate software engineer with expertise in both frontend and backend development. With over 2 years of experience, I specialize in building scalable, efficient, and user-friendly applications.",
      typedRole:    'Fullstack Developer · Backend Engineer · System Architect',
      location:     'Lagos, Nigeria',
      availability: 'Open — remote & on-site',
      responseTime: 'Within 24 hours',
      photoUrl:     `${S3_BASE}/profile.jpg`,
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

  // ── Admin User (default login — change via /admin/settings) ────────────────
  const defaultAdminPassword = await bcrypt.hash('ChangeMe124', 10)
  await prisma.adminUser.upsert({
    where: { email: 'temp@email.com' },
    update: {},
    create: { email: 'temp@email.com', password: defaultAdminPassword },
  })
  console.log('✓ Admin user (temp@email.com / ChangeMe124 — change this after first login)')

  // ── Skills ────────────────────────────────────────────────────────────────
  const skillsData = [
    {
      icon: '⚛️', title: 'Frontend', proficiency: 'proficient', yearsExp: 2, order: 0,
      description: "I create responsive, interactive, and user-friendly interfaces using modern frontend technologies. My focus is on building performant applications with clean and maintainable code.",
      items: [
        { name: 'HTML/CSS',   highlight: true,  order: 0 }, // 95
        { name: 'React JS',   highlight: true,  order: 1 }, // 90
        { name: 'Tailwind',   highlight: true,  order: 2 }, // 90
        { name: 'TypeScript', highlight: true,  order: 3 }, // 85
        { name: 'Next.js',    highlight: false, order: 4 }, // 80
        { name: 'Redux',      highlight: false, order: 5 }, // 75
      ],
    },
    {
      icon: '🐍', title: 'Backend', proficiency: 'expert', yearsExp: 2, order: 1,
      description: 'I build robust, scalable, and secure server-side applications and APIs. My backend solutions are designed with performance, security, and maintainability in mind.',
      items: [
        { name: 'REST API',              highlight: true,  order: 0 }, // 90
        { name: 'Node.js',                highlight: true,  order: 1 }, // 85
        { name: 'Express',                highlight: true,  order: 2 }, // 80
        { name: 'Python',                 highlight: false, order: 3 }, // 75
        { name: 'Shell / Bash Scripting', highlight: false, order: 4 }, // 80
        { name: 'Odoo',                   highlight: false, order: 5 }, // 70
        { name: 'Microservices',          highlight: false, order: 6 }, // 65
      ],
    },
    {
      icon: '🗄️', title: 'Database', proficiency: 'proficient', yearsExp: 2, order: 2,
      description: 'I design and implement efficient database solutions, from schema design to query optimization. I work with both SQL and NoSQL databases to ensure data integrity and performance.',
      items: [
        { name: 'MongoDB',    highlight: true,  order: 0 }, // 85
        { name: 'PostgreSQL', highlight: true,  order: 1 }, // 80
        { name: 'SQL',        highlight: false, order: 2 }, // 80
        { name: 'Firebase',   highlight: false, order: 3 }, // 75
        { name: 'Redis',      highlight: false, order: 4 }, // 70
        { name: 'Prisma',     highlight: false, order: 5 }, // 65
      ],
    },
    {
      icon: '☁️', title: 'Tools & DevOps', proficiency: 'proficient', yearsExp: 2, order: 3,
      description: 'I leverage modern development tools and practices to streamline the development process. From version control to deployment, I ensure smooth and efficient workflows.',
      items: [
        { name: 'Git',                       highlight: true,  order: 0 }, // 90
        { name: 'Agile',                      highlight: true,  order: 1 }, // 85
        { name: 'Testing',                    highlight: false, order: 2 }, // 80
        { name: 'Automation (Selenium/Scrapy)', highlight: false, order: 3 }, // 80
        { name: 'Docker',                     highlight: false, order: 4 }, // 75
        { name: 'AWS',                        highlight: false, order: 5 }, // 70
        { name: 'CI/CD',                      highlight: false, order: 6 }, // 65
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
      icon: '🏗️', title: 'Architecture', proficiency: 'proficient', yearsExp: 2, order: 5,
      description: 'Creating scalable system architectures that are maintainable, testable, and built to last.',
      items: [
        { name: 'System Architecture', highlight: true,  order: 0 },
        { name: 'MVC',                 highlight: false, order: 1 },
        { name: 'Clean Code',          highlight: false, order: 2 },
        { name: 'Auth Systems',        highlight: false, order: 3 },
      ],
    },
  ]

  // Only seed into an empty table — re-running the seed used to duplicate every group
  if (await prisma.skill.count() > 0) {
    console.log('⏭  Skills already present — skipping')
  } else {
    for (const s of skillsData) {
      const { items, ...skill } = s
      const created = await prisma.skill.create({ data: skill })
      await prisma.skillItem.createMany({
        data: items.map(i => ({ ...i, skillId: created.id })),
      })
    }
    console.log('✓ Skills')
  }

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

  if (await prisma.experience.count() > 0) {
    console.log('⏭  Experience already present — skipping')
  } else {
    for (const e of expData) {
      const { tags, ...exp } = e
      const created = await prisma.experience.create({ data: exp })
      await prisma.experienceTag.createMany({
        data: tags.map(name => ({ name, experienceId: created.id })),
      })
    }
    console.log('✓ Experience')
  }

  // ── Projects ──────────────────────────────────────────────────────────────
  const projectsData = [
    {
      slug: 'academic-connect', title: 'Academic Connect',
      type: 'Fullstack · Client (Oasis Premium)', categoryId: 'software', year: 2024,
      featured: true, order: 0,
      description: 'A platform where researchers can collaborate on research projects, institutions can sign up, and organizations can participate.',
      body: "Academic Connect is a collaborative platform designed for researchers to work together on various research projects. Institutions can easily sign up to connect with researchers, share resources, and foster innovation. Organizations can also participate by providing funding, mentorship, and other support to enhance research outcomes. The platform aims to streamline communication and collaboration, making it easier for researchers to achieve their goals and drive impactful discoveries.",
      outcome: 'Live client project (7 months, 2024/2025) — actively used by researchers and academic institutions.',
      imageUrl: `${S3_BASE}/academic-connect-feeds.png`,
      liveUrl: 'https://devaconnect.vercel.app/',
      stack: ['Next.js', 'React', 'Firestore', 'Firebase Auth', 'Tailwind CSS', 'Node.js'],
      features: [
        'User authentication & authorization',
        'Collaboration tools for research projects',
        'Resource sharing between institutions & researchers',
        'Integrated communication channels',
        'Document management for papers & resources',
        'Event scheduling for meetings & deadlines',
      ],
      media: [
        { type: 'image', url: `${S3_BASE}/academic-connect-home.png`,      caption: 'Home page',        order: 0 },
        { type: 'image', url: `${S3_BASE}/academic-connect-feeds.png`,     caption: 'Feeds page',       order: 1 },
        { type: 'image', url: `${S3_BASE}/academic-connect-login.png`,     caption: 'Login',            order: 2 },
        { type: 'image', url: `${S3_BASE}/academic-connect-signup.png`,    caption: 'Sign up',          order: 3 },
        { type: 'image', url: `${S3_BASE}/academic-connect-messaging.png`, caption: 'Messaging',        order: 4 },
        { type: 'image', url: `${S3_BASE}/academic-connect-post.png`,      caption: 'Post feed',        order: 5 },
        { type: 'image', url: `${S3_BASE}/academic-connect-network.png`,   caption: 'Network',          order: 6 },
        { type: 'image', url: `${S3_BASE}/academic-connect-profile.png`,   caption: 'Researcher profile', order: 7 },
        { type: 'image', url: `${S3_BASE}/academic-connect-workflow.png`,  caption: 'Workflow',         order: 8 },
      ],
    },
    {
      slug: 'banking-platform', title: 'Online Banking Platform',
      type: 'Backend · Personal', categoryId: 'software', year: 2023,
      featured: false, order: 1,
      description: 'A secure online banking platform that offers account management, fund transfers, and transaction tracking.',
      body: 'This online banking platform provides users with a secure and user-friendly interface to manage their finances. Users can create accounts, view transaction histories, and transfer funds between accounts seamlessly. The platform prioritizes security with multi-factor authentication and encryption to protect sensitive data. Additionally, users can set up alerts for transactions, manage their budgets, and access financial insights to make informed decisions. The platform is designed to be responsive, ensuring a smooth experience on both desktop and mobile devices.',
      outcome: 'Personal project — 3 months (2023).',
      imageUrl: `${S3_BASE}/banking-dashboard.png`,
      repoUrl: 'https://github.com/FrancaUvere/Speedy',
      stack: ['Python', 'Flask', 'SQLite', 'Redis', 'HTML', 'CSS', 'JavaScript'],
      features: [
        'Account creation & management',
        'Secure fund transfers',
        'Transaction history & tracking',
        'Multi-factor authentication',
        'Budget management & financial insights',
        'Real-time transaction alerts',
      ],
      media: [
        { type: 'image', url: `${S3_BASE}/banking-dashboard.png`,    caption: 'Dashboard',    order: 0 },
        { type: 'image', url: `${S3_BASE}/banking-sign-in.png`,      caption: 'Sign in',      order: 1 },
        { type: 'image', url: `${S3_BASE}/banking-signup.png`,       caption: 'Sign up',      order: 2 },
        { type: 'image', url: `${S3_BASE}/banking-transaction.png`,  caption: 'Transactions', order: 3 },
        { type: 'image', url: `${S3_BASE}/banking-statement.png`,    caption: 'Statement',    order: 4 },
        { type: 'image', url: `${S3_BASE}/banking-customer.png`,     caption: 'Customer',     order: 5 },
        { type: 'image', url: `${S3_BASE}/banking-profile.png`,      caption: 'Profile',      order: 6 },
        { type: 'image', url: `${S3_BASE}/banking-details.png`,      caption: 'Account details', order: 7 },
        { type: 'image', url: `${S3_BASE}/banking-contact.png`,      caption: 'Contact',      order: 8 },
      ],
    },
    {
      slug: 'ecommerce-store', title: 'E-Commerce Platform',
      type: 'Fullstack · Client (BodijahMarket)', categoryId: 'software', year: 2023,
      featured: false, order: 2,
      description: 'A full-featured e-commerce platform with product management, cart functionality, payment processing, and order tracking.',
      body: 'This comprehensive e-commerce solution provides businesses with everything they need to sell products online. The platform features a responsive design that works seamlessly across all devices, ensuring customers can shop anytime, anywhere. The admin dashboard gives store owners complete control over their inventory, allowing them to add, edit, and remove products with ease. The platform also includes robust analytics to track sales, customer behavior, and inventory levels. Customers enjoy a smooth shopping experience with intuitive navigation, detailed product pages, and a streamlined checkout process. The cart system automatically updates in real-time, and the payment processing is secure and reliable.',
      outcome: 'Client project (BodijahMarket) — 3 months (2023).',
      imageUrl: `${S3_BASE}/ecommerce-home.jpg`,
      stack: ['WordPress', 'WooCommerce', 'PHP', 'CSS', 'Stripe'],
      features: [
        'User authentication',
        'Product catalog with search & filtering',
        'Cart & wishlist',
        'Secure payment processing (Stripe)',
        'Order management & tracking',
        'Admin dashboard for inventory',
        'Analytics & reporting',
      ],
      media: [
        { type: 'image', url: `${S3_BASE}/ecommerce-home.jpg`,    caption: 'Storefront', order: 0 },
        { type: 'image', url: `${S3_BASE}/ecommerce-cart.jpg`,    caption: 'Cart',       order: 1 },
        { type: 'image', url: `${S3_BASE}/ecommerce-account.png`, caption: 'Account',    order: 2 },
        { type: 'image', url: `${S3_BASE}/ecommerce-contact.png`, caption: 'Contact',    order: 3 },
      ],
    },
    {
      slug: 'task-mgmt-api', title: 'Task Management API',
      type: 'Backend · Personal', categoryId: 'scripts', year: 2022,
      featured: false, order: 3,
      description: 'A robust API enabling users to manage tasks with advanced authentication, role-based access, and real-time updates.',
      body: 'This robust task management API serves as the backbone for productivity applications, providing developers with a comprehensive set of endpoints to create, read, update, and delete tasks. The API is built with scalability in mind, capable of handling thousands of concurrent users without performance degradation. Security is a top priority, with JWT-based authentication ensuring that users can only access their own tasks. Role-based authorization further restricts certain operations to admin users, providing an additional layer of security. The API is thoroughly documented using OpenAPI specifications, making it easy for developers to integrate with their frontend applications. Comprehensive error handling ensures that clients receive meaningful error messages when something goes wrong.',
      outcome: 'Personal project — 2 months (2022), in progress.',
      imageUrl: `${S3_BASE}/task-mgmt-project.png`,
      repoUrl: 'https://github.com/SwitteeFranca2-0/task_management',
      stack: ['Node.js', 'Express', 'PostgreSQL', 'JWT', 'Docker', 'Redis', 'Swagger'],
      features: [
        'JWT authentication',
        'Role-based authorization',
        'Full CRUD for tasks & task lists',
        'Task assignment & delegation',
        'Deadline tracking & notifications',
        'Data validation & sanitization',
        'Rate limiting & throttling',
      ],
      media: [
        { type: 'image', url: `${S3_BASE}/task-mgmt-project.png`,  caption: 'Project overview', order: 0 },
        { type: 'image', url: `${S3_BASE}/task-mgmt-dashboard.png`, caption: 'Dashboard',        order: 1 },
        { type: 'image', url: `${S3_BASE}/task-mgmt-kanban.png`,   caption: 'Kanban board',     order: 2 },
        { type: 'image', url: `${S3_BASE}/task-mgmt-calendar.png`, caption: 'Calendar',          order: 3 },
        { type: 'image', url: `${S3_BASE}/task-mgmt-tasks.png`,    caption: 'Tasks list',        order: 4 },
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

  if (await prisma.project.count() > 0) {
    console.log('⏭  Projects already present — skipping')
  } else {
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
  }

  console.log('\n✅ Seed complete — portfolio schema populated!')
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())

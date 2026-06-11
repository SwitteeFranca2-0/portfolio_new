import { BaseModel } from './BaseModel'

const PROJECT_INCLUDE = {
  stack:    { orderBy: { order: 'asc' as const } },
  features: { orderBy: { order: 'asc' as const } },
  media:    { orderBy: { order: 'asc' as const } },
  automation: { include: { integrations: true } },
} as const

type RawProject = Awaited<ReturnType<typeof ProjectModel['_raw']>>

export class ProjectModel extends BaseModel {
  // Internal: raw Prisma result with all relations
  private static async _raw() {
    return this.db.project.findFirstOrThrow({ include: PROJECT_INCLUDE })
  }

  // Shapes a raw Prisma project into the form components expect
  static shape(p: Awaited<ReturnType<typeof ProjectModel.db.project.findFirst>> & {
    stack: { name: string }[]
    features: { text: string }[]
    media: { type: string; url: string; caption: string | null; order: number }[]
    automation: ({ integrations: { name: string }[]; tool: string; trigger: string; workflowNodes: number | null; timeSaved: string | null; status: string }) | null
  }) {
    return {
      id:          p.id,
      slug:        p.slug,
      title:       p.title,
      type:        p.type,
      category:    p.categoryId,
      year:        p.year,
      description: p.description,
      body:        p.body        ?? undefined,
      outcome:     p.outcome     ?? undefined,
      imageUrl:    p.imageUrl    ?? undefined,
      liveUrl:     p.liveUrl     ?? undefined,
      repoUrl:     p.repoUrl     ?? undefined,
      featured:    p.featured,
      order:       p.order,
      stack:       p.stack.map(s => s.name),
      features:    p.features.map(f => f.text),
      media:       p.media.map(m => ({
        type:    m.type as 'image' | 'video',
        url:     m.url,
        caption: m.caption ?? undefined,
      })),
      automation: p.automation ? {
        tool:          p.automation.tool,
        trigger:       p.automation.trigger,
        integrations:  p.automation.integrations.map(i => i.name),
        workflowNodes: p.automation.workflowNodes ?? undefined,
        timeSaved:     p.automation.timeSaved     ?? undefined,
        status:        p.automation.status as 'active' | 'archived' | 'in-progress',
      } : undefined,
    }
  }

  static async findAll() {
    const rows = await this.db.project.findMany({ orderBy: { order: 'asc' }, include: PROJECT_INCLUDE })
    return rows.map(p => this.shape(p))
  }

  // Raw Prisma shape — used by admin pages that need categoryId, not category
  static async findByIdRaw(id: number) {
    return this.db.project.findUnique({ where: { id }, include: PROJECT_INCLUDE })
  }

  static async findById(id: number) {
    const p = await this.db.project.findUnique({ where: { id }, include: PROJECT_INCLUDE })
    return p ? this.shape(p) : null
  }

  static async findBySlug(slug: string) {
    const p = await this.db.project.findUnique({ where: { slug }, include: PROJECT_INCLUDE })
    return p ? this.shape(p) : null
  }

  static async findFeatured() {
    const p = await this.db.project.findFirst({ where: { featured: true }, include: PROJECT_INCLUDE })
    return p ? this.shape(p) : null
  }

  static async count() {
    return this.db.project.count()
  }

  static async findRecent(take = 5) {
    return this.db.project.findMany({
      take,
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, categoryId: true, featured: true, createdAt: true },
    })
  }

  static async getCategories() {
    return this.db.projectCategory.findMany({ orderBy: { order: 'asc' } })
  }

  static async create(data: {
    title: string; slug: string; type: string; categoryId: string; year: number
    description: string; body?: string; outcome?: string; imageUrl?: string
    liveUrl?: string; repoUrl?: string; featured?: boolean; order?: number
    stack: string[]; features: string[]
  }) {
    const { stack, features, ...projectData } = data
    return this.db.project.create({
      data: {
        ...projectData,
        body:     projectData.body     || null,
        outcome:  projectData.outcome  || null,
        imageUrl: projectData.imageUrl || null,
        liveUrl:  projectData.liveUrl  || null,
        repoUrl:  projectData.repoUrl  || null,
        featured: projectData.featured ?? false,
        order:    projectData.order    ?? 0,
        stack:    { create: stack.map((name, i) => ({ name, order: i })) },
        features: { create: features.map((text, i) => ({ text, order: i })) },
      },
    })
  }

  static async update(id: number, data: {
    title?: string; slug?: string; type?: string; categoryId?: string; year?: number
    description?: string; body?: string; outcome?: string; imageUrl?: string
    liveUrl?: string; repoUrl?: string; featured?: boolean; order?: number
    stack?: string[]; features?: string[]
    media?: { type: string; url: string; caption?: string }[]
  }) {
    const { stack, features, media, featured, ...rest } = data

    if (featured) {
      await this.db.project.updateMany({ data: { featured: false } })
    }
    if (stack !== undefined) {
      await this.db.projectStack.deleteMany({ where: { projectId: id } })
    }
    if (features !== undefined) {
      await this.db.projectFeature.deleteMany({ where: { projectId: id } })
    }
    if (media !== undefined) {
      await this.db.projectMedia.deleteMany({ where: { projectId: id } })
    }

    return this.db.project.update({
      where: { id },
      data: {
        ...rest,
        body:     rest.body     !== undefined ? rest.body     || null : undefined,
        outcome:  rest.outcome  !== undefined ? rest.outcome  || null : undefined,
        imageUrl: rest.imageUrl !== undefined ? rest.imageUrl || null : undefined,
        liveUrl:  rest.liveUrl  !== undefined ? rest.liveUrl  || null : undefined,
        repoUrl:  rest.repoUrl  !== undefined ? rest.repoUrl  || null : undefined,
        featured,
        ...(stack    ? { stack:    { create: stack.map((name, i)    => ({ name, order: i })) } } : {}),
        ...(features ? { features: { create: features.map((text, i) => ({ text, order: i })) } } : {}),
        ...(media    ? { media:    { create: media.map((m, i)       => ({ type: m.type, url: m.url, caption: m.caption || null, order: i })) } } : {}),
      },
    })
  }

  static async delete(id: number) {
    return this.db.project.delete({ where: { id } })
  }
}

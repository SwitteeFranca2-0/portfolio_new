import { BaseModel } from './BaseModel'

export class ExperienceValidationError extends Error {}

export class ExperienceModel extends BaseModel {
  static readonly MAX_HOMEPAGE = 3

  static async findAll() {
    const rows = await this.db.experience.findMany({
      orderBy: { order: 'asc' },
      include: { tags: true },
    })
    return rows.map(e => ({
      id:             e.id,
      company:        e.company,
      role:           e.role,
      startDate:      e.startDate,
      endDate:        e.endDate ?? undefined,
      description:    e.description,
      showOnHomepage: e.showOnHomepage,
      order:          e.order,
      tags:           e.tags.map(t => ({ name: t.name })),
    }))
  }

  // Capped defensively in case more than MAX_HOMEPAGE are ever flagged.
  static async findHomepage() {
    const rows = await this.db.experience.findMany({
      where:   { showOnHomepage: true },
      orderBy: { order: 'asc' },
      take:    this.MAX_HOMEPAGE,
      include: { tags: true },
    })
    return rows.map(e => ({
      id:          e.id,
      company:     e.company,
      role:        e.role,
      startDate:   e.startDate,
      endDate:     e.endDate ?? undefined,
      description: e.description,
      order:       e.order,
      tags:        e.tags.map(t => ({ name: t.name })),
    }))
  }

  static async findById(id: number) {
    return this.db.experience.findUnique({
      where: { id },
      include: { tags: true },
    })
  }

  static async count() {
    return this.db.experience.count()
  }

  static async update(id: number, data: {
    company?: string; role?: string; startDate?: string
    endDate?: string | null; description?: string
    showOnHomepage?: boolean; order?: number
    tags?: string[]
  }) {
    const { tags, showOnHomepage, ...rest } = data

    if (showOnHomepage) {
      const current = await this.db.experience.findUniqueOrThrow({
        where: { id },
        select: { showOnHomepage: true },
      })
      if (!current.showOnHomepage) {
        const otherCount = await this.db.experience.count({
          where: { showOnHomepage: true, id: { not: id } },
        })
        if (otherCount >= this.MAX_HOMEPAGE) {
          throw new ExperienceValidationError(`Only ${this.MAX_HOMEPAGE} experiences can show on the homepage — uncheck one first.`)
        }
      }
    }

    if (tags !== undefined) {
      await this.db.experienceTag.deleteMany({ where: { experienceId: id } })
    }
    return this.db.experience.update({
      where: { id },
      data: {
        ...rest,
        showOnHomepage,
        ...(tags ? { tags: { create: tags.map(name => ({ name })) } } : {}),
      },
    })
  }
}

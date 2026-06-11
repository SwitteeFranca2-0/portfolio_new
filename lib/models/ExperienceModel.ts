import { BaseModel } from './BaseModel'

export class ExperienceModel extends BaseModel {
  static async findAll() {
    const rows = await this.db.experience.findMany({
      orderBy: { order: 'asc' },
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
    endDate?: string | null; description?: string; order?: number
    tags?: string[]
  }) {
    const { tags, ...rest } = data
    if (tags !== undefined) {
      await this.db.experienceTag.deleteMany({ where: { experienceId: id } })
    }
    return this.db.experience.update({
      where: { id },
      data: {
        ...rest,
        ...(tags ? { tags: { create: tags.map(name => ({ name })) } } : {}),
      },
    })
  }
}

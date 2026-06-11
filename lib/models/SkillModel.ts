import { BaseModel } from './BaseModel'

export class SkillModel extends BaseModel {
  static async findAll() {
    const rows = await this.db.skill.findMany({
      orderBy: { order: 'asc' },
      include: { items: { orderBy: { order: 'asc' } } },
    })
    return rows.map(s => ({
      id:          s.id,
      icon:        s.icon,
      title:       s.title,
      description: s.description,
      proficiency: s.proficiency as 'expert' | 'proficient' | 'familiar',
      yearsExp:    s.yearsExp ?? undefined,
      items:       s.items.map(i => ({ name: i.name, highlight: i.highlight })),
    }))
  }

  static async findById(id: number) {
    return this.db.skill.findUnique({
      where: { id },
      include: { items: { orderBy: { order: 'asc' } } },
    })
  }

  static async count() {
    return this.db.skill.count()
  }

  static async findHighlightedItems() {
    const items = await this.db.skillItem.findMany({
      where: { highlight: true },
      orderBy: { order: 'asc' },
      select: { name: true },
    })
    return items.map(i => i.name)
  }

  static async update(id: number, data: {
    icon?: string; title?: string; description?: string
    proficiency?: string; yearsExp?: number | null
    items?: { name: string; highlight: boolean; order: number }[]
  }) {
    const { items, ...rest } = data
    if (items !== undefined) {
      await this.db.skillItem.deleteMany({ where: { skillId: id } })
    }
    return this.db.skill.update({
      where: { id },
      data: {
        ...rest,
        ...(items ? { items: { create: items.map((item, i) => ({ name: item.name, highlight: item.highlight, order: i })) } } : {}),
      },
    })
  }
}

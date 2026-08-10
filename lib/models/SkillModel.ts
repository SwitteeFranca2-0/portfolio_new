import { BaseModel } from './BaseModel'

export class SkillValidationError extends Error {}

export class SkillModel extends BaseModel {
  static readonly MAX_HERO = 8

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
      items:       s.items.map(i => ({ name: i.name, highlight: i.highlight, showInHero: i.showInHero })),
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

  // Capped defensively in case more than MAX_HERO are ever flagged.
  static async findHeroItems() {
    const items = await this.db.skillItem.findMany({
      where:   { showInHero: true },
      orderBy: [{ skill: { order: 'asc' } }, { order: 'asc' }],
      take:    this.MAX_HERO,
      select:  { name: true },
    })
    return items.map(i => i.name)
  }

  static async update(id: number, data: {
    icon?: string; title?: string; description?: string
    proficiency?: string; yearsExp?: number | null
    items?: { name: string; highlight: boolean; showInHero: boolean; order: number }[]
  }) {
    const { items, ...rest } = data

    if (items !== undefined) {
      const newHeroCount = items.filter(i => i.showInHero).length
      const otherHeroCount = await this.db.skillItem.count({
        where: { showInHero: true, skillId: { not: id } },
      })
      if (otherHeroCount + newHeroCount > this.MAX_HERO) {
        throw new SkillValidationError(`Only ${this.MAX_HERO} skills can show in the hero — uncheck one first.`)
      }
      await this.db.skillItem.deleteMany({ where: { skillId: id } })
    }
    return this.db.skill.update({
      where: { id },
      data: {
        ...rest,
        ...(items ? { items: { create: items.map((item, i) => ({ name: item.name, highlight: item.highlight, showInHero: item.showInHero, order: i })) } } : {}),
      },
    })
  }
}

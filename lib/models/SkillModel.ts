import { BaseModel } from './BaseModel'

export class SkillValidationError extends Error {}

export class SkillModel extends BaseModel {
  static readonly MAX_HERO = 8

  // By default, hidden skills are excluded — pass includeHidden for admin views.
  static async findAll(opts: { includeHidden?: boolean } = {}) {
    const rows = await this.db.skill.findMany({
      where:   opts.includeHidden ? {} : { hidden: false },
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
      hidden:      s.hidden,
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
      where:   { showInHero: true, skill: { hidden: false } },
      orderBy: [{ skill: { order: 'asc' } }, { order: 'asc' }],
      take:    this.MAX_HERO,
      select:  { name: true },
    })
    return items.map(i => i.name)
  }

  static async update(id: number, data: {
    icon?: string; title?: string; description?: string
    proficiency?: string; yearsExp?: number | null; hidden?: boolean
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

  static async create(data: {
    icon: string; title: string; description: string
    proficiency: string; yearsExp?: number | null
    items: { name: string; highlight: boolean; showInHero: boolean }[]
  }) {
    const { items, ...rest } = data
    const heroCount = await this.db.skillItem.count({ where: { showInHero: true } })
    if (heroCount + items.filter(i => i.showInHero).length > this.MAX_HERO) {
      throw new SkillValidationError(`Only ${this.MAX_HERO} skills can show in the hero — uncheck one first.`)
    }
    const maxOrder = await this.db.skill.aggregate({ _max: { order: true } })
    return this.db.skill.create({
      data: {
        ...rest,
        order: (maxOrder._max.order ?? -1) + 1,
        items: { create: items.map((item, i) => ({ name: item.name, highlight: item.highlight, showInHero: item.showInHero, order: i })) },
      },
    })
  }

  // Items are removed by the onDelete: Cascade relation
  static async delete(id: number) {
    return this.db.skill.delete({ where: { id } })
  }
}

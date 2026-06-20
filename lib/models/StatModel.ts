import { BaseModel } from './BaseModel'
export class StatModel extends BaseModel {
  static async findAll() { return this.db.stat.findMany({ orderBy: { order: 'asc' } }) }
  static async findById(id: number) { return this.db.stat.findUnique({ where: { id } }) }
  static async create(data: { label: string; value: string; order?: number }) {
    return this.db.stat.create({ data: { ...data, order: data.order ?? 0 } })
  }
  static async update(id: number, data: { label?: string; value?: string; order?: number }) {
    return this.db.stat.update({ where: { id }, data })
  }
  static async delete(id: number) { return this.db.stat.delete({ where: { id } }) }
}

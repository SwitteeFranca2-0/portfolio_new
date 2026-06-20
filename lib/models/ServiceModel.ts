import { BaseModel } from './BaseModel'
export class ServiceModel extends BaseModel {
  static async findAll() { return this.db.service.findMany({ orderBy: { order: 'asc' } }) }
  static async findById(id: number) { return this.db.service.findUnique({ where: { id } }) }
  static async create(data: { title: string; description: string; priceRange?: string; order?: number }) {
    return this.db.service.create({ data: { ...data, order: data.order ?? 0 } })
  }
  static async update(id: number, data: { title?: string; description?: string; priceRange?: string | null; order?: number }) {
    return this.db.service.update({ where: { id }, data })
  }
  static async delete(id: number) { return this.db.service.delete({ where: { id } }) }
}

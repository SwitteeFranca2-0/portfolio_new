import { BaseModel } from './BaseModel'
export class EducationModel extends BaseModel {
  static async findAll() { return this.db.education.findMany({ orderBy: { order: 'asc' } }) }
  static async findById(id: number) { return this.db.education.findUnique({ where: { id } }) }
  static async create(data: { institution: string; degree: string; startDate: string; endDate?: string; description?: string; order?: number }) {
    return this.db.education.create({ data: { ...data, order: data.order ?? 0 } })
  }
  static async update(id: number, data: { institution?: string; degree?: string; startDate?: string; endDate?: string | null; description?: string | null; order?: number }) {
    return this.db.education.update({ where: { id }, data })
  }
  static async delete(id: number) { return this.db.education.delete({ where: { id } }) }
}

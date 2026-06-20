import { BaseModel } from './BaseModel'
export class CertificationModel extends BaseModel {
  static async findAll() { return this.db.certification.findMany({ orderBy: { order: 'asc' } }) }
  static async findById(id: number) { return this.db.certification.findUnique({ where: { id } }) }
  static async create(data: { name: string; issuer: string; date: string; credentialUrl?: string; order?: number }) {
    return this.db.certification.create({ data: { ...data, order: data.order ?? 0 } })
  }
  static async update(id: number, data: { name?: string; issuer?: string; date?: string; credentialUrl?: string | null; order?: number }) {
    return this.db.certification.update({ where: { id }, data })
  }
  static async delete(id: number) { return this.db.certification.delete({ where: { id } }) }
}

import { BaseModel } from './BaseModel'
export class TestimonialModel extends BaseModel {
  static async findAll() { return this.db.testimonial.findMany({ orderBy: { order: 'asc' } }) }
  static async findFeatured() { return this.db.testimonial.findMany({ where: { featured: true }, orderBy: { order: 'asc' } }) }
  static async findById(id: number) { return this.db.testimonial.findUnique({ where: { id } }) }
  static async create(data: { author: string; role: string; company: string; quote: string; featured?: boolean; order?: number }) {
    return this.db.testimonial.create({ data: { ...data, featured: data.featured ?? false, order: data.order ?? 0 } })
  }
  static async update(id: number, data: { author?: string; role?: string; company?: string; quote?: string; featured?: boolean; order?: number }) {
    return this.db.testimonial.update({ where: { id }, data })
  }
  static async delete(id: number) { return this.db.testimonial.delete({ where: { id } }) }
}

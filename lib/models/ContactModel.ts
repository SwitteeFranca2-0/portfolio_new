import { BaseModel } from './BaseModel'

type ContactData = {
  email: string; location: string; availability: string; responseTime: string
  github?: string | null; linkedin?: string | null; instagram?: string | null
  whatsapp?: string | null; formEnabled?: boolean
}

export class ContactModel extends BaseModel {
  static async get() {
    return this.db.contact.findUnique({ where: { id: 1 } })
  }

  static async update(data: ContactData) {
    return this.db.contact.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    })
  }
}

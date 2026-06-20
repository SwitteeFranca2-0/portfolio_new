import { BaseModel } from './BaseModel'

export class BioModel extends BaseModel {
  static async get() {
    return this.db.bio.findUnique({ where: { id: 1 } })
  }

  static async update(data: {
    name?: string; headline?: string; tagline?: string; typedRole?: string
    location?: string; availability?: string; responseTime?: string
    photoUrl?: string | null; resumeUrl?: string | null
    backgroundStyle?: string
  }) {
    return this.db.bio.upsert({
      where: { id: 1 },
      update: data,
      create: {
        id: 1,
        name:         data.name         ?? '',
        headline:     data.headline     ?? '',
        tagline:      data.tagline      ?? '',
        typedRole:    data.typedRole    ?? '',
        location:     data.location     ?? '',
        availability: data.availability ?? '',
        responseTime: data.responseTime ?? '',
        photoUrl:        data.photoUrl        ?? null,
        resumeUrl:       data.resumeUrl       ?? null,
        backgroundStyle: data.backgroundStyle ?? 'laptop',
      },
    })
  }
}

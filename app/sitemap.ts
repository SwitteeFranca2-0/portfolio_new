import type { MetadataRoute } from 'next'
import { ProjectModel } from '@/lib/models/ProjectModel'

const BASE = 'https://francauvere.dev'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await ProjectModel.findAll()

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,               lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/projects`, lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/skills`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/contact`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ]

  const projectPages: MetadataRoute.Sitemap = projects.map(p => ({
    url: `${BASE}/projects/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...projectPages]
}

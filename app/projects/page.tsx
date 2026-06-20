export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import { ProjectModel } from '@/lib/models/ProjectModel'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'A full collection of software projects, automation workflows, and scripts built by Franca Uvere.',
}
import ProjectsClient from './ProjectsClient'

export default async function ProjectsPage() {
  const [projects, categories] = await Promise.all([
    ProjectModel.findAll(),
    ProjectModel.getCategories(),
  ])
  return <ProjectsClient projects={projects} categories={categories} />
}

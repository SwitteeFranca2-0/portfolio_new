export const dynamic = 'force-dynamic'
import { ProjectModel } from '@/lib/models/ProjectModel'
import ProjectsClient from './ProjectsClient'

export default async function ProjectsPage() {
  const [projects, categories] = await Promise.all([
    ProjectModel.findAll(),
    ProjectModel.getCategories(),
  ])
  return <ProjectsClient projects={projects} categories={categories} />
}

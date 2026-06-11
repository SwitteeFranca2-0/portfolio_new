import { ProjectModel } from '@/lib/models/ProjectModel'
import { notFound } from 'next/navigation'
import ProjectForm from './ProjectForm'

export const dynamic = 'force-dynamic'

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await ProjectModel.findByIdRaw(Number(id))
  if (!project) notFound()

  const categories = await ProjectModel.getCategories()

  return (
    <div>
      <div className="ar-ph">
        <div>
          <div className="ar-title">Edit Project</div>
          <div className="ar-sub">{project.title}</div>
        </div>
      </div>
      <ProjectForm project={project} categories={categories} />
    </div>
  )
}

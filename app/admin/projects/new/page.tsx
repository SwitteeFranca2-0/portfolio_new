import { ProjectModel } from '@/lib/models/ProjectModel'
import NewProjectForm from './NewProjectForm'

export const dynamic = 'force-dynamic'

export default async function NewProjectPage() {
  const categories = await ProjectModel.getCategories()
  const count = await ProjectModel.count()
  return (
    <div>
      <div className="ar-ph">
        <div>
          <div className="ar-title">New Project</div>
        </div>
      </div>
      <NewProjectForm categories={categories} nextOrder={count} />
    </div>
  )
}

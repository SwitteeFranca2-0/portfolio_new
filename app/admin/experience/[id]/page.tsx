import { ExperienceModel } from '@/lib/models/ExperienceModel'
import { notFound } from 'next/navigation'
import ExperienceForm from './ExperienceForm'

export const dynamic = 'force-dynamic'

export default async function EditExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const exp = await ExperienceModel.findById(Number(id))
  if (!exp) notFound()
  return (
    <div>
      <div className="ar-ph">
        <div>
          <div className="ar-title">Edit Experience</div>
          <div className="ar-sub">{exp.role} at {exp.company}</div>
        </div>
      </div>
      <ExperienceForm experience={exp} />
    </div>
  )
}

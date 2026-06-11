import { SkillModel } from '@/lib/models/SkillModel'
import { notFound } from 'next/navigation'
import SkillForm from './SkillForm'

export const dynamic = 'force-dynamic'

export default async function EditSkillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const skill = await SkillModel.findById(Number(id))
  if (!skill) notFound()
  return (
    <div>
      <div className="ar-ph">
        <div>
          <div className="ar-title">Edit Skill</div>
          <div className="ar-sub">{skill.title}</div>
        </div>
      </div>
      <SkillForm skill={skill} />
    </div>
  )
}

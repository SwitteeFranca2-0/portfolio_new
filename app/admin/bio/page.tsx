import { BioModel } from '@/lib/models/BioModel'
import BioForm from './BioForm'

export const dynamic = 'force-dynamic'

export default async function AdminBioPage() {
  const bio = await BioModel.get()
  return (
    <div>
      <div className="ar-ph">
        <div>
          <div className="ar-title">Bio</div>
          <div className="ar-sub">Your name, headline, tagline, photo and resume</div>
        </div>
      </div>
      <BioForm bio={bio} />
    </div>
  )
}

import { auth } from '@/lib/auth'
import SettingsForm from './SettingsForm'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const session = await auth()

  return (
    <div>
      <div className="ar-ph">
        <div>
          <div className="ar-title">Settings</div>
          <div className="ar-sub">{session?.user?.email}</div>
        </div>
      </div>
      <SettingsForm currentEmail={session?.user?.email ?? ''} />
    </div>
  )
}

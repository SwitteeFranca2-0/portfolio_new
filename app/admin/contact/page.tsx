import { ContactModel } from '@/lib/models/ContactModel'
import ContactForm from './ContactForm'

export const dynamic = 'force-dynamic'

export default async function AdminContactPage() {
  const contact = await ContactModel.get()
  return (
    <div>
      <div className="ar-ph">
        <div>
          <div className="ar-title">Contact</div>
          <div className="ar-sub">Email, social links, availability settings</div>
        </div>
      </div>
      <ContactForm contact={contact} />
    </div>
  )
}

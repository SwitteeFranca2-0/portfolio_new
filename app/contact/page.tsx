export const dynamic = 'force-dynamic'
import { BioModel }     from '@/lib/models/BioModel'
import { ContactModel } from '@/lib/models/ContactModel'
import ContactClient from './ContactClient'

const BIO_FALLBACK = { name: 'Franca Uvere', headline: '', tagline: '', typedRole: '', location: '', availability: '', responseTime: '', photoUrl: null, resumeUrl: null }
const CONTACT_FALLBACK = { email: '', github: null, linkedin: null, instagram: null, whatsapp: null }

export default async function ContactPage() {
  const [bioRaw, contactRaw] = await Promise.all([BioModel.get(), ContactModel.get()])
  const bio = bioRaw ?? BIO_FALLBACK
  const contact = contactRaw ?? CONTACT_FALLBACK
  return <ContactClient bio={bio} contact={contact} />
}

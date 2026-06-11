export const dynamic = 'force-dynamic'
import { BioModel }        from '@/lib/models/BioModel'
import { ContactModel }    from '@/lib/models/ContactModel'
import { SkillModel }      from '@/lib/models/SkillModel'
import { ProjectModel }    from '@/lib/models/ProjectModel'
import { ExperienceModel } from '@/lib/models/ExperienceModel'

const BIO_FALLBACK = { name: 'Franca Uvere', headline: '', tagline: '', typedRole: '', location: '', availability: '', responseTime: '', photoUrl: null, resumeUrl: null }
const CONTACT_FALLBACK = { email: '', github: null, linkedin: null, instagram: null, whatsapp: null }
import GlobalBackground from '@/components/three/GlobalBackground'
import Hero from '@/components/home/Hero'
import Marquee from '@/components/home/Marquee'
import Skills from '@/components/home/Skills'
import Projects from '@/components/home/Projects'
import Experience from '@/components/home/Experience'
import Contact from '@/components/home/Contact'

export default async function Home() {
  const [bioRaw, contactRaw, skills, projects, experiences, marqueeItems] = await Promise.all([
    BioModel.get(),
    ContactModel.get(),
    SkillModel.findAll(),
    ProjectModel.findAll(),
    ExperienceModel.findAll(),
    SkillModel.findHighlightedItems(),
  ])
  const bio = bioRaw ?? BIO_FALLBACK
  const contact = contactRaw ?? CONTACT_FALLBACK

  return (
    <>
      <GlobalBackground />
      <main style={{ position: 'relative', zIndex: 1 }}>
        <Hero bio={bio} techBadges={marqueeItems} />
        <Marquee items={marqueeItems} />
        <Skills skills={skills} />
        <Projects projects={projects} />
        <Experience experiences={experiences} />
        <Contact bio={bio} contact={contact} />
      </main>
    </>
  )
}

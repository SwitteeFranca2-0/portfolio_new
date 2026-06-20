export const dynamic = 'force-dynamic'
import { DEMO_MODE } from '@/lib/demo'
import * as DemoData from '@/lib/data'
import { BioModel }           from '@/lib/models/BioModel'
import { ContactModel }       from '@/lib/models/ContactModel'
import { SkillModel }         from '@/lib/models/SkillModel'
import { ProjectModel }       from '@/lib/models/ProjectModel'
import { ExperienceModel }    from '@/lib/models/ExperienceModel'
import { EducationModel }     from '@/lib/models/EducationModel'
import { TestimonialModel }   from '@/lib/models/TestimonialModel'
import { CertificationModel } from '@/lib/models/CertificationModel'
import { ServiceModel }       from '@/lib/models/ServiceModel'
import { StatModel }          from '@/lib/models/StatModel'

const BIO_FALLBACK = { name: 'Franca Uvere', headline: '', tagline: '', typedRole: '', location: '', availability: '', responseTime: '', photoUrl: null, resumeUrl: null, backgroundStyle: 'laptop' }
const CONTACT_FALLBACK = { email: '', github: null, linkedin: null, instagram: null, whatsapp: null }
import GlobalBackground from '@/components/three/GlobalBackground'
import Hero from '@/components/home/Hero'
import Marquee from '@/components/home/Marquee'
import Stats from '@/components/home/Stats'
import Skills from '@/components/home/Skills'
import Services from '@/components/home/Services'
import Projects from '@/components/home/Projects'
import Experience from '@/components/home/Experience'
import Education from '@/components/home/Education'
import Certifications from '@/components/home/Certifications'
import Testimonials from '@/components/home/Testimonials'
import Contact from '@/components/home/Contact'

export default async function Home() {
  if (DEMO_MODE) {
    const bio = { ...DemoData.bio, backgroundStyle: 'particles' }
    const contact = DemoData.contact

    return (
      <>
        <GlobalBackground style={bio.backgroundStyle} />
        <main style={{ position: 'relative', zIndex: 1 }}>
          <Hero bio={bio} techBadges={DemoData.marqueeItems} />
          <Marquee items={DemoData.marqueeItems} />
          <Stats stats={[]} />
          <Skills skills={DemoData.skills} />
          <Services services={[]} />
          <Projects projects={DemoData.projects} />
          <Experience experiences={DemoData.experiences} />
          <Education education={[]} />
          <Certifications certifications={[]} />
          <Testimonials testimonials={[]} />
          <Contact bio={bio} contact={contact} />
        </main>
      </>
    )
  }

  const [
    bioRaw,
    contactRaw,
    skills,
    projects,
    experiences,
    marqueeItems,
    education,
    testimonials,
    certifications,
    services,
    stats,
  ] = await Promise.all([
    BioModel.get(),
    ContactModel.get(),
    SkillModel.findAll(),
    ProjectModel.findAll(),
    ExperienceModel.findAll(),
    SkillModel.findHighlightedItems(),
    EducationModel.findAll(),
    TestimonialModel.findFeatured(),
    CertificationModel.findAll(),
    ServiceModel.findAll(),
    StatModel.findAll(),
  ])
  const bio = bioRaw ?? BIO_FALLBACK
  const contact = contactRaw ?? CONTACT_FALLBACK

  return (
    <>
      <GlobalBackground style={bio.backgroundStyle ?? 'laptop'} />
      <main style={{ position: 'relative', zIndex: 1 }}>
        <Hero bio={bio} techBadges={marqueeItems} />
        <Marquee items={marqueeItems} />
        <Stats stats={stats} />
        <Skills skills={skills} />
        <Services services={services} />
        <Projects projects={projects} />
        <Experience experiences={experiences} />
        <Education education={education} />
        <Certifications certifications={certifications} />
        <Testimonials testimonials={testimonials} />
        <Contact bio={bio} contact={contact} />
      </main>
    </>
  )
}

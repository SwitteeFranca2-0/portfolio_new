export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import { ExperienceModel } from '@/lib/models/ExperienceModel'
import RichText from '@/components/ui/RichText'
import styles from './experience.module.css'

export const metadata: Metadata = {
  title: 'Experience',
  description: 'Full work history — roles, companies, and the technologies used along the way.',
}

export default async function ExperiencePage() {
  const experiences = await ExperienceModel.findAll()

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Background</p>
        <h1 className={styles.title}>WORK<br />EXPERIENCE</h1>
        <p className={styles.sub}>
          The full history — roles, companies, and what I built along the way.
        </p>
      </div>

      {experiences.length === 0 ? (
        <div className={styles.empty}>
          <p>No experience entries yet.</p>
        </div>
      ) : (
        <div className={styles.timeline}>
          {experiences.map((exp) => (
            <div key={exp.id} className={styles.item}>
              <div className={styles.left}>
                <p className={styles.period}>{exp.startDate} — {exp.endDate ?? 'Present'}</p>
                <p className={styles.company}>{exp.company}</p>
              </div>
              <div className={styles.right}>
                <h2 className={styles.role}>{exp.role.toUpperCase()}</h2>
                <RichText html={exp.description} className={styles.desc} />
                <div className={styles.tags}>
                  {exp.tags.map((tag) => (
                    <span key={tag.name} className={styles.tag}>{tag.name}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

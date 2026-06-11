import styles from './Experience.module.css'
import SectionHeader from '@/components/ui/SectionHeader'
import RichText from '@/components/ui/RichText'

type Experience = {
  id: number; company: string; role: string; startDate: string
  endDate?: string; description: string; order: number
  tags: { name: string }[]
}

export default function Experience({ experiences }: { experiences: Experience[] }) {
  return (
    <section id="experience" className={styles.section}>
      <SectionHeader eyebrow="03 — Background" title="EXPERIENCE" />
      <div className={styles.timeline}>
        {experiences.map((exp) => (
          <div key={exp.id} className={`${styles.item} reveal`}>
            <div className={styles.left}>
              <p className={styles.period}>{exp.startDate} — {exp.endDate ?? 'Present'}</p>
              <p className={styles.company}>{exp.company}</p>
            </div>
            <div className={styles.right}>
              <h3 className={styles.role}>{exp.role.toUpperCase()}</h3>
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
    </section>
  )
}

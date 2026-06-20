import SectionHeader from '@/components/ui/SectionHeader'
import styles from './Education.module.css'

type Edu = {
  id: number
  institution: string
  degree: string
  startDate: string
  endDate: string | null
  description: string | null
}

export default function Education({ education }: { education: Edu[] }) {
  if (!education.length) return null
  return (
    <section className={styles.section}>
      <SectionHeader eyebrow="Background" title="EDUCATION" />
      <div className={styles.list}>
        {education.map(e => (
          <div key={e.id} className={styles.item}>
            <div className={styles.left}>
              <p className={styles.period}>{e.startDate} — {e.endDate ?? 'Present'}</p>
              <p className={styles.institution}>{e.institution}</p>
            </div>
            <div className={styles.right}>
              <h3 className={styles.degree}>{e.degree}</h3>
              {e.description && <p className={styles.desc}>{e.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

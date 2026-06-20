export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import styles from './skills.module.css'

export const metadata: Metadata = {
  title: 'Skills',
  description: 'Technical skills, technologies, and expertise — frontend, backend, database, DevOps, and automation.',
}
import { SkillModel } from '@/lib/models/SkillModel'

const proficiencyLabel: Record<string, string> = {
  expert:     'Expert',
  proficient: 'Proficient',
  familiar:   'Familiar',
}

export default async function SkillsPage() {
  const skills = await SkillModel.findAll()
  return (
    <main className={styles.main}>
      {/* Header */}
      <div className={styles.header}>
        <p className={styles.eyebrow}>Capabilities</p>
        <h1 className={styles.title}>SKILLS &amp;<br />EXPERTISE</h1>
        <p className={styles.sub}>
          Technologies and disciplines I work with — from frontend interfaces to backend systems and automation workflows.
        </p>
      </div>

      {/* Stats row */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statNum}>{skills.length}</span>
          <span className={styles.statLabel}>Skill Areas</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum}>{skills.reduce((acc, s) => acc + s.items.length, 0)}+</span>
          <span className={styles.statLabel}>Technologies</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum}>{skills.filter(s => s.proficiency === 'expert').length}</span>
          <span className={styles.statLabel}>Expert Level</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum}>{Math.max(...skills.map(s => s.yearsExp ?? 0))}+</span>
          <span className={styles.statLabel}>Years Experience</span>
        </div>
      </div>

      {/* Skills grid */}
      <div className={styles.grid}>
        {skills.map((skill) => (
          <div key={skill.id} className={`${styles.card} ${styles[skill.proficiency]}`}>
            <div className={styles.cardHeader}>
              <span className={styles.icon}>{skill.icon}</span>
              <div className={styles.cardMeta}>
                <span className={`${styles.badge} ${styles[`badge_${skill.proficiency}`]}`}>
                  {proficiencyLabel[skill.proficiency]}
                </span>
                {skill.yearsExp && (
                  <span className={styles.years}>{skill.yearsExp} yr{skill.yearsExp !== 1 ? 's' : ''}</span>
                )}
              </div>
            </div>
            <h2 className={styles.cardTitle}>{skill.title}</h2>
            <p className={styles.cardDesc}>{skill.description}</p>
            <div className={styles.chips}>
              {skill.items.map((item) => (
                <span key={item.name} className={`${styles.chip} ${item.highlight ? styles.chipHi : ''}`}>
                  {item.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

import SectionHeader from '@/components/ui/SectionHeader'
import styles from './Certifications.module.css'

type Cert = {
  id: number
  name: string
  issuer: string
  date: string
  credentialUrl: string | null
}

export default function Certifications({ certifications }: { certifications: Cert[] }) {
  if (!certifications.length) return null
  return (
    <section className={styles.section}>
      <SectionHeader eyebrow="Credentials" title="CERTIFICATIONS" />
      <div className={styles.grid}>
        {certifications.map(c => (
          <div key={c.id} className={styles.card}>
            <div className={styles.top}>
              <span className={styles.name}>{c.name}</span>
              {c.credentialUrl && (
                <a
                  href={c.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  Verify ↗
                </a>
              )}
            </div>
            <div className={styles.meta}>
              <span className={styles.issuer}>{c.issuer}</span>
              <span className={styles.date}>{c.date}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

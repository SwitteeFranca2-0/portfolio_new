import SectionHeader from '@/components/ui/SectionHeader'
import styles from './Testimonials.module.css'

type Testimonial = { id: number; author: string; role: string; company: string; quote: string }

export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (!testimonials.length) return null
  return (
    <section className={styles.section}>
      <SectionHeader eyebrow="Kind Words" title="TESTIMONIALS" />
      <div className={styles.grid}>
        {testimonials.map(t => (
          <div key={t.id} className={styles.card}>
            <p className={styles.quote}>"{t.quote}"</p>
            <div className={styles.author}>
              <span className={styles.name}>{t.author}</span>
              <span className={styles.role}>{t.role} · {t.company}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

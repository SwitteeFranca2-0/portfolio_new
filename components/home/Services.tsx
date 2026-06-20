import SectionHeader from '@/components/ui/SectionHeader'
import styles from './Services.module.css'

type Service = { id: number; title: string; description: string; priceRange: string | null }

export default function Services({ services }: { services: Service[] }) {
  if (!services.length) return null
  return (
    <section className={styles.section}>
      <SectionHeader eyebrow="What I Offer" title="SERVICES" />
      <div className={styles.grid}>
        {services.map((s, i) => (
          <div key={s.id} className={styles.card}>
            <span className={styles.num}>0{i + 1}</span>
            <h3 className={styles.title}>{s.title}</h3>
            <p className={styles.desc}>{s.description}</p>
            {s.priceRange && <span className={styles.price}>{s.priceRange}</span>}
          </div>
        ))}
      </div>
    </section>
  )
}

import styles from './Stats.module.css'

type Stat = { id: number; label: string; value: string }

export default function Stats({ stats }: { stats: Stat[] }) {
  if (!stats.length) return null
  return (
    <div className={styles.wrap}>
      {stats.map(s => (
        <div key={s.id} className={styles.stat}>
          <div className={styles.value}>{s.value}</div>
          <div className={styles.label}>{s.label}</div>
        </div>
      ))}
    </div>
  )
}

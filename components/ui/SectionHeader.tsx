import styles from './SectionHeader.module.css'

interface Props {
  eyebrow: string
  title: string        // use \n for line breaks
  className?: string
}

export default function SectionHeader({ eyebrow, title, className }: Props) {
  const lines = title.split('\n')
  return (
    <div className={`${styles.header} reveal ${className ?? ''}`}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2 className={styles.title}>
        {lines.map((line, i) => (
          <span key={i}>{line}{i < lines.length - 1 && <br />}</span>
        ))}
      </h2>
    </div>
  )
}

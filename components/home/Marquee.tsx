import styles from './Marquee.module.css'

export default function Marquee({ items: marqueeItems }: { items: string[] }) {
  const items = [...marqueeItems, ...marqueeItems]
  return (
    <div className={styles.wrap}>
      <div className={styles.track}>
        {items.map((item, i) => (
          <span key={i} className={styles.item}>
            {item} <span>✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}

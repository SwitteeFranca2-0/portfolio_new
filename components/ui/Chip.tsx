import styles from './Chip.module.css'

interface Props {
  label: string
  highlight?: boolean
}

export default function Chip({ label, highlight = false }: Props) {
  return (
    <span className={`${styles.chip} ${highlight ? styles.hi : ''}`}>
      {label}
    </span>
  )
}

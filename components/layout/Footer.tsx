import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p><span className={styles.dot} />Available for work · Lagos, NG</p>
      <p>© {new Date().getFullYear()} Franca Uvere</p>
      <p>Full-Stack &amp; Backend Engineer</p>
    </footer>
  )
}

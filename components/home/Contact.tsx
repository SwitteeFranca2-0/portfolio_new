import styles from './Contact.module.css'

type Props = {
  bio: { location: string; availability: string; responseTime: string }
  contact: { email: string; github?: string | null; linkedin?: string | null; instagram?: string | null; whatsapp?: string | null }
}

export default function Contact({ bio, contact }: Props) {
  return (
    <section id="contact" className={styles.section}>
      <div className={`${styles.content} reveal`}>
        <p className={styles.eyebrow}>05 — Let&apos;s Talk</p>
        <h2 className={styles.headline}>
          GOT A<br /><span className={styles.outline}>PROJECT?</span>
        </h2>
        <p className={styles.sub}>
          Open to full-time roles and freelance collaborations. Let&apos;s build something together.
        </p>
        <a href={`mailto:${contact.email}`} className={styles.email}>
          {contact.email}
        </a>
        <div className={styles.details}>
          <div className={styles.detailItem}>
            <p className={styles.label}>Location</p>
            <p className={styles.val}>{bio.location}</p>
          </div>
          <div className={styles.detailItem}>
            <p className={styles.label}>Availability</p>
            <p className={styles.val}>{bio.availability}</p>
          </div>
          <div className={styles.detailItem}>
            <p className={styles.label}>Response</p>
            <p className={styles.val}>{bio.responseTime}</p>
          </div>
        </div>
        <div className={styles.socials}>
          {contact.github && (
            <a href={contact.github} className={styles.soc} target="_blank" rel="noopener noreferrer">GitHub</a>
          )}
          {contact.linkedin && (
            <a href={contact.linkedin} className={styles.soc} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          )}
          {contact.instagram && (
            <a href={contact.instagram} className={styles.soc} target="_blank" rel="noopener noreferrer">Instagram</a>
          )}
          {contact.whatsapp && (
            <a href={contact.whatsapp} className={styles.soc} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          )}
        </div>
      </div>
    </section>
  )
}

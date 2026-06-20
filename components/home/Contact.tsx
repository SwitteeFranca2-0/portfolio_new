'use client'
import { useState } from 'react'
import styles from './Contact.module.css'

type Props = {
  bio: { location: string; availability: string; responseTime: string }
  contact: { email: string; github?: string | null; linkedin?: string | null; instagram?: string | null; whatsapp?: string | null }
}

type SendState = 'idle' | 'sending' | 'sent'

export default function Contact({ bio, contact }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sendState, setSendState] = useState<SendState>('idle')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSendState('sending')
    setError('')
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, subject: 'Landing page enquiry', message }),
    })
    if (res.ok) {
      setSendState('sent')
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Something went wrong — please try again.')
      setSendState('idle')
    }
  }

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

        {sendState === 'sent' ? (
          <div className={styles.formSuccess}>
            <span>✓</span> Message sent — I&apos;ll be in touch.
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.formField}>
              <input
                className={styles.formInput}
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                aria-label="Name"
              />
            </div>
            <div className={styles.formField}>
              <input
                className={styles.formInput}
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Email"
              />
            </div>
            <div className={styles.formField}>
              <textarea
                className={styles.formTextarea}
                placeholder="Message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                aria-label="Message"
              />
            </div>
            {error && <p className={styles.formError}>{error}</p>}
            <button className={styles.formBtn} type="submit" disabled={sendState === 'sending'}>
              {sendState === 'sending' ? 'Sending...' : 'Send →'}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

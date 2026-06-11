'use client'
import Image from 'next/image'
import styles from './Hero.module.css'
import Typewriter from '@/components/ui/Typewriter'
import RichText from '@/components/ui/RichText'

type BioProps = {
  name: string
  headline: string
  tagline: string
  typedRole: string
  location: string
  availability: string
  responseTime: string
  photoUrl?: string | null
  resumeUrl?: string | null
}

export default function Hero({ bio, techBadges }: { bio: BioProps; techBadges: string[] }) {
  const [firstName, ...rest] = bio.name.split(' ')
  const lastName = rest.join(' ')
  const initials = bio.name.split(' ').map((n) => n[0]).join('')

  return (
    <div id="hero" className={styles.hero}>
      <div className={styles.content}>

        {/* ── Left: text ── */}
        <div className={styles.left}>
          <div className={styles.tag}>
            <Typewriter text={bio.typedRole} startDelay={400} />
          </div>
          <h1 className={styles.title}>
            <span>{firstName}</span><br />
            <span className={styles.colored}>{lastName}</span>
          </h1>
          <RichText html={bio.tagline} className={styles.sub} />

          <div className={styles.badges}>
            {techBadges.map((badge) => (
              <span key={badge} className={styles.badge}>{badge}</span>
            ))}
          </div>

          <div className={styles.actions}>
            <a href="#projects" className={styles.btnGlow}>View Projects</a>
            <a href="#contact" className={styles.btnGhost}>Get In Touch</a>
          </div>
        </div>

        {/* ── Right: photo ── */}
        <div className={styles.right}>
          <div className={styles.photoWrap}>
            {bio.photoUrl ? (
              <Image
                src={bio.photoUrl}
                alt={bio.name}
                fill
                className={styles.photo}
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div className={styles.photoPlaceholder}>
                <span className={styles.initials}>{initials}</span>
              </div>
            )}
            <div className={styles.photoGlow} />
          </div>
        </div>

      </div>
      <div className={styles.scrollHint}>Scroll</div>
    </div>
  )
}

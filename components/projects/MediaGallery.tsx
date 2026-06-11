'use client'
import { useState } from 'react'
import Image from 'next/image'
type ProjectMedia = { type: 'image' | 'video'; url: string; caption?: string }
import styles from './MediaGallery.module.css'

export default function MediaGallery({ media }: { media: ProjectMedia[] }) {
  const [active, setActive] = useState(0)

  if (!media.length) return null

  const current = media[active]
  const prev = () => setActive((i) => (i - 1 + media.length) % media.length)
  const next = () => setActive((i) => (i + 1) % media.length)

  return (
    <div className={styles.gallery}>
      {/* ── Main viewer ── */}
      <div className={styles.main}>
        {current.type === 'video' ? (
          <iframe
            src={current.url}
            className={styles.video}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <Image
            src={current.url}
            alt={current.caption ?? 'Project screenshot'}
            fill
            className={styles.image}
            sizes="(max-width: 900px) 100vw, 860px"
          />
        )}

        {/* Nav arrows — only show if more than one item */}
        {media.length > 1 && (
          <>
            <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={prev} aria-label="Previous">‹</button>
            <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={next} aria-label="Next">›</button>
          </>
        )}

        {/* Counter */}
        <div className={styles.counter}>{active + 1} / {media.length}</div>
      </div>

      {/* ── Caption ── */}
      {current.caption && (
        <p className={styles.caption}>{current.caption}</p>
      )}

      {/* ── Thumbnail strip ── */}
      {media.length > 1 && (
        <div className={styles.thumbs}>
          {media.map((item, i) => (
            <button
              key={i}
              className={`${styles.thumb} ${i === active ? styles.thumbActive : ''}`}
              onClick={() => setActive(i)}
              aria-label={`View ${item.caption ?? `media ${i + 1}`}`}
            >
              {item.type === 'video' ? (
                <div className={styles.thumbVideo}>
                  <span className={styles.playIcon}>▶</span>
                </div>
              ) : (
                <Image
                  src={item.url}
                  alt={item.caption ?? `Thumbnail ${i + 1}`}
                  fill
                  className={styles.thumbImg}
                  sizes="120px"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

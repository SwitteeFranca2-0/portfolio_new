import Image from 'next/image'
import Link from 'next/link'
import styles from './Projects.module.css'
import SectionHeader from '@/components/ui/SectionHeader'
import Chip from '@/components/ui/Chip'

type Project = {
  id: number; slug: string; title: string; type: string; year: number
  description: string; outcome?: string; imageUrl?: string; liveUrl?: string
  featured: boolean; order: number; stack: string[]
}

export default function Projects({ projects }: { projects: Project[] }) {
  // One sticky project (featured: true) gets the big display — only one allowed.
  // The 3 most-ordered non-featured projects fill the grid below (4 total on landing).
  const featured = projects.find((p) => p.featured)
  const grid = projects.filter((p) => !p.featured).slice(0, 3)

  return (
    <section id="projects" className={styles.section}>
      <SectionHeader eyebrow="02 — Work" title={'SELECTED\nPROJECTS'} />

      {featured && (
        <div className={`${styles.featured} reveal`}>
          <div className={styles.imgWrap}>
            {featured.imageUrl ? (
              <Image
                src={featured.imageUrl}
                alt={featured.title}
                fill
                className={styles.img}
              />
            ) : (
              <div className={styles.imgFallback} />
            )}
            <div className={styles.imgOverlay} />
          </div>
          <div className={styles.body}>
            <div>
              <p className={styles.type}>{featured.type} · {featured.year}</p>
              <h3 className={styles.title}>{featured.title.toUpperCase()}</h3>
              <p className={styles.desc}>{featured.description}</p>
              {featured.outcome && <p className={styles.outcome}>{featured.outcome}</p>}
            </div>
            <div className={styles.footer}>
              <div className={styles.stack}>
                {featured.stack.map((s) => <Chip key={s} label={s} />)}
              </div>
              <Link href={`/projects/${featured.slug}`} className={styles.link}>
                Case Study ↗
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className={styles.grid}>
        {grid.map((project) => (
          <div key={project.id} className={`${styles.card} reveal`}>
            <p className={styles.type}>{project.type} · {project.year}</p>
            <h3 className={styles.cardTitle}>{project.title.toUpperCase()}</h3>
            <p className={styles.desc}>{project.description}</p>
            <div className={styles.cardFooter}>
              <div className={styles.stack}>
                {project.stack.map((s) => <Chip key={s} label={s} />)}
              </div>
              <Link href={`/projects/${project.slug}`} className={styles.link}>
                Details ↗
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.viewAll}>
        <Link href="/projects" className={styles.viewAllLink}>
          View all projects ↗
        </Link>
      </div>
    </section>
  )
}

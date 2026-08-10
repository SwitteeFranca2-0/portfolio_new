'use client'
import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Chip from '@/components/ui/Chip'
import styles from './projects.module.css'

type Project = {
  id: number
  slug: string
  title: string
  type: string
  category: string
  year: number
  description: string
  imageUrl?: string
  stack: string[]
}

type Category = {
  id: string
  label: string
  order: number
}

type Props = {
  projects: Project[]
  categories: Category[]
}

const PAGE_SIZE = 9

export default function ProjectsClient({ projects, categories }: Props) {
  const [active, setActive] = useState<string>('all')
  const [page, setPage] = useState(1)

  const filtered = active === 'all'
    ? projects
    : projects.filter((p) => p.category === active)

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  )

  function selectCategory(id: string) {
    setActive(id)
    setPage(1)
  }

  return (
    <main className={styles.main}>
      {/* Header */}
      <div className={styles.header}>
        <p className={styles.eyebrow}>Work</p>
        <h1 className={styles.title}>ALL PROJECTS</h1>
        <p className={styles.sub}>A full collection of things I&apos;ve built — client work, personal projects, and experiments.</p>
      </div>

      {/* Category tabs */}
      <div className={styles.tabs}>
        {categories.map((cat) => {
          const count = cat.id === 'all' ? projects.length : projects.filter(p => p.category === cat.id).length
          return (
            <button
              key={cat.id}
              className={`${styles.tab} ${active === cat.id ? styles.tabActive : ''}`}
              onClick={() => selectCategory(cat.id)}
            >
              {cat.label}
              <span className={styles.tabCount}>{count}</span>
            </button>
          )
        })}
      </div>

      {/* Project grid */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <p>No projects in this category yet.</p>
          <p className={styles.emptyHint}>Check back soon — this section will be updated via the admin dashboard.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {paged.map((project) => (
            <Link key={project.id} href={`/projects/${project.slug}`} className={styles.card}>
              <div className={styles.cardImg}>
                {project.imageUrl ? (
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    fill
                    className={styles.img}
                    sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 400px"
                  />
                ) : (
                  <div className={styles.imgFallback}>
                    <span className={styles.imgFallbackText}>{project.title[0]}</span>
                  </div>
                )}
                <div className={styles.cardOverlay} />
                <span className={styles.cardYear}>{project.year}</span>
              </div>
              <div className={styles.cardBody}>
                <p className={styles.cardType}>{project.type}</p>
                <h2 className={styles.cardTitle}>{project.title.toUpperCase()}</h2>
                <p className={styles.cardDesc}>{project.description}</p>
                <div className={styles.cardFooter}>
                  <div className={styles.cardStack}>
                    {project.stack.slice(0, 3).map((s) => <Chip key={s} label={s} />)}
                    {project.stack.length > 3 && <Chip label={`+${project.stack.length - 3}`} />}
                  </div>
                  <span className={styles.cardArrow}>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {pageCount > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Prev
          </button>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              className={`${styles.pageBtn} ${page === n ? styles.pageBtnActive : ''}`}
              onClick={() => setPage(n)}
            >
              {n}
            </button>
          ))}
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={page === pageCount}
          >
            Next →
          </button>
        </div>
      )}
    </main>
  )
}

export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ProjectModel } from '@/lib/models/ProjectModel'
import Chip from '@/components/ui/Chip'
import MediaGallery from '@/components/projects/MediaGallery'
import styles from './page.module.css'
import RichText from '@/components/ui/RichText'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = await ProjectModel.findBySlug(slug)
  if (!project) return {}
  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: `${project.title} | Franca Uvere`,
      description: project.description,
      images: project.imageUrl
        ? [{ url: project.imageUrl, width: 1200, height: 630 }]
        : [{ url: '/api/og?title=' + encodeURIComponent(project.title) }],
    },
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params
  const project = await ProjectModel.findBySlug(slug)
  if (!project) notFound()

  const allProjects = await ProjectModel.findAll()
  const others = allProjects.filter((p) => p.slug !== slug).slice(0, 2)

  return (
    <main className={styles.main}>

      {/* ── Full-width hero image ── */}
      <div className={styles.hero}>
        {project.imageUrl ? (
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            className={styles.heroImg}
            sizes="100vw"
            priority
          />
        ) : (
          <div className={styles.heroFallback} />
        )}
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <Link href="/projects" className={styles.back}>← All Projects</Link>
          <p className={styles.heroType}>{project.type} · {project.year}</p>
          <h1 className={styles.heroTitle}>{project.title.toUpperCase()}</h1>
        </div>
      </div>

      {/* ── Body ── */}
      <div className={styles.body}>

        {/* Meta bar */}
        <div className={styles.metaBar}>
          <div className={styles.stack}>
            {project.stack.map((s) => <Chip key={s} label={s} highlight />)}
          </div>
          <div className={styles.actions}>
            {project.liveUrl && (
              <a href={project.liveUrl} className={styles.btnPrimary} target="_blank" rel="noopener noreferrer">
                View Live ↗
              </a>
            )}
            {project.repoUrl && (
              <a href={project.repoUrl} className={styles.btnOutline} target="_blank" rel="noopener noreferrer">
                Source ↗
              </a>
            )}
          </div>
        </div>

        {/* Two-column: overview + sidebar */}
        <div className={styles.cols}>
          <div className={styles.colMain}>
            {project.outcome && (
              <p className={styles.outcome}>{project.outcome}</p>
            )}
            {project.automation && (
              <div className={styles.automationCard}>
                <p className={styles.automationTitle}>AUTOMATION DETAILS</p>
                <div className={styles.automationGrid}>
                  <div className={styles.automationItem}>
                    <span className={styles.automationLabel}>Tool</span>
                    <span className={styles.automationVal}>{project.automation.tool}</span>
                  </div>
                  <div className={styles.automationItem}>
                    <span className={styles.automationLabel}>Trigger</span>
                    <span className={styles.automationVal}>{project.automation.trigger}</span>
                  </div>
                  {project.automation.workflowNodes && (
                    <div className={styles.automationItem}>
                      <span className={styles.automationLabel}>Nodes</span>
                      <span className={styles.automationVal}>{project.automation.workflowNodes}</span>
                    </div>
                  )}
                  {project.automation.timeSaved && (
                    <div className={styles.automationItem}>
                      <span className={styles.automationLabel}>Time Saved</span>
                      <span className={styles.automationVal}>{project.automation.timeSaved}</span>
                    </div>
                  )}
                  <div className={styles.automationItem}>
                    <span className={styles.automationLabel}>Status</span>
                    <span className={`${styles.statusBadge} ${styles[`status_${project.automation.status.replace('-', '_')}`]}`}>
                      {project.automation.status}
                    </span>
                  </div>
                </div>
                <div className={styles.automationItem} style={{marginTop: '1rem'}}>
                  <span className={styles.automationLabel}>Integrations</span>
                  <div className={styles.integrationChips}>
                    {project.automation.integrations.map((i) => (
                      <span key={i} className={styles.integrationChip}>{i}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <RichText html={project.body ?? project.description} className={styles.overview} />
          </div>
          <aside className={styles.sidebar}>
            <div className={styles.sideItem}>
              <p className={styles.sideLabel}>Category</p>
              <p className={styles.sideVal}>{project.type}</p>
            </div>
            <div className={styles.sideItem}>
              <p className={styles.sideLabel}>Year</p>
              <p className={styles.sideVal}>{project.year}</p>
            </div>
            <div className={styles.sideItem}>
              <p className={styles.sideLabel}>Stack</p>
              <div className={styles.sideStack}>
                {project.stack.map((s) => <span key={s} className={styles.sideChip}>{s}</span>)}
              </div>
            </div>
          </aside>
        </div>

        {/* Key features */}
        {project.features && project.features.length > 0 && (
          <div className={styles.features}>
            <h2 className={styles.sectionTitle}>KEY FEATURES</h2>
            <ul className={styles.featureList}>
              {project.features.map((f) => (
                <li key={f} className={styles.featureItem}>
                  <span className={styles.featureDot} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Media gallery */}
        {project.media.length > 0 && (
          <div className={styles.galleryWrap}>
            <h2 className={styles.sectionTitle}>GALLERY</h2>
            <MediaGallery media={project.media} />
          </div>
        )}

        {/* More projects */}
        {others.length > 0 && (
          <div className={styles.moreWrap}>
            <h2 className={styles.sectionTitle}>MORE PROJECTS</h2>
            <div className={styles.moreGrid}>
              {others.map((p) => (
                <Link key={p.id} href={`/projects/${p.slug}`} className={styles.moreCard}>
                  <div className={styles.moreImg}>
                    {p.imageUrl ? (
                      <Image src={p.imageUrl} alt={p.title} fill className={styles.moreImgEl} sizes="400px" />
                    ) : (
                      <div className={styles.moreImgFallback} />
                    )}
                    <div className={styles.moreOverlay} />
                  </div>
                  <div className={styles.moreBody}>
                    <p className={styles.moreType}>{p.type} · {p.year}</p>
                    <h3 className={styles.moreTitle}>{p.title.toUpperCase()}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}

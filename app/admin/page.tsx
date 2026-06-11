import { ProjectModel }    from '@/lib/models/ProjectModel'
import { SkillModel }      from '@/lib/models/SkillModel'
import { ExperienceModel } from '@/lib/models/ExperienceModel'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const [projectCount, skillCount, expCount, recentProjects] = await Promise.all([
    ProjectModel.count(),
    SkillModel.count(),
    ExperienceModel.count(),
    ProjectModel.findRecent(5),
  ])

  return (
    <div>
      {/* Header */}
      <div className="ar-ph">
        <div>
          <div className="ar-eyebrow">Overview</div>
          <div className="ar-title">DASHBOARD</div>
          <div className="ar-sub">Portfolio content at a glance</div>
        </div>
        <Link href="/" target="_blank" className="ar-btn ar-btn-o" style={{ fontSize: '.7rem' }}>
          View live site ↗
        </Link>
      </div>

      {/* Stats */}
      <div className="ar-stats">
        <div className="ar-stat">
          <div className="ar-stat-n">{projectCount}</div>
          <div className="ar-stat-l">Projects</div>
        </div>
        <div className="ar-stat">
          <div className="ar-stat-n">{skillCount}</div>
          <div className="ar-stat-l">Skill Areas</div>
        </div>
        <div className="ar-stat">
          <div className="ar-stat-n">{expCount}</div>
          <div className="ar-stat-l">Experience</div>
        </div>
        <div className="ar-stat">
          <div className="ar-stat-n" style={{ color: 'var(--adm-accent)' }}>1</div>
          <div className="ar-stat-l">Sticky Project</div>
        </div>
      </div>

      {/* Recent projects — full width */}
      <div className="ar-card">
        <div className="ar-card-t">Recent Projects</div>
        <div className="ar-tw" style={{ borderRadius: 8, marginBottom: '1.25rem' }}>
          <table className="ar-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Category</th>
                <th>Year</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recentProjects.map(p => (
                <tr key={p.id}>
                  <td>
                    <span style={{ fontWeight: 500 }}>{p.title}</span>
                    {p.featured && (
                      <span className="ar-badge ar-ba-t" style={{ marginLeft: '.6rem' }}>Sticky</span>
                    )}
                  </td>
                  <td>
                    <span className="ar-badge ar-ba-g">{p.categoryId}</span>
                  </td>
                  <td style={{ fontFamily: "'DM Mono', monospace", fontSize: '.7rem', color: 'var(--adm-text-3)' }}>
                    {new Date(p.createdAt).getFullYear()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link href={`/admin/projects/${p.id}`}
                      style={{ color: 'var(--adm-accent)', fontSize: '.7rem', textDecoration: 'none', fontFamily: "'DM Mono', monospace", letterSpacing: '.06em' }}>
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', gap: '.75rem' }}>
          <Link href="/admin/projects" className="ar-btn ar-btn-o" style={{ fontSize: '.7rem' }}>
            All Projects
          </Link>
          <Link href="/admin/projects/new" className="ar-btn ar-btn-p" style={{ fontSize: '.7rem' }}>
            + New Project
          </Link>
        </div>
      </div>
    </div>
  )
}

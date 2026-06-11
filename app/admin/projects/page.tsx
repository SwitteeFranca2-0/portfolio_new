import { ProjectModel } from '@/lib/models/ProjectModel'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminProjectsPage() {
  const projects = await ProjectModel.findAll()

  return (
    <div>
      <div className="ar-ph">
        <div>
          <div className="ar-title">Projects</div>
          <div className="ar-sub">All projects. Only one can be sticky (featured on landing page).</div>
        </div>
        <Link href="/admin/projects/new">
          <button className="ar-btn ar-btn-p">+ New Project</button>
        </Link>
      </div>

      <div className="ar-card">
        <table className="ar-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Category</th>
              <th>Year</th>
              <th>Stack</th>
              <th>Sticky</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {projects.map(p => (
              <tr key={p.id}>
                <td style={{ fontFamily: "'DM Mono', monospace", fontSize: '.7rem', color: '#6b6880' }}>{p.order + 1}</td>
                <td style={{ fontWeight: 500 }}>{p.title}</td>
                <td><span className="ar-badge ar-ba-g">{p.category}</span></td>
                <td style={{ fontFamily: "'DM Mono', monospace", fontSize: '.7rem', color: '#6b6880' }}>{p.year}</td>
                <td style={{ fontSize: '.72rem', color: '#6b6880' }}>{p.stack.join(', ')}</td>
                <td>{p.featured && <span className="ar-badge ar-ba-t">Sticky</span>}</td>
                <td>
                  <Link href={`/admin/projects/${p.id}`} style={{ color: '#3ECFCF', fontSize: '.72rem', textDecoration: 'none' }}>Edit →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

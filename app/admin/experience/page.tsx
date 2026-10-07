import { ExperienceModel } from '@/lib/models/ExperienceModel'
import Link from 'next/link'
import VisibilityToggle from '@/components/admin/VisibilityToggle'

export const dynamic = 'force-dynamic'

export default async function AdminExperiencePage() {
  const experiences = await ExperienceModel.findAll({ includeHidden: true })

  return (
    <div>
      <div className="ar-ph">
        <div>
          <div className="ar-title">Experience</div>
          <div className="ar-sub">Full work history — up to 3 entries can also show on the homepage</div>
        </div>
        <Link href="/admin/experience/new">
          <button className="ar-btn ar-btn-p">+ New Experience</button>
        </Link>
      </div>

      <div className="ar-card">
        {experiences.length === 0 ? (
          <div className="ar-empty">No experience entries yet.</div>
        ) : (
          <table className="ar-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Company</th>
                <th>Period</th>
                <th>Tags</th>
                <th>Homepage</th>
                <th>Visible</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {experiences.map(exp => (
                <tr key={exp.id}>
                  <td style={{ fontWeight: 500 }}>{exp.role}</td>
                  <td>{exp.company}</td>
                  <td style={{ fontFamily: "'DM Mono', monospace", fontSize: '.7rem', color: '#6b6880' }}>
                    {exp.startDate} — {exp.endDate ?? 'Present'}
                  </td>
                  <td style={{ fontSize: '.72rem', color: '#6b6880' }}>
                    {exp.tags.map(t => t.name).join(', ')}
                  </td>
                  <td>{exp.showOnHomepage && <span className="ar-badge ar-ba-t">Homepage</span>}</td>
                  <td><VisibilityToggle endpoint={`/api/admin/experience/${exp.id}`} hidden={exp.hidden} /></td>
                  <td>
                    <Link
                      href={`/admin/experience/${exp.id}`}
                      style={{ color: '#3ECFCF', fontSize: '.72rem', textDecoration: 'none' }}
                    >
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

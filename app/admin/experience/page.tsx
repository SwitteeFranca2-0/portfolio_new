import { ExperienceModel } from '@/lib/models/ExperienceModel'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminExperiencePage() {
  const experiences = await ExperienceModel.findAll()

  return (
    <div>
      <div className="ar-ph">
        <div>
          <div className="ar-title">Experience</div>
          <div className="ar-sub">Work history displayed on the landing page</div>
        </div>
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

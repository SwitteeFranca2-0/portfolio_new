import { SkillModel } from '@/lib/models/SkillModel'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const iconClass: Record<string, string> = {
  'Frontend':         'ar-ic-fe',
  'Backend':          'ar-ic-be',
  'Database':         'ar-ic-db',
  'DevOps & Tools':   'ar-ic-dv',
  'CMS & E-Commerce': 'ar-ic-cm',
  'Architecture':     'ar-ic-ar',
}

const proficiencyBadge: Record<string, string> = {
  expert:     'ar-ba-t',
  proficient: 'ar-ba-b',
  familiar:   'ar-ba-g',
}

export default async function AdminSkillsPage() {
  const skills = await SkillModel.findAll()

  const expertCount     = skills.filter(s => s.proficiency === 'expert').length
  const proficientCount = skills.filter(s => s.proficiency === 'proficient').length
  const totalItems      = skills.reduce((sum, s) => sum + s.items.length, 0)

  return (
    <div>
      <div className="ar-ph">
        <div>
          <div className="ar-eyebrow">Content / Skills</div>
          <div className="ar-title">SKILLS</div>
          <div className="ar-sub">Technical skill categories and individual technologies</div>
        </div>
      </div>

      <div className="ar-stats">
        <div className="ar-stat">
          <div className="ar-stat-n">{skills.length}</div>
          <div className="ar-stat-l">Categories</div>
        </div>
        <div className="ar-stat">
          <div className="ar-stat-n">{totalItems}</div>
          <div className="ar-stat-l">Technologies</div>
        </div>
        <div className="ar-stat">
          <div className="ar-stat-n" style={{ color: 'var(--adm-expert)' }}>{expertCount}</div>
          <div className="ar-stat-l">Expert Level</div>
        </div>
        <div className="ar-stat">
          <div className="ar-stat-n" style={{ color: 'var(--adm-proficient)' }}>{proficientCount}</div>
          <div className="ar-stat-l">Proficient</div>
        </div>
      </div>

      <div className="ar-tw">
        <table className="ar-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Proficiency</th>
              <th>Highlighted Technologies</th>
              <th>Items</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {skills.map(skill => {
              const highlighted = skill.items.filter(i => i.highlight)
              const rest        = skill.items.length - highlighted.length
              return (
                <tr key={skill.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div className={`ar-icon-cell ${iconClass[skill.title] ?? 'ar-ic-df'}`}>
                        {skill.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '.875rem', marginBottom: 2 }}>{skill.title}</div>
                        <div style={{ fontSize: '.72rem', color: 'var(--adm-text-3)', fontWeight: 300 }}>
                          {skill.description.length > 48 ? skill.description.slice(0, 48) + '…' : skill.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`ar-badge ${proficiencyBadge[skill.proficiency] ?? 'ar-ba-g'}`}>
                      {skill.proficiency}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {highlighted.slice(0, 3).map(i => (
                        <span key={i.name} className="ar-tag">{i.name}</span>
                      ))}
                      {rest > 0 && <span className="ar-more">+{rest}</span>}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', color: 'var(--adm-text-2)', letterSpacing: '.04em' }}>
                      {skill.items.length}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link
                      href={`/admin/skills/${skill.id}`}
                      style={{ color: 'var(--adm-accent)', fontSize: '.7rem', textDecoration: 'none', fontFamily: "'DM Mono', monospace", letterSpacing: '.06em' }}
                    >
                      Edit →
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

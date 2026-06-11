'use client'
import { useEffect } from 'react'
import styles from './Skills.module.css'
import SectionHeader from '@/components/ui/SectionHeader'
import Chip from '@/components/ui/Chip'

type SkillItem = { name: string; highlight: boolean }
type Skill = {
  id: number; icon: string; title: string; description: string
  proficiency: string; yearsExp?: number; items: SkillItem[]
}

export default function Skills({ skills }: { skills: Skill[] }) {
  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>(`.${styles.card}`)
    cards.forEach((card) => {
      const onMove = (e: MouseEvent) => {
        const r = card.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width - .5
        const y = (e.clientY - r.top) / r.height - .5
        card.style.transform = `perspective(800px) rotateY(${x * 16}deg) rotateX(${-y * 10}deg) scale(1.02)`
        card.style.setProperty('--mx', (x + .5) * 100 + '%')
        card.style.setProperty('--my', (y + .5) * 100 + '%')
      }
      const onLeave = () => {
        card.style.transform = 'perspective(800px) rotateY(0) rotateX(0) scale(1)'
      }
      card.addEventListener('mousemove', onMove)
      card.addEventListener('mouseleave', onLeave)
    })
  }, [])

  return (
    <section id="skills" className={styles.section}>
      <SectionHeader eyebrow="01 — What I Do" title={'TECHNICAL\nSKILLS'} />
      <div className={styles.grid}>
        {skills.map((skill) => (
          <div key={skill.id} className={`${styles.card} reveal`}>
            <span className={styles.num}>0{skill.id}</span>
            <div className={styles.icon}>{skill.icon}</div>
            <h3 className={styles.title}>{skill.title}</h3>
            <p className={styles.desc}>{skill.description}</p>
            <div className={styles.chips}>
              {skill.items.map((item) => (
                <Chip key={item.name} label={item.name} highlight={item.highlight} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

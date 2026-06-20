'use client'
import dynamic from 'next/dynamic'

const HeroSceneLaptop    = dynamic(() => import('./HeroSceneLaptop'),    { ssr: false })
const HeroSceneParticles = dynamic(() => import('./HeroSceneParticles'), { ssr: false })

export default function GlobalBackground({ style = 'laptop' }: { style?: string }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      {style === 'particles' ? <HeroSceneParticles /> : <HeroSceneLaptop />}
    </div>
  )
}

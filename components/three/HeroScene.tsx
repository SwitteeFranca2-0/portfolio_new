'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// ── Section scroll states ───────────────────────────────────────────────────
// Each state defines the visual atmosphere for one section of the page.
// The scene lerps smoothly between them as you scroll.

type SceneState = {
  fogDensity: number
  pl1Color: number; pl1Intensity: number
  pl2Color: number; pl2Intensity: number
  pl3Color: number; pl3Intensity: number
  geoOpacity: number
  geoSpeed: number        // multiplier on rotation speed
  ringOpacity1: number
  ringOpacity2: number
  particleOpacity: number
  particleSpeed: number   // multiplier on rotation speed
}

const STATES: SceneState[] = [
  // 0 — Hero: teal-dominant, full energy
  { fogDensity: 0.018, pl1Color: 0x3ecfcf, pl1Intensity: 3,   pl2Color: 0x7b5ea7, pl2Intensity: 2.5, pl3Color: 0xe85d75, pl3Intensity: 2,   geoOpacity: 0.5,  geoSpeed: 1,    ringOpacity1: 0.25, ringOpacity2: 0.15, particleOpacity: 0.7,  particleSpeed: 1   },
  // 1 — Skills: purple-dominant, calmer, geometries dim
  { fogDensity: 0.012, pl1Color: 0x9966ff, pl1Intensity: 4,   pl2Color: 0x3ecfcf, pl2Intensity: 1.5, pl3Color: 0x5544bb, pl3Intensity: 2,   geoOpacity: 0.25, geoSpeed: 0.5,  ringOpacity1: 0.12, ringOpacity2: 0.08, particleOpacity: 0.45, particleSpeed: 0.6 },
  // 2 — Projects: pink/red punch, high contrast, energetic
  { fogDensity: 0.024, pl1Color: 0xe85d75, pl1Intensity: 5,   pl2Color: 0xff9944, pl2Intensity: 3,   pl3Color: 0x7b5ea7, pl3Intensity: 2.5, geoOpacity: 0.6,  geoSpeed: 1.6,  ringOpacity1: 0.35, ringOpacity2: 0.22, particleOpacity: 0.65, particleSpeed: 1.4 },
  // 3 — Experience: cool blue-grey, minimal, structured
  { fogDensity: 0.008, pl1Color: 0x4499cc, pl1Intensity: 2,   pl2Color: 0x336688, pl2Intensity: 1.5, pl3Color: 0x7b9aaa, pl3Intensity: 1.2, geoOpacity: 0.15, geoSpeed: 0.3,  ringOpacity1: 0.05, ringOpacity2: 0.04, particleOpacity: 0.25, particleSpeed: 0.4 },
  // 4 — Contact: teal + pink, helix energy builds
  { fogDensity: 0.018, pl1Color: 0x3ecfcf, pl1Intensity: 4.5, pl2Color: 0xe85d75, pl2Intensity: 3.5, pl3Color: 0x7b5ea7, pl3Intensity: 2,   geoOpacity: 0.35, geoSpeed: 0.8,  ringOpacity1: 0.4,  ringOpacity2: 0.3,  particleOpacity: 0.55, particleSpeed: 0.7 },
]

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

function lerpColor(ca: number, cb: number, t: number): THREE.Color {
  const a = new THREE.Color(ca), b = new THREE.Color(cb)
  return new THREE.Color(lerp(a.r, b.r, t), lerp(a.g, b.g, t), lerp(a.b, b.b, t))
}

function getScrollState(): { stateA: SceneState; stateB: SceneState; t: number } {
  const scrollY = window.scrollY
  const pageH = document.body.scrollHeight - window.innerHeight
  const progress = pageH > 0 ? Math.min(scrollY / pageH, 1) : 0

  // Divide the page into (STATES.length - 1) equal bands
  const bands = STATES.length - 1
  const band = Math.min(Math.floor(progress * bands), bands - 1)
  const t = (progress * bands) - band

  return { stateA: STATES[band], stateB: STATES[band + 1] ?? STATES[band], t }
}

// ── Component ───────────────────────────────────────────────────────────────

export default function HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight)
    renderer.setClearColor(0x060608, 1)

    const scene = new THREE.Scene()
    const fog = new THREE.FogExp2(0x060608, 0.018)
    scene.fog = fog

    const camera = new THREE.PerspectiveCamera(60, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000)
    camera.position.set(0, 0, 18)

    scene.add(new THREE.AmbientLight(0xffffff, 0.12))
    const pl1 = new THREE.PointLight(0x3ecfcf, 3, 35); pl1.position.set(8, 6, 6); scene.add(pl1)
    const pl2 = new THREE.PointLight(0x7b5ea7, 2.5, 28); pl2.position.set(-8, -4, 4); scene.add(pl2)
    const pl3 = new THREE.PointLight(0xe85d75, 2, 22); pl3.position.set(0, 8, -5); scene.add(pl3)

    // ── Particles ──
    const count = 2200
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const baseCols = [new THREE.Color(0x3ecfcf), new THREE.Color(0x7b5ea7), new THREE.Color(0xe85d75), new THREE.Color(0xffffff)]
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - .5) * 60
      pos[i * 3 + 1] = (Math.random() - .5) * 60
      pos[i * 3 + 2] = (Math.random() - .5) * 40
      const c = baseCols[Math.floor(Math.random() * baseCols.length)]
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b
    }
    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    pGeo.setAttribute('color', new THREE.BufferAttribute(col, 3))
    const pMat = new THREE.PointsMaterial({ size: .08, vertexColors: true, transparent: true, opacity: .7, sizeAttenuation: true })
    const particles = new THREE.Points(pGeo, pMat)
    scene.add(particles)

    // ── Floating wireframe geometries ──
    type MeshData = { rx: number; ry: number; floatSpeed: number; floatOffset: number; baseY: number; baseOpacity: number }
    const meshes: THREE.Mesh[] = []
    const meshData: MeshData[] = []
    const geoList = [
      new THREE.IcosahedronGeometry(1.4, 1), new THREE.OctahedronGeometry(1.1, 0),
      new THREE.TetrahedronGeometry(1.0, 0), new THREE.IcosahedronGeometry(.9, 0),
      new THREE.OctahedronGeometry(.7, 0),   new THREE.IcosahedronGeometry(.6, 1),
      new THREE.TetrahedronGeometry(.8, 0),  new THREE.OctahedronGeometry(1.3, 0),
    ]
    const matColors = [0x3ecfcf, 0x7b5ea7, 0xe85d75, 0x3ecfcf, 0x7b5ea7, 0xe85d75, 0x3ecfcf, 0xe85d75]
    const pos3d: [number, number, number][] = [
      [5,2,-4], [-6,3,-6], [4,-4,-3], [-4,-2,-5],
      [7,-3,-8], [-7,5,-7], [3,6,-5],  [-3,-6,-6],
    ]
    geoList.forEach((geo, i) => {
      const baseOpacity = .3 + Math.random() * .25
      const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
        color: matColors[i], wireframe: true, transparent: true, opacity: baseOpacity,
      }))
      mesh.position.set(...pos3d[i])
      meshData.push({
        rx: (.002 + Math.random() * .004) * (Math.random() > .5 ? 1 : -1),
        ry: (.002 + Math.random() * .005) * (Math.random() > .5 ? 1 : -1),
        floatSpeed: .0008 + Math.random() * .0012,
        floatOffset: Math.random() * Math.PI * 2,
        baseY: pos3d[i][1],
        baseOpacity,
      })
      scene.add(mesh)
      meshes.push(mesh)
    })

    // ── Torus rings ──
    const ringMat1 = new THREE.MeshStandardMaterial({ color: 0x3ecfcf, transparent: true, opacity: .25 })
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3.5, .02, 4, 80), ringMat1)
    ring.rotation.x = Math.PI / 4; ring.position.set(0, 0, -2); scene.add(ring)

    const ringMat2 = new THREE.MeshStandardMaterial({ color: 0x7b5ea7, transparent: true, opacity: .15 })
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(5, .015, 4, 100), ringMat2)
    ring2.rotation.x = Math.PI / 3; ring2.rotation.y = Math.PI / 6; ring2.position.set(0, 0, -3); scene.add(ring2)

    // ── Mouse parallax ──
    let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0
    const onMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - .5) * 2
      mouseY = -(e.clientY / window.innerHeight - .5) * 2
    }
    document.addEventListener('mousemove', onMove)

    // ── Animate ──
    let t = 0, rafId: number

    const animate = () => {
      rafId = requestAnimationFrame(animate)
      t += .008

      // Read scroll state and lerp between scene states
      const { stateA, stateB, t: st } = getScrollState()
      const speed = lerp(stateA.particleSpeed, stateB.particleSpeed, st)

      // Fog
      fog.density = lerp(stateA.fogDensity, stateB.fogDensity, st)

      // Lights
      pl1.color.copy(lerpColor(stateA.pl1Color, stateB.pl1Color, st))
      pl1.intensity = lerp(stateA.pl1Intensity, stateB.pl1Intensity, st)
      pl2.color.copy(lerpColor(stateA.pl2Color, stateB.pl2Color, st))
      pl2.intensity = lerp(stateA.pl2Intensity, stateB.pl2Intensity, st)
      pl3.color.copy(lerpColor(stateA.pl3Color, stateB.pl3Color, st))
      pl3.intensity = lerp(stateA.pl3Intensity, stateB.pl3Intensity, st)

      // Particles
      pMat.opacity = lerp(stateA.particleOpacity, stateB.particleOpacity, st)
      particles.rotation.y = t * .04 * speed
      particles.rotation.x = t * .02 * speed

      // Geometries
      const geoAlpha = lerp(stateA.geoOpacity, stateB.geoOpacity, st)
      const geoSpd   = lerp(stateA.geoSpeed,   stateB.geoSpeed,   st)
      meshes.forEach((m, i) => {
        const d = meshData[i]
        m.rotation.x += d.rx * geoSpd
        m.rotation.y += d.ry * geoSpd
        m.position.y = d.baseY + Math.sin(t * d.floatSpeed * 80 + d.floatOffset) * .6;
        (m.material as THREE.MeshStandardMaterial).opacity = d.baseOpacity * geoAlpha
      })

      // Rings
      ringMat1.opacity = lerp(stateA.ringOpacity1, stateB.ringOpacity1, st)
      ringMat2.opacity = lerp(stateA.ringOpacity2, stateB.ringOpacity2, st)
      ring.rotation.z  = t * .3 * geoSpd; ring.rotation.y  = t * .15 * geoSpd
      ring2.rotation.z = -t * .2 * geoSpd; ring2.rotation.y = t * .1 * geoSpd

      // Animated light positions
      pl1.position.x = Math.sin(t * .7) * 9;  pl1.position.y = Math.cos(t * .5) * 5
      pl2.position.x = Math.cos(t * .4) * 8;  pl2.position.y = Math.sin(t * .6) * 4
      pl3.position.x = Math.sin(t * .3) * 6;  pl3.position.z = Math.cos(t * .5) * 5

      // Mouse parallax camera
      targetX += (mouseX - targetX) * .04
      targetY += (mouseY - targetY) * .04
      camera.position.x = targetX * 2
      camera.position.y = targetY * 1.5
      camera.lookAt(scene.position)

      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      const w = canvas.offsetWidth, h = canvas.offsetHeight
      camera.aspect = w / h; camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafId)
      document.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    />
  )
}

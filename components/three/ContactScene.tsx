'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ContactScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight)
    renderer.setClearColor(0x060608, 1)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(70, canvas.offsetWidth / canvas.offsetHeight, 0.1, 200)
    camera.position.z = 22

    scene.add(new THREE.AmbientLight(0xffffff, 0.2))
    const lA = new THREE.PointLight(0x3ecfcf, 4, 40); lA.position.set(10, 5, 10); scene.add(lA)
    const lB = new THREE.PointLight(0x7b5ea7, 3, 35); lB.position.set(-10, -5, 8); scene.add(lB)

    const helixGroup = new THREE.Group()
    const sphereGeo = new THREE.SphereGeometry(0.15, 8, 8)

    for (let i = 0; i < 80; i++) {
      const t = i / 80
      const angle = t * Math.PI * 8
      const y = (t - .5) * 28

      const s1 = new THREE.Mesh(sphereGeo, new THREE.MeshStandardMaterial({
        color: 0x3ecfcf, emissive: 0x1a6666, emissiveIntensity: .6,
      }))
      s1.position.set(Math.cos(angle) * 3, y, Math.sin(angle) * 3)
      helixGroup.add(s1)

      const s2 = new THREE.Mesh(sphereGeo, new THREE.MeshStandardMaterial({
        color: 0xe85d75, emissive: 0x661a33, emissiveIntensity: .6,
      }))
      s2.position.set(Math.cos(angle + Math.PI) * 3, y, Math.sin(angle + Math.PI) * 3)
      helixGroup.add(s2)

      if (i % 4 === 0) {
        const rung = new THREE.Mesh(
          new THREE.CylinderGeometry(.03, .03, 6, 6),
          new THREE.MeshStandardMaterial({ color: 0x7b5ea7, transparent: true, opacity: .4 })
        )
        rung.position.set(0, y, 0)
        rung.rotation.z = Math.PI / 2
        rung.rotation.y = angle
        helixGroup.add(rung)
      }
    }
    scene.add(helixGroup)

    // Background particles
    const pp = new Float32Array(600 * 3)
    for (let i = 0; i < 600; i++) {
      pp[i * 3] = (Math.random() - .5) * 60
      pp[i * 3 + 1] = (Math.random() - .5) * 60
      pp[i * 3 + 2] = (Math.random() - .5) * 40
    }
    const bgGeo = new THREE.BufferGeometry()
    bgGeo.setAttribute('position', new THREE.BufferAttribute(pp, 3))
    scene.add(new THREE.Points(bgGeo, new THREE.PointsMaterial({
      size: .06, color: 0x3ecfcf, transparent: true, opacity: .3,
    })))

    let mx = 0, my = 0, tx = 0, ty = 0, t = 0
    let rafId: number
    const section = canvas.parentElement!

    const onMove = (e: MouseEvent) => {
      const r = section.getBoundingClientRect()
      mx = (e.clientX - r.left) / r.width - .5
      my = -((e.clientY - r.top) / r.height - .5)
    }
    section.addEventListener('mousemove', onMove)

    const animate = () => {
      rafId = requestAnimationFrame(animate)
      t += .005
      tx += (mx - tx) * .05
      ty += (my - ty) * .05
      helixGroup.rotation.y = t + tx * 1.5
      helixGroup.position.y = Math.sin(t * .3) * .5
      lA.position.x = Math.sin(t * .8) * 12; lA.position.y = Math.cos(t * .5) * 6
      lB.position.x = Math.cos(t * .6) * 10; lB.position.y = Math.sin(t * .7) * 5
      camera.position.x = tx * 3; camera.position.y = ty * 2
      camera.lookAt(0, 0, 0)
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      const w = canvas.offsetWidth, h = canvas.offsetHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafId)
      section.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .6 }}
    />
  )
}

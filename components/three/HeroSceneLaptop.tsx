'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// ── Math helpers ──────────────────────────────────────────────────────────────
function lerp(a: number, b: number, t: number) { return a + (b - a) * t }
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)) }
function smoothstep(lo: number, hi: number, x: number) {
  const t = clamp((x - lo) / (hi - lo), 0, 1)
  return t * t * (3 - 2 * t)
}
function lerpColor(ca: number, cb: number, t: number) {
  const a = new THREE.Color(ca), b = new THREE.Color(cb)
  return new THREE.Color(lerp(a.r,b.r,t), lerp(a.g,b.g,t), lerp(a.b,b.b,t))
}
function getScroll() {
  return clamp(window.scrollY / Math.max(document.body.scrollHeight - window.innerHeight, 1), 0, 1)
}

// 1️⃣  SPRING EASING — elastic overshoot, settles back, feels physical
function elasticOut(t: number): number {
  if (t === 0 || t === 1) return t
  const c4 = (2 * Math.PI) / 3
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
}
// Softer back-ease for secondary elements
function backOut(t: number): number {
  const c1 = 1.70158, c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

// ── 2️⃣  SCREEN SHADER — boot sequence + scanline reveal ─────────────────────
const SCREEN_VERT = `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`
const SCREEN_FRAG = `
varying vec2  vUv;
uniform float uTime;
uniform float uGlow;
uniform float uBoot;      // 0→1: cold-start reveal
uniform float uDissolve;

float rand(vec2 co) { return fract(sin(dot(co,vec2(12.9898,78.233)))*43758.5453); }

void main() {
  // ── Boot sequence ──
  // Phase 1 (uBoot 0–0.25): random flicker static
  float staticNoise = rand(vUv * 40.0 + uTime * 8.0);
  float flicker     = step(0.45, fract(uTime * 14.0 + rand(vUv * 3.0)));
  float staticLayer = staticNoise * (1.0 - smoothstep(0.0, 0.25, uBoot)) * flicker;

  // Phase 2 (uBoot 0.2–0.85): scanline sweep top→bottom
  float scanFront = smoothstep(0.18, 0.85, uBoot);
  float scanY     = 1.0 - vUv.y;                          // 0 = top, 1 = bottom
  float revealed  = smoothstep(0.0, 0.12, scanFront - scanY * 0.9);

  // Bright scanline edge that passes down the screen
  float scanEdge  = smoothstep(0.0, 0.06, scanFront - scanY) *
                    (1.0 - smoothstep(0.06, 0.16, scanFront - scanY));

  // ── Steady-state display ──
  vec2  grid     = fract(vUv * vec2(38.0, 20.0));
  float lines    = step(0.88, grid.x) + step(0.88, grid.y);
  float gridGlow = lines * 0.12;

  float cx      = 1.0 - 2.0 * abs(vUv.x - 0.5);
  float cy      = 1.0 - 2.0 * abs(vUv.y - 0.5);
  float vignette = pow(cx * cy, 0.6);
  float pulse    = 0.7 + 0.3 * sin(uTime * 1.6 + vUv.y * 5.0);

  vec3 teal      = vec3(0.08, 0.88, 0.88);
  vec3 scanColor = vec3(0.4, 1.0, 1.0);
  vec3 baseColor = mix(vec3(0.01, 0.04, 0.06), teal, vignette * pulse * uGlow);
  baseColor     += vec3(0.0, gridGlow, gridGlow);
  baseColor     += scanColor * scanEdge * 1.5;   // bright sweep line
  baseColor     += vec3(staticLayer * 0.4);

  // Dissolve
  float dissolveNoise = rand(vUv + uTime * 0.01);
  float edge    = 1.0 - smoothstep(0.0, 0.45, uDissolve) * dissolveNoise * 2.2;
  float alpha   = clamp(edge, 0.0, 1.0) * (revealed * uGlow + staticLayer * 0.6);

  gl_FragColor  = vec4(baseColor, alpha);
}
`

// ── 3️⃣  KEYBOARD BACKLIGHT CASCADE shader ────────────────────────────────────
const KB_VERT = `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`
const KB_FRAG = `
varying vec2  vUv;
uniform float uCascade;   // 0→1: wave front travels front→back
uniform float uTime;

void main() {
  // Key grid (14 cols × 4 rows)
  vec2  kGrid = fract(vUv * vec2(14.0, 4.0));
  float key   = step(0.12, kGrid.x) * step(0.18, kGrid.y);  // gap between keys

  // Cascade delay: front keys (low vUv.y) light first
  float delay = vUv.y * 0.65;
  float lit   = smoothstep(0.0, 0.3, uCascade - delay);

  // Ripple shimmer after lit
  float shimmer = 0.75 + 0.25 * sin(uTime * 3.5 - vUv.y * 10.0 + vUv.x * 4.0);
  float alpha   = key * lit * shimmer * 0.55;

  // Slightly brighter on the home row (vUv.y ≈ 0.5)
  float homeRow = 1.0 + 0.3 * smoothstep(0.3, 0.5, 1.0 - abs(vUv.y - 0.45) * 4.0);

  gl_FragColor  = vec4(0.22, 0.82, 0.82, alpha * homeRow);
}
`

// ── Particle shader (unchanged) ───────────────────────────────────────────────
const PART_VERT = `
attribute vec3  aTarget; attribute float aPhase; attribute vec3 aColor; attribute float aSize;
varying   vec3  vColor;
uniform   float uDissolve; uniform float uTime;
void main() {
  vColor = aColor;
  float t = smoothstep(0.0, 1.0, uDissolve);
  vec3 p  = mix(position, aTarget, t);
  p.x    += sin(uTime * 0.8 + aPhase * 6.28) * t * 2.0;
  p.y    += cos(uTime * 0.8 + aPhase * 6.28) * t * 0.35;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = aSize * (300.0 / -mv.z) * (0.5 + t * 1.5);
  gl_Position  = projectionMatrix * mv;
}
`
const PART_FRAG = `
varying vec3 vColor;
void main() {
  float d = length(gl_PointCoord - 0.5); if(d>.5) discard;
  float core = 1.0 - smoothstep(0.0, 0.25, d);
  float halo = 1.0 - smoothstep(0.0, 0.50, d);
  gl_FragColor = vec4(vColor + core*0.4, core*0.9 + halo*0.3);
}
`

export default function HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight)
    renderer.setClearColor(0x060608, 1)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15

    const scene  = new THREE.Scene()
    scene.fog    = new THREE.FogExp2(0x060608, 0.022)

    const camera = new THREE.PerspectiveCamera(55, canvas.offsetWidth / canvas.offsetHeight, 0.1, 500)
    camera.position.set(0, 1.5, 12)

    // ── Lighting ──────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x223344, 0.5))
    const keyLight  = new THREE.PointLight(0x3ecfcf, 3.5, 30); keyLight.position.set(5, 6, 8);    scene.add(keyLight)
    const fillLight = new THREE.PointLight(0x7b5ea7, 2, 25);   fillLight.position.set(-6, -2, 6); scene.add(fillLight)
    const rimLight  = new THREE.PointLight(0xe85d75, 1.5, 20); rimLight.position.set(0, -4, -5);  scene.add(rimLight)

    // 4️⃣  SCREEN CAST LIGHT — appears when screen opens, casts down onto keyboard
    const screenCastLight = new THREE.PointLight(0x3ecfcf, 0, 8)
    scene.add(screenCastLight)

    // ── Laptop group ──────────────────────────────────────────────────────────
    const laptopGroup = new THREE.Group()
    scene.add(laptopGroup)

    const bodyMat   = new THREE.MeshStandardMaterial({ color: 0x1a1f2e, metalness: .88, roughness: .18 })
    const keycapMat = new THREE.MeshStandardMaterial({ color: 0x0d1117, metalness: .4, roughness: .7 })
    const hingeEdgeMat = new THREE.MeshStandardMaterial({
      color: 0x3ecfcf, metalness: 1, roughness: .08,
      emissive: 0x3ecfcf, emissiveIntensity: .5, transparent: true
    })

    // Base
    const base = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.22, 3.6), bodyMat)
    laptopGroup.add(base)

    // Keyboard plane — 3️⃣  uses cascade shader
    const kbMat = new THREE.ShaderMaterial({
      uniforms: { uCascade: { value: 0 }, uTime: { value: 0 } },
      vertexShader: KB_VERT, fragmentShader: KB_FRAG,
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    })
    const kbPlane = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 2.8), kbMat)
    kbPlane.rotation.x = -Math.PI / 2
    kbPlane.position.set(0, 0.12, 0.1)
    laptopGroup.add(kbPlane)

    // Touchpad
    const tpMat = new THREE.MeshStandardMaterial({ color: 0x151b29, metalness: .9, roughness: .15 })
    const tp = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.01, 0.9), tpMat)
    tp.position.set(0, 0.12, 1.1)
    laptopGroup.add(tp)

    // 4️⃣  HINGE — glowing bar, will pulse on open
    const hinge = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.07, 0.1), hingeEdgeMat)
    hinge.position.set(0, 0.13, -1.76)
    laptopGroup.add(hinge)

    // Screen group (pivots from hinge)
    const screenGroup = new THREE.Group()
    screenGroup.position.set(0, 0.11, -1.76)
    laptopGroup.add(screenGroup)

    const lid = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.14, 3.5), bodyMat)
    lid.position.set(0, 1.75, -1.57)
    screenGroup.add(lid)

    const bezel = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.06, 3.1), keycapMat)
    bezel.position.set(0, 1.76, -1.37)
    screenGroup.add(bezel)

    // 2️⃣  DISPLAY with boot shader
    const screenMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:    { value: 0 },
        uGlow:    { value: 0 },
        uBoot:    { value: 0 },   // ← boot sequence
        uDissolve:{ value: 0 },
      },
      vertexShader: SCREEN_VERT, fragmentShader: SCREEN_FRAG,
      transparent: true, side: THREE.FrontSide,
    })
    const displayMesh = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 2.7), screenMat)
    displayMesh.position.set(0, 1.76, -1.32)
    screenGroup.add(displayMesh)

    // Rim glow edges
    const rimMat   = new THREE.LineBasicMaterial({ color: 0x3ecfcf, transparent: true, opacity: 0 })
    const rimEdges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(4.82, 2.72, 0.02)), rimMat)
    rimEdges.position.set(0, 1.76, -1.31)
    screenGroup.add(rimEdges)

    // Screen starts almost closed
    screenGroup.rotation.x = Math.PI * 0.88

    // ── Background stars ───────────────────────────────────────────────────────
    const STARS = 1200
    const sPos = new Float32Array(STARS*3), sCols = new Float32Array(STARS*3), sSz = new Float32Array(STARS)
    const sP = [new THREE.Color(0x3ecfcf), new THREE.Color(0x7b5ea7), new THREE.Color(0xffffff), new THREE.Color(0xe85d75)]
    for (let i = 0; i < STARS; i++) {
      sPos[i*3]=(Math.random()-.5)*180; sPos[i*3+1]=(Math.random()-.5)*120; sPos[i*3+2]=-30-Math.random()*80
      const c=sP[Math.floor(Math.random()*sP.length)]; sCols[i*3]=c.r; sCols[i*3+1]=c.g; sCols[i*3+2]=c.b
      sSz[i]=Math.random()<.06?.14:.05+Math.random()*.04
    }
    const starGeo=new THREE.BufferGeometry()
    starGeo.setAttribute('position',new THREE.BufferAttribute(sPos,3))
    starGeo.setAttribute('aColor',new THREE.BufferAttribute(sCols,3))
    starGeo.setAttribute('aSize',new THREE.BufferAttribute(sSz,1))
    const starMat=new THREE.ShaderMaterial({
      uniforms:{uDissolve:{value:0},uTime:{value:0}},
      vertexShader:`attribute float aSize;attribute vec3 aColor;varying vec3 vColor;void main(){vColor=aColor;vec4 mv=modelViewMatrix*vec4(position,1.0);gl_PointSize=aSize*(300.0/-mv.z);gl_Position=projectionMatrix*mv;}`,
      fragmentShader:`varying vec3 vColor;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;float a=1.0-smoothstep(0.0,.5,d);gl_FragColor=vec4(vColor,a*.5);}`,
      transparent:true, blending:THREE.AdditiveBlending, depthWrite:false,
    })
    scene.add(new THREE.Points(starGeo,starMat))

    // ── Particles ─────────────────────────────────────────────────────────────
    const PCOUNT = 4000
    const pPos=new Float32Array(PCOUNT*3), pTgt=new Float32Array(PCOUNT*3)
    const pPh=new Float32Array(PCOUNT), pCol=new Float32Array(PCOUNT*3), pSz=new Float32Array(PCOUNT)
    for (let i=0;i<PCOUNT;i++) {
      const f=Math.floor(Math.random()*6); let x=0,y=0,z=0
      if(f===0){x=(Math.random()-.5)*5.2;y=0.11;z=(Math.random()-.5)*3.6}
      if(f===1){x=(Math.random()-.5)*5.2;y=1.76+Math.random()*1.75;z=(Math.random()-.5)*3.5-1.76}
      if(f===2){x=-2.6;y=Math.random()*.22;z=(Math.random()-.5)*3.6}
      if(f===3){x=2.6;y=Math.random()*.22;z=(Math.random()-.5)*3.6}
      if(f===4){x=(Math.random()-.5)*5.2;y=Math.random()*.22;z=-1.8}
      if(f===5){x=(Math.random()-.5)*5.2;y=Math.random()*.22;z=1.8}
      pPos[i*3]=x;pPos[i*3+1]=y;pPos[i*3+2]=z;pPh[i]=Math.random()
    }
    const nP=[new THREE.Color(0x3ecfcf),new THREE.Color(0x3ecfcf),new THREE.Color(0x7b5ea7),new THREE.Color(0xe85d75),new THREE.Color(0x9966ff)]
    for (let i=0;i<PCOUNT;i++) {
      const arm=Math.floor(Math.random()*4),t=Math.random()*2.2
      const a=arm*(Math.PI*2/4)+t*1.8+(Math.random()-.5)*.8,r=t*12+Math.random()*4
      pTgt[i*3]=Math.cos(a)*r;pTgt[i*3+1]=(Math.random()-.5)*14;pTgt[i*3+2]=Math.sin(a)*r*.4-5
      const c=nP[Math.floor(Math.random()*nP.length)];pCol[i*3]=c.r;pCol[i*3+1]=c.g;pCol[i*3+2]=c.b
      pSz[i]=Math.random()<.1?.18+Math.random()*.1:.04+Math.random()*.06
    }
    const pGeo=new THREE.BufferGeometry()
    pGeo.setAttribute('position',new THREE.BufferAttribute(pPos,3))
    pGeo.setAttribute('aTarget',new THREE.BufferAttribute(pTgt,3))
    pGeo.setAttribute('aPhase',new THREE.BufferAttribute(pPh,1))
    pGeo.setAttribute('aColor',new THREE.BufferAttribute(pCol,3))
    pGeo.setAttribute('aSize',new THREE.BufferAttribute(pSz,1))
    const partMat=new THREE.ShaderMaterial({
      uniforms:{uDissolve:{value:0},uTime:{value:0}},
      vertexShader:PART_VERT,fragmentShader:PART_FRAG,
      transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,
    })
    const partSystem=new THREE.Points(pGeo,partMat)
    partSystem.visible=false
    scene.add(partSystem)

    // ── Mouse tracking ────────────────────────────────────────────────────────
    let mX=0,mY=0, tX=0,tY=0, ltX=0,ltY=0
    const onMove=(e: MouseEvent)=>{mX=(e.clientX/window.innerWidth-.5)*2;mY=-(e.clientY/window.innerHeight-.5)*2}
    document.addEventListener('mousemove',onMove)

    // State: track whether boot has started so it only triggers once
    let bootStarted = false

    let time=0, rafId: number
    const animate = () => {
      rafId = requestAnimationFrame(animate)
      time += .007

      const scroll = getScroll()

      // ── Mouse smooth ──────────────────────────────────────────────────────
      tX  += (mX - tX)  * .04
      tY  += (mY - tY)  * .04
      ltX += (mY * .28 - ltX) * .06
      ltY += (mX * .38 - ltY) * .06
      const heroTilt = 1 - smoothstep(0, .38, scroll)

      // ── Idle float ────────────────────────────────────────────────────────
      laptopGroup.position.y = Math.sin(time * .6) * .1

      // ── STAGE 1 (0–0.18): Laptop rotates in ──────────────────────────────
      const introT = smoothstep(0, .18, scroll)
      laptopGroup.rotation.y = lerp(-.3, -.05, introT) + ltY * heroTilt
      laptopGroup.rotation.x = ltX * heroTilt

      // ── STAGE 2 (0.18–0.44): Screen opens with spring ────────────────────
      const openRaw = smoothstep(.18, .44, scroll)
      const openT   = elasticOut(openRaw)        // 1️⃣  SPRING EASING

      screenGroup.rotation.x = lerp(Math.PI * .88, Math.PI * .14, openT)

      // 4️⃣  HINGE PULSE — bell-curve pulse as lid lifts
      const hingePulse = Math.sin(openRaw * Math.PI)
      hingeEdgeMat.emissiveIntensity = .5 + hingePulse * 2.0
      hingeEdgeMat.opacity = clamp(.7 + hingePulse * .3, 0, 1)

      // 2️⃣  BOOT SEQUENCE — triggers when screen hits ~50° open
      const screenAngle = 1 - (screenGroup.rotation.x / Math.PI)  // 0 = closed, 1 = flat
      if (screenAngle > .42 && !bootStarted) bootStarted = true
      const bootRaw   = bootStarted ? smoothstep(.30, .44, scroll) : 0
      const bootT     = backOut(clamp(bootRaw, 0, 1))
      screenMat.uniforms.uBoot.value    = bootT
      screenMat.uniforms.uGlow.value    = lerp(0, 1.3, openT) * bootT
      screenMat.uniforms.uDissolve.value = smoothstep(.62, .82, scroll)
      rimMat.opacity = lerp(0, .9, openT * bootT)
      keyLight.intensity = lerp(3.5, 5.5, openT)

      // 3️⃣  KEYBOARD BACKLIGHT — cascade wave, delayed after screen opens
      const kbCascade = smoothstep(.28, .50, scroll)
      kbMat.uniforms.uCascade.value = kbCascade
      kbMat.uniforms.uTime.value    = time

      // 4️⃣  SCREEN CAST LIGHT — positioned above the open display, shines down
      const screenOpenAngle = lerp(Math.PI * .88, Math.PI * .14, openT)
      const screenLightY = laptopGroup.position.y + 2.2 * Math.cos(screenOpenAngle - Math.PI*.5) + 1.8
      const screenLightZ = -1.76 - 2.2 * Math.sin(screenOpenAngle - Math.PI*.5)
      screenCastLight.position.set(0, screenLightY, screenLightZ + 2)
      screenCastLight.intensity = lerp(0, 5, openT * bootT)
      screenCastLight.color.copy(lerpColor(0x3ecfcf, 0x7b5ea7, .3))

      // ── STAGE 3 (0.42–0.62): Full spin reveal ────────────────────────────
      const spinT = smoothstep(.42, .62, scroll)
      if (spinT > 0) {
        laptopGroup.rotation.y = lerp(-.05, Math.PI * 2 - .05, spinT)
        laptopGroup.rotation.x = lerp(ltX * heroTilt, 0, spinT)
      }
      camera.position.y = lerp(1.5, 3.5, spinT)

      // ── STAGE 4 (0.62–0.82): Disintegration ──────────────────────────────
      const dissT = smoothstep(.62, .82, scroll)
      partMat.uniforms.uDissolve.value = dissT
      partMat.uniforms.uTime.value     = time
      if (dissT > 0.04) {
        partSystem.visible = true
        partSystem.position.copy(laptopGroup.position)
        partSystem.rotation.copy(laptopGroup.rotation)
      } else { partSystem.visible = false }

      const laptopAlpha = 1 - dissT
      bodyMat.opacity = laptopAlpha; bodyMat.transparent = true
      keycapMat.opacity = laptopAlpha; keycapMat.transparent = true
      hingeEdgeMat.opacity = Math.min(hingeEdgeMat.opacity, laptopAlpha)
      screenCastLight.intensity *= laptopAlpha
      laptopGroup.visible = dissT < .98

      // ── STAGE 5 (0.82–1.0): Nebula ───────────────────────────────────────
      const nebulaT = smoothstep(.82, 1.0, scroll)
      partSystem.rotation.y = nebulaT * Math.PI * .3 + time * .015
      partSystem.position.y = lerp(laptopGroup.position.y, 0, nebulaT)
      keyLight.color.copy(lerpColor(0x3ecfcf, 0x9966ff, nebulaT)); keyLight.intensity = lerp(5.5, 8, nebulaT)
      fillLight.color.copy(lerpColor(0x7b5ea7, 0xe85d75, nebulaT)); fillLight.intensity = lerp(2, 5, nebulaT)

      // Light orbits
      keyLight.position.x  = Math.sin(time * .55) * 10; keyLight.position.y  = Math.cos(time * .4) * 7 + 4
      fillLight.position.x = Math.cos(time * .45) * 8;  fillLight.position.y = Math.sin(time * .5) * 5 - 2

      // Shared shader time
      screenMat.uniforms.uTime.value = time

      // Camera
      camera.position.x = tX * 1.5
      camera.position.y += (tY * 1.2 + (spinT > 0 ? 3.5 : 1.5) - camera.position.y) * .05
      camera.lookAt(0, 1, 0)

      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      const w=canvas.offsetWidth,h=canvas.offsetHeight
      camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafId)
      document.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
}

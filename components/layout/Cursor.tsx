'use client'
import { useEffect } from 'react'
import styles from './Cursor.module.css'

export default function Cursor() {
  useEffect(() => {
    const cur = document.getElementById('cur')!
    const curR = document.getElementById('curR')!

    const onMove = (e: MouseEvent) => {
      cur.style.left = e.clientX + 'px'
      cur.style.top = e.clientY + 'px'
      curR.style.left = e.clientX + 'px'
      curR.style.top = e.clientY + 'px'
    }

    const onEnter = () => {
      cur.style.transform = 'translate(-50%,-50%) scale(3)'
      curR.style.opacity = '0'
    }
    const onLeave = () => {
      cur.style.transform = 'translate(-50%,-50%) scale(1)'
      curR.style.opacity = '.35'
    }

    document.addEventListener('mousemove', onMove)
    document.querySelectorAll('a, button').forEach((el) => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })

    return () => {
      document.removeEventListener('mousemove', onMove)
    }
  }, [])

  return (
    <>
      <div id="cur" className={styles.cur} />
      <div id="curR" className={styles.curR} />
    </>
  )
}

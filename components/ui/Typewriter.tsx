'use client'
import { useEffect, useState } from 'react'
import styles from './Typewriter.module.css'

interface Props {
  text: string
  speed?: number      // ms per character
  startDelay?: number // ms before typing begins
}

export default function Typewriter({ text, speed = 65, startDelay = 800 }: Props) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    let i = 0
    const start = setTimeout(() => {
      const interval = setInterval(() => {
        i++
        setDisplayed(text.slice(0, i))
        if (i >= text.length) {
          clearInterval(interval)
          setDone(true)
        }
      }, speed)
      return () => clearInterval(interval)
    }, startDelay)

    return () => clearTimeout(start)
  }, [text, speed, startDelay])

  return (
    <span className={styles.wrap}>
      {displayed}
      <span className={`${styles.cursor} ${done ? styles.blink : ''}`}>|</span>
    </span>
  )
}

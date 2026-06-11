import styles from './RichText.module.css'

interface Props {
  html: string
  className?: string
}

/** Renders HTML produced by the Tiptap rich text editor. */
export default function RichText({ html, className }: Props) {
  if (!html) return null
  return (
    <div
      className={`${styles.rte} ${className ?? ''}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

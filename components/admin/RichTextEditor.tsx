'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect } from 'react'

interface Props {
  value: string          // HTML string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
}

const TOOLBAR_BTN: React.CSSProperties = {
  background: 'none', border: '1px solid transparent', borderRadius: 5,
  color: '#6b7c8f', cursor: 'pointer', padding: '3px 7px',
  fontFamily: "'DM Mono', monospace", fontSize: 11, transition: 'all .12s',
}
const TOOLBAR_BTN_ACTIVE: React.CSSProperties = {
  ...TOOLBAR_BTN, color: '#3ECFCF', borderColor: 'rgba(62,207,207,.3)',
  background: 'rgba(62,207,207,.07)',
}
const TOOLBAR_SEP: React.CSSProperties = {
  width: 1, height: 16, background: '#1a2330', margin: '0 4px', flexShrink: 0,
}

export default function RichTextEditor({ value, onChange, placeholder = 'Start writing…', minHeight = 140 }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'rte-link' } }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'rte-body',
        style: `min-height:${minHeight}px`,
      },
    },
  })

  // Sync external value changes (e.g. form reset)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', { emitUpdate: false })
    }
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!editor) return null

  const btn = (active: boolean) => active ? TOOLBAR_BTN_ACTIVE : TOOLBAR_BTN

  const addLink = () => {
    const url = window.prompt('URL', 'https://')
    if (url) editor.chain().focus().setLink({ href: url }).run()
  }

  return (
    <div className="rte-wrap">
      <style>{`
        .rte-wrap {
          border: 1px solid #1a2330; border-radius: 8px; overflow: hidden;
          background: rgba(255,255,255,.03);
          transition: border-color .15s;
        }
        .rte-wrap:focus-within { border-color: rgba(62,207,207,.5); }
        .rte-toolbar {
          display: flex; align-items: center; gap: 2px; flex-wrap: wrap;
          padding: 7px 10px; border-bottom: 1px solid #1a2330;
          background: #0d1117;
        }
        .rte-toolbar button:hover { color: #d4dde8 !important; border-color: #243040 !important; }
        .rte-body {
          padding: 12px 14px; color: #d4dde8;
          font-family: 'DM Sans', sans-serif; font-size: 14px; line-height: 1.75;
          outline: none;
        }
        .rte-body p { margin: 0 0 .6em; }
        .rte-body p:last-child { margin-bottom: 0; }
        .rte-body h2 { font-family:'Bebas Neue',sans-serif; font-size:1.4rem; letter-spacing:.04em; color:#d4dde8; margin:.8em 0 .3em; }
        .rte-body h3 { font-family:'Bebas Neue',sans-serif; font-size:1.1rem; letter-spacing:.04em; color:#d4dde8; margin:.7em 0 .25em; }
        .rte-body strong { color: #d4dde8; font-weight: 600; }
        .rte-body em { font-style: italic; color: #b4bdc8; }
        .rte-body u  { text-decoration: underline; text-underline-offset: 3px; }
        .rte-body ul, .rte-body ol { padding-left: 1.4em; margin: .4em 0; }
        .rte-body li { margin-bottom: .2em; }
        .rte-body ul li::marker { color: #3ECFCF; }
        .rte-body blockquote { border-left: 2px solid #3ECFCF; padding-left: 1em; margin: .6em 0; color: #8a9ab0; font-style: italic; }
        .rte-body a.rte-link { color: #3ECFCF; text-decoration: underline; text-underline-offset: 3px; }
        .rte-body .is-editor-empty:first-child::before { content: attr(data-placeholder); color: #3a4a5a; pointer-events: none; float: left; height: 0; }
        .rte-body code { background: #111820; border-radius: 4px; padding: 1px 5px; font-family:'DM Mono',monospace; font-size:.85em; color:#6b7c8f; }
      `}</style>

      {/* Toolbar */}
      <div className="rte-toolbar">
        <button type="button" style={btn(editor.isActive('bold'))} onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleBold().run() }} title="Bold">B</button>
        <button type="button" style={{ ...btn(editor.isActive('italic')), fontStyle:'italic' }} onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleItalic().run() }} title="Italic">I</button>
        <button type="button" style={{ ...btn(editor.isActive('underline')), textDecoration:'underline' }} onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleUnderline().run() }} title="Underline">U</button>

        <div style={TOOLBAR_SEP} />

        <button type="button" style={btn(editor.isActive('heading', { level: 2 }))} onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run() }} title="Heading 2">H2</button>
        <button type="button" style={btn(editor.isActive('heading', { level: 3 }))} onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 3 }).run() }} title="Heading 3">H3</button>

        <div style={TOOLBAR_SEP} />

        <button type="button" style={btn(editor.isActive('bulletList'))} onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleBulletList().run() }} title="Bullet list">• —</button>
        <button type="button" style={btn(editor.isActive('orderedList'))} onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run() }} title="Numbered list">1.</button>
        <button type="button" style={btn(editor.isActive('blockquote'))} onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleBlockquote().run() }} title="Quote">"</button>

        <div style={TOOLBAR_SEP} />

        <button type="button" style={btn(editor.isActive('link'))} onMouseDown={e => { e.preventDefault(); editor.isActive('link') ? editor.chain().focus().unsetLink().run() : addLink() }} title="Link">🔗</button>
        <button type="button" style={btn(false)} onMouseDown={e => { e.preventDefault(); editor.chain().focus().clearNodes().unsetAllMarks().run() }} title="Clear format">✕</button>
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}

'use client'
import { useRef, useState, useId } from 'react'
import Image from 'next/image'

interface Props {
  value: string
  onChange: (url: string) => void
  label?: string
  accept?: string
  hint?: string
  folder?: string    // storage folder, e.g. "resume", "profile", "projects/academic-connect"
  caption?: string   // used as filename base if no custom name entered
}

/** Slugify a string for use as a filename */
function slugify(s: string) {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function MediaUpload({
  value, onChange, label = 'Media', accept = 'image/*', hint, folder, caption,
}: Props) {
  const inputRef     = useRef<HTMLInputElement>(null)
  const [uploading,  setUploading]  = useState(false)
  const [error,      setError]      = useState('')
  const [pending,    setPending]    = useState<File | null>(null)
  const [customName, setCustomName] = useState('')

  const isImage  = value && /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(value)
  const isPdf    = value && /\.pdf(\?.*)?$/i.test(value)
  const filename = value ? value.split('/').pop()?.split('?')[0] ?? value : ''

  const handleFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPending(file)
    // Pre-fill: caption → slug, or original filename without extension
    const base = caption ? slugify(caption) : file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9._-]/g, '_')
    setCustomName(base)
    setError('')
  }

  const handleUpload = async () => {
    if (!pending) return
    setUploading(true)
    setError('')

    const ext       = pending.name.split('.').pop() ?? ''
    const timestamp = Date.now()

    // Name: {timestamp}-{custom_or_caption_slug}.{ext}
    const namePart = customName.trim()
      ? slugify(customName)
      : timestamp.toString()
    const finalName = `${timestamp}-${namePart}.${ext}`

    // Full key: {folder}/{finalName} or just {finalName}
    const key = folder ? `${folder}/${finalName}` : finalName

    const form = new FormData()
    form.append('file', pending, finalName)   // just the filename — no slashes
    if (folder) form.append('folder', folder) // folder sent separately

    const res  = await fetch('/api/admin/upload', { method: 'POST', body: form })
    const data = await res.json()

    if (res.ok) {
      onChange(data.url)
      setPending(null)
      setCustomName('')
    } else {
      setError(data.error ?? 'Upload failed')
    }
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const cancelPending = () => {
    setPending(null)
    setCustomName('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const uid    = useId()
  const fileId = `upload-${uid}`

  return (
    <div className="ar-field">
      <label className="ar-label">{label}</label>

      {/* Image preview */}
      {value && isImage && (
        <div style={{ marginBottom: 10, position: 'relative', width: '100%', maxWidth: 300, aspectRatio: '16/10', background: '#0d1117', border: '1px solid #1a2330', borderRadius: 8, overflow: 'hidden' }}>
          <Image src={value} alt="Preview" fill style={{ objectFit: 'cover' }} sizes="300px" />
          <button type="button" onClick={() => onChange('')}
            style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(255,77,109,.15)', border: '1px solid rgba(255,77,109,.3)', borderRadius: 5, color: '#ff4d6d', fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: '.08em', padding: '3px 8px', cursor: 'pointer' }}>
            Remove
          </button>
        </div>
      )}

      {/* PDF / file preview */}
      {value && !isImage && (
        <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10, background: '#0d1117', border: '1px solid #1a2330', borderRadius: 8, padding: '10px 14px' }}>
          <span style={{ fontSize: 18 }}>{isPdf ? '📄' : '📎'}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <a href={value} target="_blank" rel="noopener noreferrer"
              style={{ color: '#3ECFCF', fontSize: 12, textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {filename}
            </a>
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: '#3a4a5a', letterSpacing: '.06em', textTransform: 'uppercase' }}>
              {isPdf ? 'PDF' : 'File'} · Open ↗
            </span>
          </div>
          <button type="button" onClick={() => onChange('')}
            style={{ background: 'rgba(255,77,109,.15)', border: '1px solid rgba(255,77,109,.3)', borderRadius: 5, color: '#ff4d6d', fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: '.08em', padding: '3px 8px', cursor: 'pointer', flexShrink: 0 }}>
            Remove
          </button>
        </div>
      )}

      {/* URL input */}
      <input
        type="text"
        className="ar-input"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="https://... or paste a URL"
        style={{ marginBottom: 8 }}
      />

      {/* Pending file — rename + upload */}
      {pending && (
        <div style={{ background: '#0d1117', border: '1px solid #243040', borderRadius: 8, padding: '12px 14px', marginBottom: 8 }}>
          <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: '#3a4a5a', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>
            {folder && <span style={{ color: '#3ECFCF' }}>{folder}/</span>}
            {Date.now()}-<strong>{customName || '…'}</strong>.{pending.name.split('.').pop()}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <label className="ar-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>Name</label>
            <input
              className="ar-input"
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              placeholder="descriptive-name"
              style={{ flex: 1 }}
            />
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: '#6b7c8f', whiteSpace: 'nowrap' }}>
              .{pending.name.split('.').pop()}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="ar-btn ar-btn-p" onClick={handleUpload} disabled={uploading} style={{ fontSize: 11 }}>
              {uploading ? 'Uploading…' : '↑ Upload'}
            </button>
            <button type="button" className="ar-btn ar-btn-o" onClick={cancelPending} style={{ fontSize: 11 }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Choose file button */}
      {!pending && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input ref={inputRef} type="file" accept={accept} onChange={handleFileChosen} style={{ display: 'none' }} id={fileId} />
          <label htmlFor={fileId} className="ar-btn ar-btn-o" style={{ cursor: 'pointer' }}>
            ↑ Choose file
          </label>
          {hint && <span style={{ fontSize: 11, color: '#6b7c8f' }}>{hint}</span>}
        </div>
      )}

      {error && <p style={{ fontSize: 11, color: '#ff4d6d', marginTop: 5 }}>{error}</p>}
    </div>
  )
}

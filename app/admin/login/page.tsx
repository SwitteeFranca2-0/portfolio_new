'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const s = {
  page:    { minHeight:'100vh', background:'#080b0f', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans',sans-serif" } as React.CSSProperties,
  wrap:    { width:'100%', maxWidth:380, padding:'0 1.5rem' } as React.CSSProperties,
  logo:    { marginBottom:'2rem', textAlign:'center' as const },
  eyebrow: { fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:'.2em', textTransform:'uppercase' as const, color:'#3ECFCF', marginBottom:6 },
  heading: { fontFamily:"'Bebas Neue',sans-serif", fontSize:32, letterSpacing:'.06em', color:'#d4dde8', lineHeight:1 },
  form:    { display:'flex', flexDirection:'column' as const, gap:14 },
  field:   { display:'flex', flexDirection:'column' as const, gap:6 },
  label:   { fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:'.15em', textTransform:'uppercase' as const, color:'#6b7c8f' },
  input:   { background:'#0d1117', border:'1px solid #1a2330', borderRadius:8, color:'#d4dde8', fontFamily:"'DM Sans',sans-serif", fontSize:14, padding:'10px 14px', outline:'none', width:'100%', transition:'border-color .15s' } as React.CSSProperties,
  btn:     { background:'#3ECFCF', color:'#080b0f', border:'none', borderRadius:8, padding:'11px 20px', fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, cursor:'pointer', width:'100%', marginTop:6, transition:'opacity .15s', boxShadow:'0 2px 16px rgba(62,207,207,.25)' } as React.CSSProperties,
  err:     { background:'rgba(255,77,109,.08)', border:'1px solid rgba(255,77,109,.25)', borderRadius:8, color:'#ff4d6d', padding:'10px 14px', fontSize:13, marginBottom:4 },
  mark:    { width:40, height:40, background:'#3ECFCF', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Bebas Neue',sans-serif", fontSize:15, color:'#080b0f', margin:'0 auto 12px', boxShadow:'0 2px 16px rgba(62,207,207,.35)' } as React.CSSProperties,
}

export default function AdminLoginPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (res.ok) {
      router.push('/admin')
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error ?? 'Login failed')
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <div style={s.logo}>
          <div style={s.mark}>FU</div>
          <div style={s.eyebrow}>Portfolio Admin</div>
          <div style={s.heading}>SIGN IN</div>
        </div>

        {error && <div style={s.err}>{error}</div>}

        <form style={s.form} onSubmit={handleLogin}>
          <div style={s.field}>
            <label style={s.label} htmlFor="email">Email</label>
            <input
              id="email" type="email" style={s.input}
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@email.com" required autoComplete="email"
              onFocus={e => e.target.style.borderColor='#3ECFCF'}
              onBlur={e => e.target.style.borderColor='#1a2330'}
            />
          </div>
          <div style={s.field}>
            <label style={s.label} htmlFor="password">Password</label>
            <input
              id="password" type="password" style={s.input}
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required autoComplete="current-password"
              onFocus={e => e.target.style.borderColor='#3ECFCF'}
              onBlur={e => e.target.style.borderColor='#1a2330'}
            />
          </div>
          <button
            type="submit" style={{ ...s.btn, opacity: loading ? .6 : 1 }}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>
      </div>
    </div>
  )
}

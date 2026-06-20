export default function DemoBanner() {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9998,
      background: 'rgba(123,94,167,.95)', backdropFilter: 'blur(8px)',
      borderTop: '1px solid rgba(255,255,255,.15)',
      padding: '.6rem 2rem', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
        <span style={{ fontSize: '1rem' }}>🔧</span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '.65rem', letterSpacing: '.1em', textTransform: 'uppercase', color: '#F0EEF8' }}>
          Demo Mode — showing sample data from <code style={{ background: 'rgba(255,255,255,.15)', padding: '1px 6px', borderRadius: 3 }}>lib/data.ts</code>
        </span>
      </div>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '.6rem', color: 'rgba(240,238,248,.6)', letterSpacing: '.08em' }}>
        Remove DEMO_MODE=true from .env to use live data
      </span>
    </div>
  )
}

export const dynamic = 'force-dynamic'

import Sidebar from '@/components/admin/Sidebar'
import Topbar  from '@/components/admin/Topbar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Inline styles ensure they apply regardless of Tailwind/Turbopack behaviour */}
      <style>{`
        :root {
          --adm-bg:#080b0f;--adm-bg-2:#0d1117;--adm-bg-3:#111820;
          --adm-border:#1a2330;--adm-border-hi:#243040;
          --adm-accent:#3ECFCF;--adm-accent-2:#2db8b8;--adm-accent-dim:rgba(62,207,207,.08);
          --adm-text:#d4dde8;--adm-text-2:#6b7c8f;--adm-text-3:#3a4a5a;
          --adm-expert:#3ECFCF;--adm-proficient:#3ab8ff;--adm-danger:#ff4d6d;
        }
        .ar {
          display: flex; min-height: 100vh;
          background: #080b0f; color: #d4dde8;
          font-family: 'DM Sans', sans-serif;
          cursor: default;
        }
        /* ── Sidebar ── */
        .ar-side {
          width: 220px; flex-shrink: 0;
          background: #0d1117;
          border-right: 1px solid #1a2330;
          display: flex; flex-direction: column;
          position: fixed; top: 0; bottom: 0; left: 0;
          z-index: 100; overflow-y: auto;
        }
        .ar-logo {
          padding: 20px 18px; border-bottom: 1px solid #1a2330;
          display: flex; align-items: center; gap: 11px;
        }
        .ar-logo-mark {
          width: 34px; height: 34px; border-radius: 9px;
          background: #3ECFCF; color: #080b0f;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif; font-size: 13px;
          letter-spacing: .04em; flex-shrink: 0;
          box-shadow: 0 2px 14px rgba(62,207,207,.35);
        }
        .ar-logo-name { font-size: 12px; font-weight: 600; color: #d4dde8; }
        .ar-logo-sub  { font-family: 'DM Mono',monospace; font-size: 9px; letter-spacing: .12em; text-transform: uppercase; color: #3a4a5a; }
        .ar-nav { padding: 12px 10px; flex: 1; }
        .ar-nav-sec {
          font-family: 'DM Mono',monospace; font-size: 9px;
          letter-spacing: .2em; text-transform: uppercase;
          color: #3a4a5a; padding: 10px 10px 5px; margin-top: 4px;
        }
        .ar-link {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 12px; border-radius: 8px;
          font-size: 13px; color: #6b7c8f;
          text-decoration: none; transition: all .15s;
          margin-bottom: 2px; position: relative;
          background: none; border: none; cursor: pointer;
          width: 100%; text-align: left; font-family: 'DM Sans',sans-serif;
        }
        .ar-link:hover { background: #111820; color: #d4dde8; }
        .ar-link.active { background: rgba(62,207,207,.08); color: #3ECFCF; font-weight: 500; }
        .ar-link.active::before {
          content:''; position: absolute; left: 0; top: 50%;
          transform: translateY(-50%); width: 3px; height: 20px;
          background: #3ECFCF; border-radius: 0 2px 2px 0;
        }
        .ar-icon { font-size: 13px; opacity: .55; flex-shrink: 0; }
        .ar-link.active .ar-icon { opacity: 1; }
        .ar-foot { padding: 12px 10px; border-top: 1px solid #1a2330; }
        .ar-dot { width:6px;height:6px;border-radius:50%;background:#3ECFCF;flex-shrink:0;animation:arPulse 2s infinite;box-shadow:0 0 6px #3ECFCF; }
        @keyframes arPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.75)}}
        /* ── Main ── */
        .ar-main { margin-left: 220px; flex: 1; display: flex; flex-direction: column; min-height: 100vh; }
        /* ── Topbar ── */
        .ar-topbar {
          height: 56px; border-bottom: 1px solid #1a2330;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 28px; position: sticky; top: 0;
          background: rgba(8,11,15,.95); backdrop-filter: blur(10px); z-index: 5;
        }
        .ar-crumb { display:flex;align-items:center;gap:8px;font-family:'DM Mono',monospace;font-size:11px;color:#3a4a5a; }
        .ar-crumb-a { color:#3ECFCF; }
        .ar-body { padding: 28px; flex: 1; }
        /* ── Page header ── */
        .ar-ph { margin-bottom:24px;display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap; }
        .ar-eyebrow { font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#3ECFCF;margin-bottom:6px; }
        .ar-title { font-family:'Bebas Neue',sans-serif;font-size:46px;letter-spacing:.04em;color:#d4dde8;line-height:1; }
        .ar-sub { font-size:13px;color:#6b7c8f;margin-top:5px; }
        /* ── Stats ── */
        .ar-stats { display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px; }
        .ar-stat { background:#0d1117;border:1px solid #1a2330;border-radius:12px;padding:16px 18px;transition:border-color .2s; }
        .ar-stat:hover { border-color:#243040; }
        .ar-stat-n { font-family:'Bebas Neue',sans-serif;font-size:30px;color:#3ECFCF;line-height:1; }
        .ar-stat-l { font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.15em;text-transform:uppercase;color:#3a4a5a;margin-top:5px; }
        /* ── Cards ── */
        .ar-card { background:#0d1117;border:1px solid #1a2330;border-radius:12px;padding:20px;margin-bottom:16px; }
        .ar-card-t { font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:#3a4a5a;margin-bottom:16px;display:flex;align-items:center;gap:6px; }
        .ar-card-t::before { content:'';width:3px;height:3px;border-radius:50%;background:#3ECFCF;flex-shrink:0; }
        /* ── Table ── */
        .ar-tw { background:#0d1117;border:1px solid #1a2330;border-radius:14px;overflow:hidden; }
        .ar-table { width:100%;border-collapse:collapse; }
        .ar-table th { font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:#3a4a5a;padding:11px 16px;text-align:left;background:#111820;border-bottom:1px solid #1a2330; }
        .ar-table td { font-size:.8rem;padding:.85rem 1rem;border-bottom:1px solid rgba(26,35,48,.7);color:#d4dde8;vertical-align:middle; }
        .ar-table tbody tr { transition:background .12s; }
        .ar-table tbody tr:hover td { background:#111820; }
        .ar-table tbody tr:last-child td { border-bottom:none; }
        /* ── Forms ── */
        .ar-field { margin-bottom:16px; }
        .ar-label { display:block;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.15em;text-transform:uppercase;color:#3a4a5a;margin-bottom:6px; }
        .ar-input,.ar-textarea,.ar-select {
          width:100%;background:#080b0f;border:1px solid #1a2330;border-radius:8px;
          color:#d4dde8;font-family:'DM Sans',sans-serif;font-size:.875rem;
          padding:.7rem .9rem;outline:none;transition:border-color .15s,box-shadow .15s;
        }
        .ar-input:focus,.ar-textarea:focus,.ar-select:focus { border-color:#3ECFCF;box-shadow:0 0 0 3px rgba(62,207,207,.1); }
        .ar-input::placeholder,.ar-textarea::placeholder { color:#3a4a5a; }
        .ar-textarea { resize:vertical;min-height:110px; }
        .ar-select option { background:#0d1117; }
        .ar-g2 { display:grid;grid-template-columns:1fr 1fr;gap:16px; }
        .ar-g3 { display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px; }
        /* ── Buttons ── */
        .ar-btn { display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;border:none;transition:all .15s;font-family:'DM Sans',sans-serif;text-decoration:none; }
        .ar-btn:hover { transform:translateY(-1px); }
        .ar-btn-p { background:#3ECFCF;color:#080b0f;font-weight:600;box-shadow:0 2px 14px rgba(62,207,207,.25); }
        .ar-btn-p:hover { box-shadow:0 4px 22px rgba(62,207,207,.4); }
        .ar-btn-o { background:transparent;border:1px solid #243040;color:#6b7c8f; }
        .ar-btn-o:hover { border-color:#6b7c8f;color:#d4dde8; }
        .ar-btn-d { background:rgba(255,77,109,.1);border:1px solid rgba(255,77,109,.25);color:#ff4d6d; }
        .ar-btn:disabled { opacity:.35;cursor:not-allowed;transform:none!important; }
        /* ── Badges ── */
        .ar-badge { display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:6px;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.08em;text-transform:uppercase;border:1px solid; }
        .ar-badge::before { content:'';width:4px;height:4px;border-radius:50%;background:currentColor; }
        .ar-ba-t { color:#3ECFCF;background:rgba(62,207,207,.08);border-color:rgba(62,207,207,.2); }
        .ar-ba-b { color:#3ab8ff;background:rgba(58,184,255,.08);border-color:rgba(58,184,255,.2); }
        .ar-ba-g { color:#6b7c8f;background:rgba(255,255,255,.04);border-color:#1a2330; }
        /* ── Skill icon cells ── */
        .ar-icon-cell { width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:17px;border:1px solid;flex-shrink:0; }
        .ar-ic-fe { background:#0d1f2d;border-color:#1a3a52; }
        .ar-ic-be { background:#0d1f14;border-color:#1a3a22; }
        .ar-ic-db { background:#1f1a0d;border-color:#3a2e1a; }
        .ar-ic-dv { background:#1f0d1a;border-color:#3a1a30; }
        .ar-ic-cm { background:#1a0d1f;border-color:#2e1a3a; }
        .ar-ic-ar { background:#0d1f1f;border-color:#1a3a3a; }
        .ar-ic-df { background:#111820;border-color:#1a2330; }
        /* ── Tech tags ── */
        .ar-tag { background:#111820;border:1px solid #1a2330;border-radius:5px;padding:3px 8px;font-family:'DM Mono',monospace;font-size:9px;color:#6b7c8f;display:inline-block; }
        .ar-more { border:1px dashed #1a2330;border-radius:5px;padding:3px 8px;font-family:'DM Mono',monospace;font-size:9px;color:#3a4a5a;display:inline-block; }
        /* ── Alert ── */
        .ar-ok { background:rgba(34,197,94,.07);border:1px solid rgba(34,197,94,.2);color:#22c55e;padding:10px 14px;border-radius:8px;font-size:.8rem;margin-bottom:14px;display:flex;align-items:center;gap:8px; }
        .ar-er { background:rgba(255,77,109,.07);border:1px solid rgba(255,77,109,.2);color:#ff4d6d;padding:10px 14px;border-radius:8px;font-size:.8rem;margin-bottom:14px;display:flex;align-items:center;gap:8px; }
        /* ── Misc ── */
        .ar-divider { height:1px;background:#1a2330;margin:16px 0; }
        .ar-empty { text-align:center;padding:3rem;color:#3a4a5a;font-size:.85rem; }
        /* ── Scrollbar ── */
        .ar-side::-webkit-scrollbar { width:4px; }
        .ar-side::-webkit-scrollbar-thumb { background:#243040;border-radius:2px; }
        /* override globals */
        .ar { cursor: default !important; }
        .ar * { cursor: inherit; }
        .ar a, .ar button, .ar [role=button], .ar label[for] { cursor: pointer; }
      `}</style>

      <div className="ar">
        <Sidebar />
        <div className="ar-main">
          <Topbar />
          <div className="ar-body">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

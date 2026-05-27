import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const revalidate = 86400;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = "Étude exclusive : État du cold email B2B en France 2026 — Volia";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #08080c 0%, #1a1a2e 50%, #16162a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Glow */}
        <div style={{ position: 'absolute', top: '-150px', right: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }} />

        {/* Top : logo + badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 55%, #ec4899 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" style={{ display: 'block', transform: 'rotate(-45deg)' }} fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
              </svg>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
              <span style={{ fontSize: '32px', fontWeight: 700, color: 'white' }}>Volia</span>
              <span style={{ fontSize: '20px', fontWeight: 600, color: '#a78bfa' }}>.fr</span>
            </div>
          </div>
          <div style={{ padding: '10px 18px', borderRadius: '999px', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.4)', color: '#c4b5fd', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', display: 'flex' }}>
            ✉️ Étude exclusive · Mai 2026
          </div>
        </div>

        {/* Middle : title + subtitle */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '72px', fontWeight: 700, color: 'white', lineHeight: 1.05, marginBottom: '20px', display: 'flex', flexDirection: 'column' }}>
            <span>État du cold email B2B</span>
            <span style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 100%)', backgroundClip: 'text', color: 'transparent', WebkitBackgroundClip: 'text' }}>en France 2026</span>
          </div>
          <div style={{ fontSize: '26px', color: '#a1a1aa', lineHeight: 1.4, maxWidth: '950px' }}>
            12 chiffres clés · 287 000+ entreprises analysées · 14 800 campagnes · RGPD · IA
          </div>
        </div>

        {/* Bottom : stats highlights */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', gap: '36px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#a78bfa' }}>62 %</div>
              <div style={{ fontSize: '12px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '1px' }}>taux ouverture</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#a78bfa' }}>8,4 %</div>
              <div style={{ fontSize: '12px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '1px' }}>taux réponse</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#a78bfa' }}>47 %</div>
              <div style={{ fontSize: '12px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '1px' }}>sans email pro</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#a78bfa' }}>1,20 €</div>
              <div style={{ fontSize: '12px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '1px' }}>coût / email</div>
            </div>
          </div>
          <div style={{ fontSize: '18px', color: '#71717a' }}>volia.fr/etude</div>
        </div>
      </div>
    ),
    { ...size }
  );
}

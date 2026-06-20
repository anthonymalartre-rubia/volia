// OG image dédiée à /produits/autopilot.
// Sans ce fichier, la page redéfinit metadata.openGraph (titre + description)
// sans image → LinkedIn/réseaux affichent un placeholder gris. On génère donc
// une image de partage 1200×630 à la charte Volia (dégradé violet + fusée).

import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Volia Autopilot — Ta prospection en pilote automatique (à partir de 19 €/mois, plan Gratuit sans carte bancaire)';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #08080c 0%, #1a1a2e 50%, #16162a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Halos dégradés */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '520px',
            height: '520px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-160px',
            left: '-60px',
            width: '440px',
            height: '440px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 55%, #ec4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="34" height="34" viewBox="0 0 24 24" style={{ display: 'block', transform: 'rotate(-45deg)' }} fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
              <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
              <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
              <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
            </svg>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '36px', fontWeight: 700, color: 'white' }}>Volia</span>
            <span style={{ fontSize: '24px', fontWeight: 600, color: '#a78bfa' }}>Autopilot</span>
          </div>
        </div>

        {/* Titre */}
        <div
          style={{
            fontSize: '56px',
            fontWeight: 700,
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.15,
            maxWidth: '900px',
            marginBottom: '24px',
          }}
        >
          Ta prospection. En pilote automatique.
        </div>

        {/* Sous-titre */}
        <div
          style={{
            fontSize: '24px',
            color: '#a1a1aa',
            textAlign: 'center',
            maxWidth: '760px',
            lineHeight: 1.5,
            marginBottom: '40px',
          }}
        >
          Volia trouve les entreprises, écrit l'email, qualifie, score et livre les leads chauds dans ton CRM. Toi, tu valides et tu signes.
        </div>

        {/* Badges pipeline */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {[
            { label: 'Scrap ciblé', color: '#a78bfa' },
            { label: 'Email personnalisé', color: '#6366f1' },
            { label: 'Leads chauds → CRM', color: '#22c55e' },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
              }}
            >
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }} />
              <span style={{ fontSize: '16px', color: '#d4d4d8' }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Prix */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '18px',
            color: '#a78bfa',
            fontWeight: 600,
          }}
        >
          À partir de 19 €/mois — plan Gratuit à vie, sans carte bancaire
        </div>
      </div>
    ),
    { ...size }
  );
}

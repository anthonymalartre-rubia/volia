import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Volia.fr — Générateur email + téléphone B2B France (à partir de 19 €/mois)';
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
        {/* Background gradient circles */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-150px',
            left: '-50px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '40px',
          }}
        >
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
            {/* 🚀 Fusée Lucide tournée -45° — match hero animation */}
            <svg width="34" height="34" viewBox="0 0 24 24" style={{ display: 'block', transform: 'rotate(-45deg)' }} fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
              <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
              <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
              <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
            </svg>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '36px', fontWeight: 700, color: 'white' }}>
              Volia
            </span>
            <span style={{ fontSize: '24px', fontWeight: 600, color: '#a78bfa' }}>
              .fr
            </span>
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '48px',
            fontWeight: 700,
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.2,
            maxWidth: '900px',
            marginBottom: '24px',
          }}
        >
          Trouvez emails et téléphones B2B en 30 secondes
        </div>

        {/* Subtitle — aligné avec le pivot 80/20 (générateur lead B2B) */}
        <div
          style={{
            fontSize: '22px',
            color: '#a1a1aa',
            textAlign: 'center',
            maxWidth: '700px',
            lineHeight: 1.5,
            marginBottom: '40px',
          }}
        >
          Le générateur de leads B2B français. 150+ categories, 101 departements.
        </div>

        {/* Stats badges — focus lead gen (email + téléphone scrappés) */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {[
            { label: 'Email vérifié', color: '#22c55e' },
            { label: 'Téléphone fixe + mobile', color: '#eab308' },
            { label: 'Scoring confiance', color: '#a78bfa' },
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
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: item.color,
                }}
              />
              <span style={{ fontSize: '16px', color: '#d4d4d8' }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Price */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '18px',
            color: '#a78bfa',
            fontWeight: 600,
          }}
        >
          A partir de 19 €/mois — le moins cher du marche francais
        </div>
      </div>
    ),
    { ...size }
  );
}

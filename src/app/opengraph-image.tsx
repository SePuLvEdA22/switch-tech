import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';

export const alt = 'Switch&Tech — Cargadores, fundas y termos';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#EDF0EF',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 80,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: '#142322',
          }}
        >
          Switch&Tech
        </div>
        <div
          style={{
            fontSize: 28,
            marginTop: 16,
            color: '#4B5856',
            fontWeight: 400,
          }}
        >
          Cargadores, fundas y termos con envío a toda Colombia
        </div>
        <div
          style={{
            marginTop: 40,
            display: 'flex',
            gap: 16,
          }}
        >
          {['Fundas', 'Cargadores', 'Termos', 'Personalizados'].map(
            (cat) => (
              <div
                key={cat}
                style={{
                  padding: '8px 24px',
                  borderRadius: 999,
                  background: '#0F4C4A',
                  color: '#FFFFFF',
                  fontSize: 18,
                }}
              >
                {cat}
              </div>
            ),
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}

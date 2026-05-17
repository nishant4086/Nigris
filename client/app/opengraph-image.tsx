import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Nigris — Ship APIs, Databases & Authentication Instantly';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #09090b 0%, #18181b 100%)',
          border: '4px solid #3b82f6',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#09090b',
              borderRadius: '20px',
              border: '4px solid #3b82f6',
              color: '#3b82f6',
              fontSize: '50px',
              fontWeight: 900,
              marginRight: '24px',
            }}
          >
            N
          </div>
          <span style={{ fontSize: '64px', fontWeight: 900, color: '#ffffff' }}>Nigris Platform</span>
        </div>
        <h1
          style={{
            fontSize: '72px',
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.1,
            marginBottom: '32px',
          }}
        >
          Ship APIs, Databases & Auth Instantly.
        </h1>
        <p style={{ fontSize: '36px', color: '#a1a1aa', maxWidth: '900px' }}>
          The complete backend infrastructure for modern SaaS. Dynamic schemas, key management, usage metering, and Stripe billing.
        </p>
      </div>
    ),
    { ...size }
  );
}

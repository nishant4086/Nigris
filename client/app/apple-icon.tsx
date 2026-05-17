import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #09090b 0%, #18181b 100%)',
          borderRadius: '24%',
          border: '8px solid #3b82f6',
          color: '#3b82f6',
          fontSize: 120,
          fontWeight: 900,
          fontFamily: 'sans-serif',
        }}
      >
        N
      </div>
    ),
    { ...size }
  );
}

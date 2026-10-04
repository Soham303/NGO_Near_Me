import { NextRequest, NextResponse } from 'next/server';
import { SEED_SCORE_SNAPSHOTS } from '@/lib/seedData';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug;
  const snapshot = SEED_SCORE_SNAPSHOTS.find((s) => s.hotel_slug === slug) || SEED_SCORE_SNAPSHOTS[0];

  const hotelName = snapshot.hotel_name || 'Verified Hotel';
  const mealsRescued = snapshot.portions_rescued || 1420;
  const tier = (snapshot.tier || 'forest').toUpperCase();
  const score = snapshot.composite || 94.2;

  // Render SVG badge
  const svg = `
<svg width="320" height="110" viewBox="0 0 320 110" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="320" height="110" rx="12" fill="#FAFAF7" stroke="#E4E7EC" stroke-width="2"/>
  <rect x="0" y="0" width="8" height="110" rx="4" fill="#2E7D32"/>
  
  <!-- Header -->
  <text x="24" y="28" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="11" font-weight="700" fill="#667085" letter-spacing="1">FOODRESCUE VERIFIED</text>
  <circle cx="160" cy="24" r="3" fill="#2E7D32"/>
  <text x="170" y="28" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="11" font-weight="700" fill="#2E7D32">${tier} TIER</text>
  
  <!-- Venue Name -->
  <text x="24" y="52" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="15" font-weight="800" fill="#1F2933">${hotelName.length > 28 ? hotelName.substring(0, 26) + '...' : hotelName}</text>
  
  <!-- Stats -->
  <text x="24" y="86" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="22" font-weight="900" fill="#2E7D32">${mealsRescued.toLocaleString()}</text>
  <text x="24" y="100" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="10" font-weight="600" fill="#667085">EDIBLE MEALS RESCUED</text>
  
  <text x="220" y="86" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="22" font-weight="900" fill="#1F2933">${score}</text>
  <text x="220" y="100" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="10" font-weight="600" fill="#667085">RESCUE SCORE</text>
</svg>
`;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=300',
    },
  });
}

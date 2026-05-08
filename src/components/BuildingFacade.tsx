import type { Apartment } from '../models/Apartment';

interface Props {
  apartments: Apartment[];
}

const FONT = "'Helvetica Neue', Arial, sans-serif";
const MAX_LEVELS = 20;

// Building geometry
const BX = 80, BY = 20;
const BW = 320;
const ROOF_H = 14;
const FH = 27; // px per floor
const BH = ROOF_H + MAX_LEVELS * FH; // 554px
const VIEW_H = BY + BH + 44;

const WIN_COLS = [0.14, 0.37, 0.63, 0.86];
const WIN_W = 26, WIN_H = FH - 11;

export function BuildingFacade({ apartments }: Props) {
  const aptMap = new Map(apartments.map(a => [a.apartmentId, a]));

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 480 ${VIEW_H}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block' }}
      aria-label="Building facade"
    >
      {/* Background */}
      <rect width="480" height={VIEW_H} fill="#f9fafb"/>

      {/* Shadow */}
      <rect x={BX+6} y={BY+6} width={BW} height={BH} rx="3" fill="rgba(0,0,0,0.07)"/>

      {/* Building body */}
      <rect x={BX} y={BY} width={BW} height={BH} rx="3" fill="#e5e7eb" stroke="#6b7280" strokeWidth="1.5"/>

      {/* Roof cap */}
      <rect x={BX} y={BY} width={BW} height={ROOF_H} rx="3" fill="#9ca3af"/>
      <rect x={BX} y={BY+ROOF_H-2} width={BW} height={2} fill="#6b7280"/>
      {/* Rooftop details */}
      <rect x={BX+BW/2-28} y={BY-8} width={56} height={10} rx="2" fill="#9ca3af" stroke="#6b7280" strokeWidth="0.8"/>
      <rect x={BX+18} y={BY-5} width={18} height={7} rx="1" fill="#9ca3af" stroke="#6b7280" strokeWidth="0.7"/>

      {/* 20 floor bands — visual only */}
      {Array.from({ length: MAX_LEVELS }, (_, idx) => {
        const level = idx + 1;
        const y = BY + ROOF_H + idx * FH;
        const hasApt = aptMap.has(level);

        return (
          <g key={level}>
            {/* Floor background */}
            <rect
              x={BX} y={y} width={BW} height={FH}
              fill={hasApt ? '#d1d5db' : '#f3f4f6'}
            />

            {/* Windows */}
            {hasApt && WIN_COLS.map((fc, wi) => {
              const wx = BX + fc * BW - WIN_W / 2;
              const wy = y + 6;
              const lit = (level * 7 + wi) % 4 !== 0;
              return (
                <rect key={wi}
                  x={wx} y={wy} width={WIN_W} height={WIN_H} rx="1"
                  fill={lit ? '#b0b8c4' : '#9ca3af'}
                  stroke="#6b7280" strokeWidth="0.4"
                />
              );
            })}

            {/* Spandrel */}
            <rect x={BX} y={y+FH-5} width={BW} height={5} fill="#c0c8d0"/>

            {/* Floor separator */}
            <line x1={BX} y1={y+FH} x2={BX+BW} y2={y+FH} stroke="#9ca3af" strokeWidth="0.4"/>
          </g>
        );
      })}

      {/* Building outline on top */}
      <rect x={BX} y={BY} width={BW} height={BH} rx="3"
        fill="none" stroke="#6b7280" strokeWidth="1.5"/>

      {/* Building name plaque — centred in the facade */}
      {(() => {
        const px = BX + BW / 2 - 100, py = BY + BH / 2 - 22;
        const pw = 200, ph = 44;
        return (
          <g>
            {/* Plaque body */}
            <rect x={px} y={py} width={pw} height={ph} rx="6" fill="#1f2937"/>
            {/* CI-green accent left strip */}
            <rect x={px} y={py} width={4} height={ph} rx="6" fill="#A6CE39"/>
            <rect x={px+4} y={py} width={2} height={ph} fill="#A6CE39"/>
            {/* Main label */}
            <text
              x={px + 22} y={py + 15}
              dominantBaseline="middle"
              fontFamily={FONT} fontSize="11" fontWeight="700"
              letterSpacing="2" fill="#ffffff"
            >
              350 QUEEN STREET
            </text>
            {/* Sub-label */}
            <text
              x={px + 22} y={py + 32}
              dominantBaseline="middle"
              fontFamily={FONT} fontSize="9" fontWeight="400"
              letterSpacing="1" fill="#9ca3af"
            >
              Melbourne CBD
            </text>
          </g>
        );
      })()}

      {/* Ground line */}
      <line x1={BX-20} y1={BY+BH} x2={BX+BW+20} y2={BY+BH}
        stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/>

      {/* Hint */}
      <text x="240" y={BY+BH+28}
        textAnchor="middle" fontFamily={FONT} fontSize="9" fill="#9ca3af" letterSpacing="0.5">
        {apartments.length > 0 ? '350 Queen Street · Melbourne' : 'add a suite to get started'}
      </text>
    </svg>
  );
}

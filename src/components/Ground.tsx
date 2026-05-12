import { useMatchStore } from '../store/matchStore';
import { fieldPositions } from '../data/matchData';

interface GroundProps {
  compact?: boolean;
  reviewMode?: boolean;
  fanPlacements?: string[];
  actualPlacements?: string[];
  matchedPositions?: string[];
  overNumber?: number;
}

export default function Ground({
  compact = false,
  reviewMode = false,
  fanPlacements: externalFan,
  actualPlacements: externalActual,
  matchedPositions: externalMatched,
}: GroundProps) {
  const store = useMatchStore();
  const internalFan = store.fanPlacements;
  const fanPlacements = externalFan ?? internalFan;
  const actualPlacements = externalActual ?? [];
  const matchedPositions = externalMatched ?? [];

  const size = compact ? 300 : Math.min(400, typeof window !== 'undefined' ? window.innerWidth - 40 : 400);
  const viewBox = '0 0 400 420';

  const canPlace = !reviewMode && store.phase === 'predict';
  const isReveal = reviewMode || store.phase === 'reveal' || store.phase === 'result';

  const placedPositions = fanPlacements
    .map((name) => fieldPositions.find((p) => p.name === name))
    .filter(Boolean);

  return (
    <div className="flex justify-center select-none touch-none">
      <svg
        viewBox={viewBox}
        width={compact ? 300 : size}
        height={(compact ? 300 : size) * 1.05}
        className={canPlace ? 'cursor-pointer' : ''}
      >
        <defs>
          <radialGradient id="groundGrad2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1a3a1a" />
            <stop offset="60%" stopColor="#0d2815" />
            <stop offset="100%" stopColor="#081a0d" />
          </radialGradient>
          <radialGradient id="floodlight2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,255,157,0.08)" />
            <stop offset="100%" stopColor="rgba(0,255,157,0)" />
          </radialGradient>
          <filter id="glow-yellow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-green">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ground oval */}
        <ellipse cx="200" cy="210" rx="180" ry="190" fill="url(#groundGrad2)" />
        <ellipse cx="200" cy="210" rx="180" ry="190" fill="none" stroke="rgba(0,255,157,0.08)" strokeWidth="1" />

        {/* 30-yard circle */}
        <ellipse cx="200" cy="210" rx="120" ry="125" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeDasharray="4 4" />

        {/* Pitch */}
        <rect x="185" y="165" width="30" height="90" fill="#C4A35A" rx="2" opacity={0.9} />
        <line x1="185" y1="175" x2="215" y2="175" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
        <line x1="185" y1="245" x2="215" y2="245" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />

        {/* Stumps */}
        <rect x="192" y="165" width="16" height="3" fill="#d4a574" rx="0.5" />
        <rect x="192" y="243" width="16" height="3" fill="#d4a574" rx="0.5" />

        {/* Floodlights */}
        {!compact && (
          <>
            {[[30, 30], [370, 30], [30, 390], [370, 390]].map(([fx, fy], i) => (
              <g key={i}>
                <circle cx={fx} cy={fy} r="25" fill="url(#floodlight2)">
                  <animate attributeName="r" values="22;28;22" dur="3s" repeatCount="indefinite" begin={`${i * 0.8}s`} />
                </circle>
                <rect x={fx - 3} y={fy - 12} width="6" height="24" fill="rgba(0,255,157,0.15)" rx="1" />
              </g>
            ))}
          </>
        )}

        {/* Watermark */}
        <text
          x="200" y="215"
          textAnchor="middle"
          dominantBaseline="central"
          fill="rgba(0,255,157,0.04)"
          fontFamily="Orbitron, sans-serif"
          fontSize="22"
          fontWeight="900"
          letterSpacing="4"
        >
          TACTIQ
        </text>

        {/* Wicketkeeper */}
        <g>
          <circle cx="200" cy="270" r={compact ? 8 : 12} fill="#FFD700" opacity={0.85} />
          <text x="200" y="271" textAnchor="middle" dominantBaseline="central" fill="#000" fontSize={compact ? 6 : 8} fontWeight="bold" fontFamily="Orbitron">WK</text>
        </g>
        {!compact && (
          <text x="200" y="258" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="6" fontFamily="Outfit">WICKETKEEPER</text>
        )}

        {/* Bowler */}
        <g>
          <circle cx="200" cy="165" r={compact ? 8 : 12} fill="white" opacity={0.85} />
          <text x="200" y="166" textAnchor="middle" dominantBaseline="central" fill="#000" fontSize={compact ? 6 : 8} fontWeight="bold" fontFamily="Orbitron">B</text>
        </g>
        {!compact && (
          <text x="200" y="153" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="6" fontFamily="Outfit">BOWLER</text>
        )}

        {/* Empty position slots */}
        {fieldPositions.map((pos) => {
          const isPlaced = fanPlacements.includes(pos.name);
          if (isPlaced) return null;
          return (
            <g
              key={pos.name}
              onClick={() => { if (canPlace) useMatchStore.getState().placeFielder(pos.name); }}
              style={{ cursor: canPlace ? 'pointer' : 'default' }}
            >
              <circle
                cx={pos.x}
                cy={pos.y}
                r={compact ? 6 : 8}
                fill="rgba(255,255,255,0.04)"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={1}
              />
              {!compact && (
                <title>{pos.name}</title>
              )}
            </g>
          );
        })}

        {/* Placed fan fielders */}
        {placedPositions.map((pos, idx) => {
          if (!pos) return null;
          if (isReveal) return null;
          const isLast = idx === placedPositions.length - 1;
          return (
            <g
              key={`placed-${pos.name}`}
              onClick={() => { if (canPlace) useMatchStore.getState().placeFielder(pos.name); }}
              style={{ cursor: canPlace ? 'pointer' : 'default' }}
            >
              <circle cx={pos.x} cy={pos.y} r={compact ? 8 : 11} fill="#00FF9D" opacity={0.85} />
              {isLast && (
                <circle cx={pos.x} cy={pos.y} r={compact ? 11 : 14} fill="none" stroke="#00FF9D" strokeWidth="1.5" opacity={0.4}>
                  <animate attributeName="r" values={`${compact ? 11 : 14};${compact ? 14 : 18};${compact ? 11 : 14}`} dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0;0.4" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
              <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="central" fill="#050816" fontSize={compact ? 6 : 8} fontWeight="bold" fontFamily="Orbitron">
                {idx + 1}
              </text>
            </g>
          );
        })}

        {/* Captain placements on reveal */}
        {isReveal && actualPlacements.map((name) => {
          const pos = fieldPositions.find((p) => p.name === name);
          if (!pos) return null;
          const isMatched = matchedPositions.includes(name);
          const isFanPlaced = fanPlacements.includes(name);

          if (isMatched) {
            return (
              <g key={`match-${name}`}>
                <circle cx={pos.x} cy={pos.y} r={compact ? 8 : 11} fill="#FFD700" opacity={0.9} filter="url(#glow-yellow)" />
                <circle cx={pos.x} cy={pos.y} r={compact ? 11 : 14} fill="none" stroke="#FFD700" strokeWidth="1.5" opacity={0.4}>
                  <animate attributeName="r" values={`${compact ? 11 : 14};${compact ? 14 : 18};${compact ? 11 : 14}`} dur="1.5s" repeatCount="indefinite" />
                </circle>
                <text x={pos.x} y={pos.y + 0.5} textAnchor="middle" dominantBaseline="central" fill="#050816" fontSize={compact ? 7 : 9} fontWeight="bold">★</text>
              </g>
            );
          }

          return (
            <g key={`cap-${name}`}>
              <circle cx={pos.x} cy={pos.y} r={compact ? 8 : 11} fill={isFanPlaced ? '#FFD700' : '#FF6B35'} opacity={0.8} />
              <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="central" fill="#000" fontSize={compact ? 6 : 8} fontWeight="bold">
                {isFanPlaced ? '★' : 'C'}
              </text>
            </g>
          );
        })}

        {/* Labels */}
        {!compact && (
          <>
            <text x="200" y="15" textAnchor="middle" fill="rgba(0,255,157,0.25)" fontSize="8" fontFamily="Orbitron" letterSpacing="2">TACTIQ ARENA</text>
            {canPlace && (
              <text x="200" y="405" textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="7" fontFamily="Outfit">Tap positions to place fielders</text>
            )}
          </>
        )}
      </svg>
    </div>
  );
}

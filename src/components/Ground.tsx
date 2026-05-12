import { motion, AnimatePresence } from 'framer-motion';
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Ground({
  compact = false,
  reviewMode = false,
  fanPlacements: externalFan,
  actualPlacements: externalActual,
  matchedPositions: externalMatched,
  overNumber: externalOver,
}: GroundProps) {
  const store = useMatchStore();
  const fanPlacements = externalFan ?? store.fanPlacements;
  const actualPlacements = externalActual ?? [];
  const matchedPositions = externalMatched ?? [];

  const size = compact ? 300 : 400;
  const viewBox = '0 0 400 420';

  const canPlace = !reviewMode && store.phase === 'predict';
  const phase = store.phase;
  const isReveal = phase === 'reveal' || phase === 'result' || reviewMode;

  const sorted = [...fieldPositions].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex justify-center">
      <svg
        viewBox={viewBox}
        width={size}
        height={size * 1.05}
        className={canPlace ? 'cursor-pointer' : ''}
      >
        <defs>
          <radialGradient id="groundGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1a3a1a" />
            <stop offset="70%" stopColor="#0d2815" />
            <stop offset="100%" stopColor="#081a0d" />
          </radialGradient>
          <radialGradient id="floodlight" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          {!compact && (
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          )}
        </defs>

        {/* Outer oval */}
        <ellipse cx="200" cy="210" rx="180" ry="190" fill="url(#groundGrad)" />

        {/* 30-yard circle */}
        <ellipse cx="200" cy="210" rx="120" ry="125" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="4 4" />

        {/* Powerplay arc */}
        {externalOver !== undefined && externalOver <= 6 && (
          <ellipse cx="200" cy="210" rx="120" ry="125" fill="none" stroke="rgba(0,255,135,0.3)" strokeWidth="3" strokeDasharray="8 4" />
        )}

        {/* Pitch */}
        <rect x="185" y="165" width="30" height="90" fill="#C4A35A" rx="2" />
        <line x1="185" y1="175" x2="215" y2="175" stroke="white" strokeWidth="1" opacity="0.6" />
        <line x1="185" y1="245" x2="215" y2="245" stroke="white" strokeWidth="1" opacity="0.6" />

        {/* Stumps */}
        <rect x="192" y="165" width="16" height="3" fill="#d4a574" rx="0.5" />
        <rect x="192" y="243" width="16" height="3" fill="#d4a574" rx="0.5" />

        {/* Floodlights */}
        {!compact && (
          <>
            {[
              [30, 30],
              [370, 30],
              [30, 390],
              [370, 390],
            ].map(([fx, fy], i) => (
              <g key={i}>
                <circle cx={fx} cy={fy} r="25" fill="url(#floodlight)">
                  <animate attributeName="r" values="22;28;22" dur="3s" repeatCount="indefinite" />
                </circle>
                <rect x={fx - 3} y={fy - 12} width="6" height="24" fill="rgba(255,255,255,0.3)" rx="1" />
              </g>
            ))}
          </>
        )}

        {/* Watermark */}
        <text
          x="200" y="215"
          textAnchor="middle"
          dominantBaseline="central"
          fill="rgba(255,255,255,0.04)"
          fontFamily="Orbitron, sans-serif"
          fontSize="24"
          fontWeight="900"
          letterSpacing="4"
        >
          WANKHEDE
        </text>

        {/* Wicketkeeper - gold */}
        <g>
          <circle cx="200" cy="270" r={compact ? 8 : 12} fill="#FFD700" opacity={0.9} />
          <text x="200" y="271" textAnchor="middle" dominantBaseline="central" fill="#000" fontSize={compact ? 7 : 9} fontWeight="bold">WK</text>
        </g>
        {!compact && (
          <text x="200" y="258" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="6" fontFamily="Outfit">WICKETKEEPER</text>
        )}

        {/* Bowler - white */}
        <g>
          <circle cx="200" cy="165" r={compact ? 8 : 12} fill="white" opacity={0.9} />
          <text x="200" y="166" textAnchor="middle" dominantBaseline="central" fill="#000" fontSize={compact ? 7 : 9} fontWeight="bold">B</text>
        </g>
        {!compact && (
          <text x="200" y="153" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="6" fontFamily="Outfit">BOWLER</text>
        )}

        {/* Position slots */}
        {sorted.map((pos) => {
          const isPlaced = fanPlacements.includes(pos.name);
          if (isPlaced && !reviewMode) return null;

          return (
            <g
              key={pos.name}
              onClick={() => {
                if (canPlace) {
                  useMatchStore.getState().placeFielder(pos.name);
                }
              }}
              style={{ cursor: canPlace ? 'pointer' : 'default' }}
            >
              <circle
                cx={pos.x}
                cy={pos.y}
                r={compact ? 8 : 10}
                fill={isPlaced ? '#00FF87' : 'rgba(255,255,255,0.08)'}
                stroke={isPlaced ? '#00FF87' : 'rgba(255,255,255,0.15)'}
                strokeWidth={1.5}
                className={canPlace && !isPlaced ? 'hover:stroke-white hover:opacity-80 transition-all' : ''}
              />
              {!compact && !isPlaced && (
                <title>{pos.name}</title>
              )}
            </g>
          );
        })}

        {/* Fan's placed tokens */}
        <AnimatePresence>
          {fanPlacements.map((name, idx) => {
            const pos = fieldPositions.find((p) => p.name === name);
            if (!pos) return null;
            if (reviewMode || phase === 'reveal' || phase === 'result') return null;
            return (
              <motion.g
                key={name}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                onClick={() => canPlace && useMatchStore.getState().placeFielder(name)}
                style={{ cursor: canPlace ? 'pointer' : 'default' }}
              >
                <circle cx={pos.x} cy={pos.y} r={compact ? 8 : 12} fill="#00FF87" opacity={0.9} />
                {idx === fanPlacements.length - 1 && (
                  <circle cx={pos.x} cy={pos.y} r={compact ? 11 : 15} fill="none" stroke="#00FF87" strokeWidth="2" opacity={0.5}>
                    <animate attributeName="r" values={`${compact ? 11 : 15};${compact ? 15 : 20};${compact ? 11 : 15}`} dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0;0.5" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                )}
                <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="central" fill="#000" fontSize={compact ? 7 : 9} fontWeight="bold">
                  {idx + 1}
                </text>
              </motion.g>
            );
          })}
        </AnimatePresence>

        {/* Captain placements on reveal */}
        {isReveal && actualPlacements.map((name) => {
          const pos = fieldPositions.find((p) => p.name === name);
          if (!pos) return null;
          const isMatched = matchedPositions.includes(name);
          const isFanPlaced = fanPlacements.includes(name);

          if (isMatched) return null; // handled by matched rendering above

          return (
            <motion.g
              key={`cap-${name}`}
              initial={{ x: 200, y: 210, scale: 0 }}
              animate={{ x: 0, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20, delay: actualPlacements.indexOf(name) * 0.06 }}
            >
              <circle cx={pos.x} cy={pos.y} r={compact ? 8 : 12} fill={isFanPlaced ? '#FFD700' : '#FF6B00'} opacity={0.8} />
              <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="central" fill="#000" fontSize={compact ? 7 : 9} fontWeight="bold">
                {isFanPlaced ? '★' : 'C'}
              </text>
            </motion.g>
          );
        })}

        {/* Matched (gold) */}
        {isReveal && matchedPositions.map((name) => {
          const pos = fieldPositions.find((p) => p.name === name);
          if (!pos) return null;
          return (
            <motion.g
              key={`match-${name}`}
              initial={{ x: 200, y: 210, scale: 0 }}
              animate={{ x: 0, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20, delay: matchedPositions.indexOf(name) * 0.06 }}
            >
              <circle cx={pos.x} cy={pos.y} r={compact ? 8 : 12} fill="#FFD700" opacity={0.9} filter={!compact ? 'url(#glow)' : undefined} />
              <circle cx={pos.x} cy={pos.y} r={compact ? 11 : 15} fill="none" stroke="#FFD700" strokeWidth="1.5" opacity={0.5}>
                <animate attributeName="r" values={`${compact ? 11 : 15};${compact ? 15 : 20};${compact ? 11 : 15}`} dur="1.5s" repeatCount="indefinite" />
              </circle>
              {/* Star burst */}
              {!compact && (
                <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="central" fill="#000" fontSize={10} fontWeight="bold">★</text>
              )}
              {compact && (
                <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="central" fill="#000" fontSize={7} fontWeight="bold">★</text>
              )}
            </motion.g>
          );
        })}

        {/* Labels */}
        {!compact && (
          <>
            <text x="200" y="15" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="Orbitron" letterSpacing="2">WANKHEDE STADIUM</text>
            <text x="200" y="405" textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="7" fontFamily="Outfit">Tap positions to place fielders</text>
          </>
        )}
      </svg>
    </div>
  );
}

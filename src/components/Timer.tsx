import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useMatchStore } from '../store/matchStore';

export default function Timer() {
  const phase = useMatchStore((s) => s.phase);
  const [timeLeft, setTimeLeft] = useState(30);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase !== 'predict') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          const store = useMatchStore.getState();
          const hasValid = store.fanPlacements.length === 9 && store.selectedBowler !== null;
          if (hasValid) {
            store.submitPrediction();
          } else {
            store.timeoutSubmit();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase]);

  const pct = timeLeft / 30;
  const circumference = 2 * Math.PI * 48;
  const dashOffset = circumference * (1 - pct);

  const color =
    timeLeft > 15 ? '#00FF9D' :
    timeLeft > 8 ? '#FFD700' :
    '#FF3B5C';

  const glowColor =
    timeLeft > 15 ? 'rgba(0,255,157,0.3)' :
    timeLeft > 8 ? 'rgba(255,215,0,0.3)' :
    'rgba(255,59,92,0.5)';

  return (
    <div className="glass-panel p-5 flex flex-col items-center">
      <div className="relative w-28 h-28 flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: timeLeft <= 8 ? `0 0 30px ${glowColor}` : 'none',
            transition: 'box-shadow 0.5s ease',
          }}
        />

        <svg className="absolute inset-0 w-28 h-28 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
          <circle
            cx="60" cy="60" r="48"
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease',
              filter: `drop-shadow(0 0 8px ${glowColor})`,
            }}
          />
        </svg>

        <motion.span
          key={timeLeft}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="font-orbitron text-3xl font-bold z-10"
          style={{ color, transition: 'color 0.3s' }}
        >
          {timeLeft}
        </motion.span>
      </div>

      <p
        className="font-orbitron text-[10px] tracking-[0.15em] mt-3"
        style={{ color: timeLeft <= 8 ? '#FF3B5C' : '#8899AA', transition: 'color 0.5s' }}
      >
        {timeLeft <= 8 ? 'HURRY UP!' : 'SECONDS TO DECIDE'}
      </p>
    </div>
  );
}

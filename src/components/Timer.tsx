import { useEffect, useState } from 'react';
import { useMatchStore } from '../store/matchStore';

export default function Timer() {
  const { phase, submitPrediction } = useMatchStore();
  const [timeLeft, setTimeLeft] = useState(30);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (phase === 'predict' && !started) {
      setStarted(true);
      setTimeLeft(30);
    }
    if (phase !== 'predict') {
      setStarted(false);
      setTimeLeft(30);
    }
  }, [phase, started]);

  useEffect(() => {
    if (!started || phase !== 'predict') return;
    if (timeLeft <= 0) {
      submitPrediction();
      return;
    }
    const id = setTimeout(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, started, phase, submitPrediction]);

  const pct = timeLeft / 30;
  const color =
    timeLeft > 15
      ? '#00FF87'
      : timeLeft > 5
        ? '#FF6B00'
        : '#FF3B5C';

  return (
    <div className="bg-bg-card border border-white/10 rounded-xl p-6 flex flex-col items-center">
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg className="absolute inset-0 w-28 h-28 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
          <circle
            cx="60" cy="60" r="52"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={`${pct * 326.7} 326.7`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s linear, stroke 0.3s' }}
          />
        </svg>
        <span
          className="font-orbitron text-3xl font-bold z-10"
          style={{ color, transition: 'color 0.3s' }}
        >
          {timeLeft}
        </span>
      </div>
      <p className="font-orbitron text-[10px] text-text-muted tracking-widest mt-3">SECONDS TO DECIDE</p>
    </div>
  );
}

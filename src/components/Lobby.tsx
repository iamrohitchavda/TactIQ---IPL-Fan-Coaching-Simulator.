import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useMatchStore } from '../store/matchStore';
import { matchInfo } from '../data/matchData';

export default function Lobby() {
  const { setPhase, liveCounter, setLiveCounter } = useMatchStore();
  const [waitingCounter, setWaitingCounter] = useState(2341);

  useEffect(() => {
    const interval = setInterval(() => {
      setWaitingCounter((p) => Math.min(2800, Math.max(2100, p + Math.floor(Math.random() * 60) - 30)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCounter(liveCounter + Math.floor(Math.random() * 60) - 30);
    }, 4000);
    return () => clearInterval(interval);
  }, [liveCounter, setLiveCounter]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-bg-primary">
      {/* Light beams */}
      <div className="absolute top-0 left-0 w-[40%] h-[60%] bg-gradient-to-r from-white/5 to-transparent skew-x-12 -translate-x-1/4 animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute top-0 right-0 w-[40%] h-[60%] bg-gradient-to-l from-white/5 to-transparent -skew-x-12 translate-x-1/4 animate-pulse" style={{ animationDuration: '5s' }} />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col items-center gap-8 px-4"
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <svg className="w-10 h-10 animate-spin-slow" viewBox="0 0 40 40" style={{ animation: 'spin 4s linear infinite' }}>
            <circle cx="20" cy="20" r="18" fill="none" stroke="#00FF87" strokeWidth="2" />
            <path d="M20 4 Q28 14 20 20 Q12 26 20 36" fill="none" stroke="#00FF87" strokeWidth="2" />
            <path d="M20 4 Q12 14 20 20 Q28 26 20 36" fill="none" stroke="#FFD700" strokeWidth="1.5" />
          </svg>
          <h1
            className="font-orbitron text-6xl font-black tracking-wider"
            style={{ textShadow: '0 0 30px rgba(0,255,135,0.5), 0 0 60px rgba(0,255,135,0.3)' }}
          >
            Tact<span className="text-accent-green">IQ</span>
          </h1>
        </div>

        <p className="font-outfit text-xl text-text-muted tracking-widest uppercase">Be the Captain. Outsmart the Game.</p>

        {/* Match card */}
        <div className="w-full max-w-md backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
          <div className="flex items-center justify-center gap-4 mb-3">
            <span className="font-orbitron text-2xl font-bold text-accent-blue">{matchInfo.team1}</span>
            <span className="text-text-muted text-lg">vs</span>
            <span className="font-orbitron text-2xl font-bold text-accent-red">{matchInfo.team2}</span>
          </div>
          <p className="font-outfit text-text-muted">{matchInfo.venue}</p>
          <p className="font-outfit text-text-muted text-sm">{matchInfo.time}</p>
          <p className="font-outfit text-accent-green text-sm mt-2">
            {waitingCounter.toLocaleString()} fans waiting
          </p>
        </div>

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setPhase('matchSelect')}
          className="px-10 py-4 bg-accent-green/20 border border-accent-green text-accent-green font-orbitron font-bold text-lg rounded-xl hover:bg-accent-green/30 transition-all tracking-wider"
        >
          ENTER AS COACH
        </motion.button>
      </motion.div>

      {/* Bottom crowd bars */}
      <div className="absolute bottom-6 flex items-end gap-1 h-16 w-full max-w-xl px-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-accent-green/30 rounded-t"
            style={{
              height: `${30 + Math.sin(Date.now() / 1000 + i) * 20 + Math.random() * 20}%`,
              animation: `pulse 1.5s ${i * 0.1}s ease-in-out infinite`,
              opacity: 0.3 + Math.random() * 0.4,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

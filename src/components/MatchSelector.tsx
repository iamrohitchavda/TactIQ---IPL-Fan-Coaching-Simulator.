import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMatchStore } from '../store/matchStore';

export default function MatchSelector() {
  const { setPhase, matchTitle, matchContext } = useMatchStore();

  useEffect(() => {
    // Match data is already loaded into the store by Lobby.
    // Just advance to login after a brief loading animation.
    const timer = setTimeout(() => setPhase('login'), 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const team1 = matchContext?.team1.short || '?';
  const team2 = matchContext?.team2.short || '?';
  const display = matchTitle || `${team1} vs ${team2}`;

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center gap-2 mb-4">
          <span className="w-2 h-2 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
          <span className="w-2 h-2 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="font-orbitron text-xs text-accent-green tracking-wider">LOADING MATCH</p>
          <p className="font-outfit text-sm text-text-muted mt-1">{display} • IPL 2026</p>
          <div className="mt-4 w-48 h-1 bg-white/[0.06] rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-accent-green rounded-full animate-progress-bar" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

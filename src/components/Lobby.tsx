import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { useMatchStore } from "../store/matchStore";
import { matchInfo } from "../data/matchData";

function useCounter(
  initial: number,
  min: number,
  max: number,
  interval: number,
) {
  const [value, setValue] = useState(initial);
  useEffect(() => {
    const id = setInterval(() => {
      setValue((prev) =>
        Math.min(
          max,
          Math.max(min, prev + Math.floor(Math.random() * 60) - 30),
        ),
      );
    }, interval);
    return () => clearInterval(id);
  }, [min, max, interval]);
  return value;
}

export default function Lobby() {
  const { setPhase } = useMatchStore();
  const waitingCount = useCounter(2341, 2100, 2800, 3000);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
    },
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-bg-primary">
      {/* Ambient grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,255,157,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,157,0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Glowing orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent-green/5 rounded-full blur-[120px] animate-breathing" />
      <div
        className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent-cyan/5 rounded-full blur-[120px] animate-breathing"
        style={{ animationDelay: "1.5s" }}
      />

      {/* Light beams */}
      <div className="absolute top-0 left-0 w-[35%] h-[55%] bg-gradient-to-r from-white/[0.03] to-transparent skew-x-12 -translate-x-1/4" />
      <div className="absolute top-0 right-0 w-[35%] h-[55%] bg-gradient-to-l from-white/[0.03] to-transparent -skew-x-12 translate-x-1/4" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center gap-8 px-4"
      >
        {/* Logo */}
        <motion.div variants={itemVariants} className="flex items-center gap-3">
          <svg
            className="w-12 h-12"
            viewBox="0 0 40 40"
            style={{ animation: "spin 4s linear infinite" }}
          >
            <circle
              cx="20"
              cy="20"
              r="18"
              fill="none"
              stroke="#00FF9D"
              strokeWidth="2"
            />
            <path
              d="M20 4 Q28 14 20 20 Q12 26 20 36"
              fill="none"
              stroke="#00FF9D"
              strokeWidth="2"
            />
            <path
              d="M20 4 Q12 14 20 20 Q28 26 20 36"
              fill="none"
              stroke="#00D9FF"
              strokeWidth="1.5"
            />
          </svg>
          <h1
            className="font-orbitron text-5xl sm:text-6xl font-black tracking-wider text-white"
            style={{
              textShadow:
                "0 0 30px rgba(0,255,157,0.4), 0 0 60px rgba(0,255,157,0.15)",
            }}
          >
            Tact<span className="text-accent-green">IQ</span>
          </h1>
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="font-outfit text-base sm:text-lg text-text-muted tracking-[0.2em] uppercase"
        >
          Be the Captain. Outsmart the Game.
        </motion.p>

        {/* Match card */}
        <motion.div
          variants={itemVariants}
          className="w-full max-w-md glass-panel p-6 sm:p-8 text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex flex-col items-center">
              <span className="font-orbitron text-xl sm:text-2xl font-bold text-accent-cyan">
                {matchInfo.team1}
              </span>
              <span className="font-outfit text-[10px] text-text-muted mt-0.5">
                {matchInfo.team1Full}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-text-dim text-sm font-orbitron">VS</span>
              <div className="h-8 w-px bg-white/[0.06]" />
            </div>
            <div className="flex flex-col items-center">
              <span className="font-orbitron text-xl sm:text-2xl font-bold text-accent-red">
                {matchInfo.team2}
              </span>
              <span className="font-outfit text-[10px] text-text-muted mt-0.5">
                {matchInfo.team2Full}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="font-outfit text-xs text-text-muted">
              {matchInfo.venue}
            </p>
            <p className="font-outfit text-xs text-text-muted">
              {matchInfo.time}
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-white/[0.06]">
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-accent-green rounded-full animate-pulse" />
              <p className="font-outfit text-xs text-accent-green">
                <span className="tabular-nums">
                  {waitingCount.toLocaleString()}
                </span>{" "}
                fans waiting
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div variants={itemVariants}>
          <motion.button
            whileHover={{
              scale: 1.03,
              boxShadow: "0 0 30px rgba(0,255,157,0.25)",
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setPhase("matchSelect")}
            className="esports-button px-10 py-4 bg-accent-green/10 border border-accent-green/40 text-accent-green font-orbitron font-bold text-lg rounded-2xl hover:bg-accent-green/20 transition-all tracking-[0.15em]"
          >
            ENTER AS COACH
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Bottom crowd bars */}
      <div className="absolute bottom-6 flex items-end gap-[3px] h-16 w-full max-w-xl px-4 opacity-40">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-accent-green/40 rounded-t-sm animate-pulse"
            style={{
              height: `${15 + (i % 5) * 8 + (i % 3) * 5}%`,
              opacity: 0.15 + (i % 8) * 0.04,
              animationDelay: `${i * 0.15}s`,
              transition: "height 0.5s ease",
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

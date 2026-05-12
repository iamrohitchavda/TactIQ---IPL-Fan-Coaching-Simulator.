import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMatchStore } from '../store/matchStore';
import { matchInfo } from '../data/matchData';

export default function Login() {
  const { setUser, matchContext } = useMatchStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSubmit = () => {
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!validateEmail(email.trim())) errs.email = 'Enter a valid email address';
    if (!password.trim()) errs.password = 'Password is required';
    else if (password.length < 4) errs.password = 'At least 4 characters';
    if (!username.trim()) errs.username = 'Username is required';

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    const user = { email: email.trim(), username: username.trim(), password: password.trim() };
    localStorage.setItem('tactiq_user', JSON.stringify(user));
    setUser(user);
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-3.5 bg-white/[0.04] border rounded-xl text-white font-outfit text-sm placeholder:text-text-dim/60 focus:outline-none focus:border-accent-green/50 transition-all duration-300 ${
      errors[field] ? 'border-accent-red/50' : 'border-white/[0.06]'
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md"
      >
        {/* Header branding */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="font-orbitron text-sm font-bold text-accent-green">TactIQ</span>
            <span className="px-2 py-0.5 bg-accent-green/15 text-accent-green text-[9px] font-orbitron rounded-full border border-accent-green/30">IPL 2026</span>
          </div>
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="flex flex-col items-center">
              <span className="font-orbitron text-lg font-bold text-white">{matchContext?.team1.short || matchInfo.team1}</span>
              <span className="font-outfit text-[9px] text-text-muted">{matchContext?.team1.name || matchInfo.team1Full}</span>
            </div>
            <span className="text-text-dim text-xs font-orbitron">VS</span>
            <div className="flex flex-col items-center">
              <span className="font-orbitron text-lg font-bold text-white">{matchContext?.team2.short || matchInfo.team2}</span>
              <span className="font-outfit text-[9px] text-text-muted">{matchContext?.team2.name || matchInfo.team2Full}</span>
            </div>
          </div>
          <p className="font-outfit text-[10px] text-text-muted mt-1">{matchInfo.venue}</p>
          <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-gradient-to-r from-accent-gold/15 to-accent-gold/5 border border-accent-gold/20">
            <span className="text-[11px]">👑</span>
            <span className="font-orbitron text-[10px] text-accent-gold font-bold tracking-wide">PAT CUMMINS (C)</span>
          </div>
        </div>

        {/* Login card */}
        <div className="glass-panel p-6 sm:p-8">
          <div className="space-y-4">
            <div>
              <label className="block font-outfit text-xs text-text-muted mb-1.5 tracking-wider uppercase">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors({}); }}
                placeholder="you@example.com"
                className={inputClass('email')}
              />
              {errors.email && <p className="text-accent-red text-[11px] font-outfit mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block font-outfit text-xs text-text-muted mb-1.5 tracking-wider uppercase">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors({}); }}
                placeholder="Your password"
                className={inputClass('password')}
              />
              {errors.password && <p className="text-accent-red text-[11px] font-outfit mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block font-outfit text-xs text-text-muted mb-1.5 tracking-wider uppercase">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setErrors({}); }}
                placeholder="Your fan name"
                className={inputClass('username')}
              />
              {errors.username && <p className="text-accent-red text-[11px] font-outfit mt-1">{errors.username}</p>}
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-4 bg-accent-green/10 border border-accent-green/40 text-accent-green font-orbitron font-bold rounded-xl hover:bg-accent-green/20 transition-all tracking-[0.1em] text-sm disabled:opacity-50"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                  <span className="w-1.5 h-1.5 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                </span>
              ) : (
                'ENTER THE ARENA'
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

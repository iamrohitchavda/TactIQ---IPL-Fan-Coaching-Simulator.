import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMatchStore } from '../store/matchStore';

export default function Login() {
  const { setUser, matchContext } = useMatchStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; username?: string }>({});

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSubmit = () => {
    const errs: typeof errors = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!validateEmail(email.trim())) errs.email = 'Enter a valid email address';
    if (!password.trim()) errs.password = 'Password is required';
    else if (password.length < 4) errs.password = 'Password must be at least 4 characters';
    if (!username.trim()) errs.username = 'Username is required';

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const user = { email: email.trim(), username: username.trim(), password: password.trim() };
    localStorage.setItem('tactiq_user', JSON.stringify(user));
    setUser(user);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-bg-primary px-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-bg-card border border-white/10 rounded-2xl p-8"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <h2 className="font-orbitron text-2xl font-bold text-accent-green">TactIQ</h2>
        </div>
        {matchContext && (
          <p className="text-center font-outfit text-xs text-text-muted mb-6">
            Coaching: {matchContext.team1.short} vs {matchContext.team2.short}
          </p>
        )}

        <div className="space-y-4">
          <div>
            <label className="block font-outfit text-sm text-text-muted mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors({}); }}
              placeholder="you@example.com"
              className={`w-full px-4 py-3 bg-bg-elevated border rounded-xl text-white font-outfit placeholder:text-text-muted/50 focus:outline-none focus:border-accent-green transition-colors ${
                errors.email ? 'border-accent-red' : 'border-white/10'
              }`}
            />
            {errors.email && <p className="text-accent-red text-xs font-outfit mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block font-outfit text-sm text-text-muted mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors({}); }}
              placeholder="Your password"
              className={`w-full px-4 py-3 bg-bg-elevated border rounded-xl text-white font-outfit placeholder:text-text-muted/50 focus:outline-none focus:border-accent-green transition-colors ${
                errors.password ? 'border-accent-red' : 'border-white/10'
              }`}
            />
            {errors.password && <p className="text-accent-red text-xs font-outfit mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block font-outfit text-sm text-text-muted mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setErrors({}); }}
              placeholder="Your fan name"
              className={`w-full px-4 py-3 bg-bg-elevated border rounded-xl text-white font-outfit placeholder:text-text-muted/50 focus:outline-none focus:border-accent-green transition-colors ${
                errors.username ? 'border-accent-red' : 'border-white/10'
              }`}
            />
            {errors.username && <p className="text-accent-red text-xs font-outfit mt-1">{errors.username}</p>}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            className="w-full py-4 bg-accent-green/20 border border-accent-green text-accent-green font-orbitron font-bold rounded-xl hover:bg-accent-green/30 transition-all tracking-wider mt-2"
          >
            ENTER AS FAN
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

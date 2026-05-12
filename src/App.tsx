import { AnimatePresence, motion } from 'framer-motion';
import { useMatchStore } from './store/matchStore';
import Lobby from './components/Lobby';
import Login from './components/Login';
import MatchSelector from './components/MatchSelector';
import MatchDashboard from './components/MatchDashboard';
import MatchSummary from './components/MatchSummary';

export default function App() {
  const { phase } = useMatchStore();

  return (
    <AnimatePresence mode="wait">
      {phase === 'lobby' && (
        <motion.div
          key="lobby"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Lobby />
        </motion.div>
      )}
      {phase === 'matchSelect' && (
        <motion.div
          key="matchSelect"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <MatchSelector />
        </motion.div>
      )}
      {phase === 'login' && (
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Login />
        </motion.div>
      )}
      {(phase === 'predict' || phase === 'submitted' || phase === 'reveal' || phase === 'result') && (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <MatchDashboard />
        </motion.div>
      )}
      {phase === 'summary' && (
        <motion.div
          key="summary"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <MatchSummary />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

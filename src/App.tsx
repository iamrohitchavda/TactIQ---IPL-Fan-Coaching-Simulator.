import { AnimatePresence, motion, type Transition } from "framer-motion";
import { useMatchStore } from "./store/matchStore";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Lobby from "./components/Lobby";
import Login from "./components/Login";
import MatchSelector from "./components/MatchSelector";
import MatchDashboard from "./components/MatchDashboard";
import MatchSummary from "./components/MatchSummary";

const pageVariants = {
  initial: { opacity: 0, y: 30, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.98 },
};

const pageTransition: Transition = { duration: 0.35, ease: [0.4, 0, 0.2, 1] };

const pages: Record<string, React.ReactNode> = {
  lobby: <Lobby />,
  matchSelect: <MatchSelector />,
  login: <Login />,
};

export default function App() {
  const { phase } = useMatchStore();
  const isDashboard = ["predict", "submitted", "reveal", "result"].includes(
    phase,
  );
  const showSummary = phase === "summary";

  const pageContent = pages[phase] || null;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-bg-primary">
        <AnimatePresence mode="wait">
          {pageContent && (
            <motion.div
              key={phase}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              {pageContent}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {isDashboard && (
            <motion.div
              key="dashboard"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <MatchDashboard />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {showSummary && (
            <motion.div
              key="summary"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <MatchSummary />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}

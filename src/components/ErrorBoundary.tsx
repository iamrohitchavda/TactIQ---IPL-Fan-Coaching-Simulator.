import { Component, type ReactNode, type ErrorInfo } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <div className="text-5xl mb-4">⚠</div>
            <h2 className="font-orbitron text-xl text-accent-red mb-2">Something went wrong</h2>
            <p className="font-outfit text-sm text-text-muted mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-8 py-3 bg-accent-green/20 border border-accent-green text-accent-green font-orbitron text-sm font-bold rounded-xl hover:bg-accent-green/30 transition-all"
            >
              RELOAD APP
            </button>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

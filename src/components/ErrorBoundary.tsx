import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 sm:p-12 my-6 rounded-3xl bg-slate-900/90 border border-rose-500/30 backdrop-blur-xl shadow-2xl text-center space-y-4 max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h2 className="text-lg font-bold text-white">
            {this.props.fallbackTitle || 'Something went wrong'}
          </h2>

          <p className="text-slate-400 text-xs leading-relaxed">
            An unexpected error occurred while rendering this section. You can try refreshing or resetting the view.
          </p>

          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-left font-mono text-[11px] text-rose-300 overflow-x-auto max-h-32">
              {this.state.error.message}
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-500/20 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

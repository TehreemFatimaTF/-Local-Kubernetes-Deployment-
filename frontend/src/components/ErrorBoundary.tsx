'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-light-bg-secondary dark:bg-dark-bg-primary flex items-center justify-center p-4">
          <div className="max-w-md w-full card-3d p-8 animate-scale-in">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-fade-in">
                ⚠️
              </div>
              <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
                Oops! Something went wrong
              </h1>
              <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
                We encountered an unexpected error. Don't worry, your data is safe.
              </p>
              {this.state.error && (
                <div className="bg-error-light/10 dark:bg-error-dark/10 border border-error-light/50 dark:border-error-dark/50 text-error-light dark:text-error-dark px-4 py-3 rounded-xl mb-6 text-left">
                  <p className="font-mono text-sm break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              <div className="flex flex-col gap-3">
                <button
                  onClick={this.handleReset}
                  className="btn-primary w-full py-3"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="btn-secondary w-full py-3"
                >
                  Go to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'Something went wrong.';
      
      try {
        // Check if it's a Firestore JSON error
        const message = this.state.error?.message;
        if (message && message.startsWith('{')) {
          const firestoreError = JSON.parse(message);
          if (firestoreError.error && firestoreError.operationType) {
            errorMessage = `Database Error: ${firestoreError.error} during ${firestoreError.operationType} on ${firestoreError.path}`;
          }
        } else {
          errorMessage = message || errorMessage;
        }
      } catch {
        // Not a JSON error or parsing failed
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
          <div className="rounded-3xl bg-white p-8 shadow-xl border border-gray-100 max-w-md">
            <h2 className="text-2xl font-black text-primary">Oops!</h2>
            <p className="mt-4 text-gray-600">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 rounded-2xl bg-primary px-6 py-3 font-bold text-white hover:bg-primary/90 transition-all"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

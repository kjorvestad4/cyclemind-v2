import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CycleMind app error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="max-w-sm text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <span className="text-3xl">🌙</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-serif font-bold text-foreground">Something went wrong</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We're sorry — an unexpected error occurred. Your data is safe and securely stored.
              </p>
            </div>
            <button
              onClick={this.handleReload}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              Back to Dashboard
            </button>
            <p className="text-xs text-muted-foreground">
              If this keeps happening, please contact{' '}
              <a href="mailto:hello@cyclemind.app" className="text-primary underline">hello@cyclemind.app</a>
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
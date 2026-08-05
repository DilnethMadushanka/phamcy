import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App crashed:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
          fontFamily: 'sans-serif',
          padding: '2rem'
        }}>
          <div style={{
            maxWidth: '600px',
            background: 'white',
            border: '1px solid #fee2e2',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
          }}>
            <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>⚠️ Application Error</h2>
            <p style={{ color: '#64748b', marginBottom: '1rem' }}>
              The application encountered an error. Check the browser console for details.
            </p>
            <details style={{ background: '#f1f5f9', borderRadius: '8px', padding: '1rem' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: '#374151' }}>
                Error Details
              </summary>
              <pre style={{ 
                marginTop: '0.75rem', 
                fontSize: '12px', 
                overflow: 'auto',
                color: '#dc2626',
                whiteSpace: 'pre-wrap'
              }}>
                {this.state.error && this.state.error.toString()}
                {'\n\n'}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1.5rem',
                background: '#0284c7',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
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

export default ErrorBoundary;

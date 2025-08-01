import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <h2>Something went wrong</h2>
            <p>An unexpected error occurred. Please try refreshing the page.</p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ whiteSpace: 'pre-wrap' }}>
                <summary>Error Details</summary>
                {this.state.error.toString()}
                <br />
                {this.state.errorInfo.componentStack}
              </details>
            )}
            <button 
              onClick={() => window.location.reload()}
              className="error-reload-btn"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary 
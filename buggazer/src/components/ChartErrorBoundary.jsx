import { Component } from 'react';

// Fallback UI for charts
function ChartFallback({ errorCounts }) {
  return (
    <div style={{
      background: 'rgba(239,68,68,0.05)',
      border: '1px solid rgba(239,68,68,0.2)',
      borderRadius: '12px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px',
      gap: '12px',
    }}>
      <div style={{ fontSize: '32px' }}>📊</div>
      <div style={{ fontSize: '15px', fontWeight: '600', color: '#f87171' }}>Chart failed to render</div>
      <div style={{ fontSize: '13px', color: '#9ca3af', textAlign: 'center', maxWidth: '300px' }}>
        There was an error loading the chart. Here's a text summary instead:
      </div>
      {errorCounts && (
        <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#f87171' }}>{errorCounts.critical}</div>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>Critical</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#fbbf24' }}>{errorCounts.warning}</div>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>Warning</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#60a5fa' }}>{errorCounts.info}</div>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>Info</div>
          </div>
        </div>
      )}
    </div>
  );
}

// Error boundary class component (required for error boundaries in React)
export class ChartErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.warn('Chart render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return <ChartFallback errorCounts={this.props.errorCounts} />;
    }
    return this.props.children;
  }
}

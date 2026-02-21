'use client'

export default function GlobalError({ error, reset }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0A0A0F',
      color: '#E5E7EB',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '480px', padding: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>Something went wrong</div>
        <p style={{ color: '#9CA3AF', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
          An unexpected error occurred. Our team has been notified.
        </p>
        <button
          onClick={() => reset()}
          style={{
            background: '#10B981',
            color: '#fff',
            border: 'none',
            padding: '0.75rem 2rem',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            cursor: 'pointer',
            marginRight: '1rem',
          }}
        >
          Try again
        </button>
        <a
          href="/"
          style={{
            color: '#10B981',
            textDecoration: 'none',
            fontSize: '1rem',
          }}
        >
          Go home
        </a>
        {process.env.NODE_ENV !== 'production' && (
          <pre style={{
            marginTop: '2rem',
            padding: '1rem',
            background: '#1F2937',
            borderRadius: '0.5rem',
            fontSize: '0.8rem',
            textAlign: 'left',
            overflow: 'auto',
            color: '#F87171',
          }}>
            {error?.message}
          </pre>
        )}
      </div>
    </div>
  )
}

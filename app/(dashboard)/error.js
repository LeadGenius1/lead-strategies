'use client'

export default function DashboardError({ error, reset }) {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#E5E7EB',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '480px', padding: '2rem' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: '600' }}>
          Dashboard Error
        </div>
        <p style={{ color: '#9CA3AF', marginBottom: '1.5rem' }}>
          Something went wrong loading this page. Your data is safe.
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
          href="/dashboard"
          style={{
            color: '#10B981',
            textDecoration: 'none',
            fontSize: '1rem',
          }}
        >
          Back to dashboard
        </a>
        {process.env.NODE_ENV !== 'production' && error?.message && (
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
            {error.message}
          </pre>
        )}
      </div>
    </div>
  )
}

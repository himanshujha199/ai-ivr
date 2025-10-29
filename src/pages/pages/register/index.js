import Link from 'next/link'

const DisabledRegistration = () => {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
        padding: '2rem'
      }}
    >
      <div
        style={{
          maxWidth: '420px',
          background: '#fff',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 12px 24px rgba(15, 23, 42, 0.12)',
          textAlign: 'center',
          lineHeight: 1.6
        }}
      >
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Account Creation Closed</h1>
        <p style={{ marginBottom: '1.5rem', color: '#555' }}>
          New account creation has been turned off. The product is now solely focused on delivering the best voice
          conversation experience.
        </p>
        <Link
          href='/voice-calling'
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            background: '#111827',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 600,
            transition: 'background 0.2s ease'
          }}
        >
          Explore Voice Console
        </Link>
      </div>
    </main>
  )
}

export default DisabledRegistration

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="text-8xl mb-6">🤔</div>
        <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Hmm, can't find that page
        </h1>
        <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
          Looks like this page doesn't exist or moved. No worries - let me help you get where you need to go.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href="/"
            className="btn-primary inline-block"
          >
            Take me home
          </Link>
          <Link
            href="/deep-study"
            className="btn-secondary inline-block"
          >
            Go to Deep Study
          </Link>
          <Link
            href="/prayer"
            className="btn-secondary inline-block"
          >
            Prayer Center
          </Link>
        </div>

        <div className="mt-8 p-6 rounded-xl" style={{
          backgroundColor: 'var(--card-bg)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--card-border)'
        }}>
          <p className="text-sm italic" style={{ color: 'var(--text-secondary)' }}>
            💡 Quick thought: Sometimes we end up in places we didn't expect. That's okay. God's got you, even here.
          </p>
        </div>
      </div>
    </div>
  );
}

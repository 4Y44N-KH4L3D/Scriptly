import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'
import { supabase } from './lib/supabase'

type Script = { title: string; description: string; language: string; code: string; author: string; likes: number }

const scripts: Script[] = [
  { title: 'Fetch JSON safely', description: 'A small async helper for fetching JSON with useful error handling.', language: 'JavaScript', author: 'ayaan', likes: 24, code: `async function fetchJson(url) {\n  const response = await fetch(url)\n\n  if (!response.ok) {\n    throw new Error(\`HTTP \${response.status}\`)\n  }\n\n  return response.json()\n}` },
]

const languages = ['All languages', 'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Rust', 'Go', 'HTML', 'CSS', 'PHP', 'Ruby', 'Kotlin', 'Swift', 'Bash', 'SQL', 'Other']

type SortOption = 'latest' | 'popular' | 'az'

function Icon({ name }: { name: 'search' | 'home' | 'settings' | 'user' | 'heart' | 'copy' | 'download' | 'flag' | 'x' }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 5 5" /></>,
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9" /><path d="M9 20v-6h6v6" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.7 1.7-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V22h-2.4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L6 19l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H4v-2.4h.8a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L6 10.6l1.7-1.7.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V7H14v.7a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.7 1.7-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0-1.6 1h.1V16h-.6a1.7 1.7 0 0 0-1.6-1Z" /></>,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
    heart: <path d="M20.8 8.7c0 5.2-8.8 10.2-8.8 10.2S3.2 13.9 3.2 8.7A4.7 4.7 0 0 1 12 6a4.7 4.7 0 0 1 8.8 2.7Z" />,
    copy: <><rect x="8" y="8" width="11" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2" /></>,
    download: <><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></>,
    flag: <><path d="M5 21V4" /><path d="M5 5c5-3 8 3 14 0v9c-6 3-9-3-14 0" /></>,
    x: <><path d="m6 6 12 12" /><path d="m18 6-12 12" /></>,
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

function go(path: string) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function AuthPage({ mode }: { mode: 'signin' | 'signup' }) {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError('')
    if (mode === 'signup') {
      if (!/^[A-Za-z0-9_-]{3,20}$/.test(username)) return setError('Username must be 3–20 characters and use only letters, numbers, _ or -.')
      if (password.length < 8 || !/[0-9]/.test(password)) return setError('Password must be at least 8 characters and include a number.')
      if (password !== confirmPassword) return setError('Passwords do not match.')
    }
    if (!email.includes('@')) return setError('Enter a valid email address.')
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password, options: { data: { username }, emailRedirectTo: `${window.location.origin}/verify-email` } })
        if (signUpError) throw signUpError
        if (data.session && data.user) {
          await supabase.from('profiles').upsert({ id: data.user.id, username, bio: '', trust_score: 0 }, { onConflict: 'id' })
          go('/')
        } else {
          window.sessionStorage.setItem('scriptly_verify_email', email); go('/verify-email')
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
        go('/')
      }
    } catch (err) { setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.') }
    finally { setLoading(false) }
  }

  return <div className="auth-page-shell"><div className="auth-page-card">
    <button className="auth-back-button" onClick={() => go('/')} aria-label="Back to home">← <span>Back</span></button>
    <button className="auth-page-brand" onClick={() => go('/')}><span className="brand-mark">S</span><span>Scriptly</span></button>
    <div className="auth-page-icon">S</div>
    <h1>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h1>
    <p className="auth-page-subtitle">{mode === 'signin' ? 'Sign in to publish scripts and manage your profile.' : 'Join Scriptly and start sharing your code.'}</p>
    <div className="auth-page-tabs"><button className={mode === 'signin' ? 'selected' : ''} onClick={() => go('/signin')}>Sign in</button><button className={mode === 'signup' ? 'selected' : ''} onClick={() => go('/signup')}>Sign up</button></div>
    <form onSubmit={handleSubmit} className="auth-page-form">
      {mode === 'signup' && <label>Username<input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="your_username" maxLength={20} autoComplete="username" required /><small>3–20 characters · letters, numbers, _ or -</small></label>}
      <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required /></label>
      <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === 'signup' ? '8+ characters, including a number' : 'Your password'} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required /></label>
      {mode === 'signup' && <label>Confirm password<input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat your password" autoComplete="new-password" required /></label>}
      {error && <div className="auth-page-error">{error}</div>}
      <button className="auth-page-submit" disabled={loading}>{loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}</button>
    </form>
    {mode === 'signin' && <button className="forgot-button" type="button">Forgot password?</button>}
    <p className="auth-page-switch">{mode === 'signin' ? 'New to Scriptly?' : 'Already have an account?'} <button onClick={() => go(mode === 'signin' ? '/signup' : '/signin')}>{mode === 'signin' ? 'Create an account' : 'Sign in'}</button></p>
  </div></div>
}

function VerifyEmailPage() {
  const [email, setEmail] = useState(() => window.sessionStorage.getItem('scriptly_verify_email') ?? '')
  const [message, setMessage] = useState('')
  const [resending, setResending] = useState(false)
  const [verified, setVerified] = useState(false)
  useEffect(() => { supabase.auth.getSession().then(({ data }) => { if (data.session?.user.email_confirmed_at) setVerified(true) }) }, [])
  const resend = async () => {
    if (!email) return setMessage('Enter the email you used to create your account.')
    setResending(true); setMessage('')
    const { error } = await supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: `${window.location.origin}/verify-email` } })
    setMessage(error ? error.message : 'Verification email sent. Check your inbox again.')
    setResending(false)
  }
  return <div className="auth-page-shell"><div className="auth-page-card verify-card">
    <button className="auth-back-button" onClick={() => go('/')} aria-label="Back to home">← <span>Back</span></button>
    <button className="auth-page-brand" onClick={() => go('/')}><span className="brand-mark">S</span><span>Scriptly</span></button>
    <div className="verify-icon">✓</div>
    <h1>{verified ? 'Email verified' : 'Check your email'}</h1>
    <p className="auth-page-subtitle">{verified ? 'Your email is verified. You can now sign in to Scriptly.' : 'We sent a verification link to your email. Open it to verify your Scriptly account.'}</p>
    {!verified && <><label className="verify-email-label">Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></label><button className="auth-page-submit" onClick={resend} disabled={resending}>{resending ? 'Sending…' : 'Resend verification email'}</button>{message && <div className="auth-page-info">{message}</div>}</>}
    <button className="auth-page-secondary" onClick={() => go('/signin')}>Go to sign in</button>
  </div></div>
}

function App() {
  const [path, setPath] = useState(window.location.pathname)
  const [dark, setDark] = useState(false)
  const [query, setQuery] = useState('')
  const [liked, setLiked] = useState<Record<string, boolean>>({})
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [sort, setSort] = useState<SortOption>('latest')
  const [language, setLanguage] = useState('All languages')

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    supabase.auth.getSession().then(({ data }) => setUserEmail(data.session?.user.email ?? null))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUserEmail(session?.user.email ?? null))
    return () => { window.removeEventListener('popstate', onPop); listener.subscription.unsubscribe() }
  }, [])

  if (path === '/signin' || path === '/signup') return <AuthPage mode={path === '/signup' ? 'signup' : 'signin'} />
  if (path === '/verify-email') return <VerifyEmailPage />

  const signOut = async () => { await supabase.auth.signOut(); setUserEmail(null) }
  const filtered = scripts.filter((script) => `${script.title} ${script.description} ${script.language} ${script.author}`.toLowerCase().includes(query.toLowerCase()) && (language === 'All languages' || script.language === language))
  const visibleScripts = [...filtered].sort((a, b) => sort === 'popular' ? b.likes - a.likes : sort === 'az' ? a.title.localeCompare(b.title) : 0)
  const copyCode = async (code: string) => { await navigator.clipboard.writeText(code) }
  const sortLabel = sort === 'latest' ? 'Latest scripts' : sort === 'popular' ? 'Most popular' : 'A–Z'

  return <div className={`app ${dark ? 'theme-dark' : 'theme-light'}`}>
    <header className="navbar">
      <button className="brand" onClick={() => { setQuery(''); go('/') }} aria-label="Scriptly home"><span className="brand-mark">S</span><span>Scriptly</span></button>
      <div className="nav-center"><button className="nav-link active" onClick={() => go('/')}><Icon name="home" /> <span>Home</span></button><label className="search"><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search scripts..." /><kbd>/</kbd></label></div>
      <div className="nav-actions"><button className="icon-button" aria-label="Settings"><Icon name="settings" /></button>{userEmail ? <button className="profile-button signed-in" onClick={signOut} title="Sign out"><span className="avatar"><Icon name="user" /></span><span className="profile-label">{userEmail.split('@')[0]}</span></button> : <button className="profile-button" aria-label="Sign in" onClick={() => go('/signin')}><span className="avatar"><Icon name="user" /></span><span className="profile-label">Sign in</span></button>}</div>
    </header>

    <main>
      <section className="hero-section"><div className="eyebrow"><span className="pulse" /> COMMUNITY CODE LIBRARY</div><h1>Find it. <span>Build it.</span> Share it.</h1><p>Discover useful scripts, learn from other developers, and publish your own code.</p><div className="hero-actions"><button className="primary-button">Browse scripts</button><button className="secondary-button" onClick={() => go(userEmail ? '/publish' : '/signin')}>Publish a script</button></div></section>

      <section className="feed-box">
        <div className="feed-header">
          <div className="feed-title">
            <label className="feed-sort">{sortLabel}<span>⌄</span><select value={sort} onChange={(e) => setSort(e.target.value as SortOption)} aria-label="Sort scripts"><option value="latest">Latest scripts</option><option value="popular">Most popular</option><option value="az">A–Z</option></select></label>
            <p>Fresh code from the Scriptly community</p>
          </div>
          <div className="feed-filters">
            <label>Language<select value={language} onChange={(e) => setLanguage(e.target.value)}>{languages.map((item) => <option key={item}>{item}</option>)}</select></label>
          </div>
        </div>

        <section className="script-grid">
          {visibleScripts.map((script) => {
            const isLiked = liked[script.title]
            return <article className="script-card" key={script.title}>
              <div className="script-heading"><div><div className="language"><span />{script.language}</div><h3>{script.title}</h3><p>{script.description}</p></div><button className="report-button" aria-label="Report script"><Icon name="flag" /></button></div>
              <pre><code>{script.code}</code></pre>
              <div className="card-footer"><div className="author"><span className="mini-avatar">{script.author[0].toUpperCase()}</span><span>{script.author}</span></div><div className="card-actions"><button onClick={() => copyCode(script.code)}><Icon name="copy" /> Copy</button><button><Icon name="download" /> Download</button><button className={`like-button ${isLiked ? 'liked' : ''}`} aria-label={isLiked ? 'Unlike script' : 'Like script'} onClick={() => setLiked((current) => ({ ...current, [script.title]: !isLiked }))}><Icon name="heart" /> {script.likes + (isLiked ? 1 : 0)}</button></div></div>
              <button className="view-button">View in full screen <span>↗</span></button>
            </article>
          })}
        </section>
        {visibleScripts.length === 0 && <div className="empty-scripts">No scripts match those filters.</div>}
      </section>
    </main>
    <footer><span>Scriptly</span><span>Built for people who love to code.</span><button onClick={() => setDark(!dark)}>{dark ? 'Light mode' : 'Dark mode'}</button></footer>
  </div>
}

export default App

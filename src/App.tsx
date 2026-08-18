import { useState } from 'react'
import './App.css'

type Script = { title: string; description: string; language: string; code: string; author: string; likes: number }
const scripts: Script[] = [
  { title: 'Fetch JSON safely', description: 'A small async helper for fetching JSON with useful error handling.', language: 'JavaScript', author: 'ayaan', likes: 24, code: `async function fetchJson(url) {\n  const response = await fetch(url)\n\n  if (!response.ok) {\n    throw new Error(\`HTTP \${response.status}\`)\n  }\n\n  return response.json()\n}` },
  { title: 'Responsive card component', description: 'A clean CSS card that adapts smoothly from desktop to mobile.', language: 'CSS', author: 'pixeldev', likes: 17, code: `.card {\n  width: min(100%, 420px);\n  padding: 1.25rem;\n  border-radius: 18px;\n  background: #151a18;\n  color: #b8f7c9;\n  transition: transform .2s ease;\n}\n\n.card:hover {\n  transform: translateY(-3px);\n}` },
  { title: 'Python password generator', description: 'A simple example using Python’s secrets module.', language: 'Python', author: 'noura', likes: 31, code: `import secrets\nimport string\n\ndef password(length=16):\n    alphabet = string.ascii_letters + string.digits\n    return ''.join(secrets.choice(alphabet) for _ in range(length))` },
]

function Icon({ name }: { name: 'search' | 'home' | 'settings' | 'user' | 'heart' | 'copy' | 'download' | 'flag' }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 5 5" /></>,
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9" /><path d="M9 20v-6h6v6" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.7 1.7-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V22h-2.4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L6 19l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H4v-2.4h.8a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L6 10.6l1.7-1.7.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V7H14v.7a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.7 1.7-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0-1.6 1h.1V16h-.6a1.7 1.7 0 0 0-1.6-1Z" /></>,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
    heart: <path d="M20.8 8.7c0 5.2-8.8 10.2-8.8 10.2S3.2 13.9 3.2 8.7A4.7 4.7 0 0 1 12 6a4.7 4.7 0 0 1 8.8 2.7Z" />,
    copy: <><rect x="8" y="8" width="11" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2" /></>,
    download: <><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></>,
    flag: <><path d="M5 21V4" /><path d="M5 5c5-3 8 3 14 0v9c-6 3-9-3-14 0" /></>,
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

function App() {
  const [dark, setDark] = useState(false)
  const [query, setQuery] = useState('')
  const [liked, setLiked] = useState<Record<string, boolean>>({})
  const visibleScripts = scripts.filter((script) => `${script.title} ${script.description} ${script.language} ${script.author}`.toLowerCase().includes(query.toLowerCase()))
  const copyCode = async (code: string) => { await navigator.clipboard.writeText(code) }

  return <div className={`app ${dark ? 'theme-dark' : 'theme-light'}`}>
    <header className="navbar">
      <button className="brand" onClick={() => setQuery('')} aria-label="Scriptly home"><span className="brand-mark">S</span><span>Scriptly</span></button>
      <div className="nav-center"><button className="nav-link active"><Icon name="home" /> <span>Home</span></button><label className="search"><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search scripts..." /><kbd>/</kbd></label></div>
      <div className="nav-actions"><button className="icon-button" aria-label="Settings"><Icon name="settings" /></button><button className="profile-button" aria-label="Profile"><span className="avatar"><Icon name="user" /></span><span className="profile-label">Sign in</span></button></div>
    </header>
    <main>
      <section className="hero-section"><div className="eyebrow"><span className="pulse" /> COMMUNITY CODE LIBRARY</div><h1>Find it. <span>Build it.</span> Share it.</h1><p>Discover useful scripts, learn from other developers, and publish your own code.</p><div className="hero-actions"><button className="primary-button">Browse scripts</button><button className="secondary-button">Publish a script</button></div></section>
      <section className="feed-header"><div><h2>Latest scripts</h2><p>Fresh code from the Scriptly community</p></div><button className="filter-button">All languages <span>⌄</span></button></section>
      <section className="script-grid">{visibleScripts.map((script) => { const isLiked = liked[script.title]; return <article className="script-card" key={script.title}>
        <div className="script-heading"><div><div className="language"><span />{script.language}</div><h3>{script.title}</h3><p>{script.description}</p></div><button className="report-button" aria-label="Report script"><Icon name="flag" /></button></div>
        <pre><code>{script.code}</code></pre>
        <div className="card-footer"><div className="author"><span className="mini-avatar">{script.author[0].toUpperCase()}</span><span>{script.author}</span></div><div className="card-actions"><button onClick={() => copyCode(script.code)}><Icon name="copy" /> Copy</button><button><Icon name="download" /> Download</button><button className={`like-button ${isLiked ? 'liked' : ''}`} aria-label={isLiked ? 'Unlike script' : 'Like script'} onClick={() => setLiked((current) => ({ ...current, [script.title]: !isLiked }))}><Icon name="heart" /> {script.likes + (isLiked ? 1 : 0)}</button></div></div>
        <button className="view-button">View in full screen <span>↗</span></button>
      </article> })}</section>
    </main>
    <footer><span>Scriptly</span><span>Built for people who love to code.</span><button onClick={() => setDark(!dark)}>{dark ? 'Light mode' : 'Dark mode'}</button></footer>
  </div>
}

export default App

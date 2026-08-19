import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './auth.css'
import './polish.css'
import './transitions.css'
import './Settings.css'
import './navbar-fix.css'
import App from './App.tsx'
import SettingsPage from './SettingsPage.tsx'

const syncTheme = () => {
  document.documentElement.dataset.theme = 'dark'
}

syncTheme()
window.setInterval(syncTheme, 250)

document.addEventListener('click', (event) => {
  const target = event.target instanceof Element ? event.target.closest('.auth-back-button') : null
  if (!target) return

  event.preventDefault()
  event.stopImmediatePropagation()

  const navigateHome = () => {
    window.history.pushState({}, '', '/')
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  if ('startViewTransition' in document && typeof document.startViewTransition === 'function') {
    document.startViewTransition(navigateHome)
  } else {
    navigateHome()
  }
}, true)

function Root() {
  const [path, setPath] = useState(window.location.pathname)

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  if (path === '/settings') {
    return <SettingsPage onBack={() => {
      window.history.pushState({}, '', '/')
      window.dispatchEvent(new PopStateEvent('popstate'))
    }} />
  }

  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)

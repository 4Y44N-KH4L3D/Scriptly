import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './auth.css'
import './polish.css'
import './transitions.css'
import './Settings.css'
import App from './App.tsx'

// Give the dedicated auth back button a smooth SPA transition.
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

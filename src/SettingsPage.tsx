import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

type Props = { onBack: () => void }

type ToggleKey = 'reduceMotion' | 'highContrast' | 'largeControls'

const storageKey = 'scriptly_accessibility'

function SettingsPage({ onBack }: Props) {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [textScale, setTextScale] = useState(() => Number(localStorage.getItem('scriptly_text_scale') || '100'))
  const [options, setOptions] = useState<Record<ToggleKey, boolean>>(() => {
    try {
      return { reduceMotion: false, highContrast: false, largeControls: false, ...JSON.parse(localStorage.getItem(storageKey) || '{}') }
    } catch {
      return { reduceMotion: false, highContrast: false, largeControls: false }
    }
  })
  const [confirming, setConfirming] = useState<'scripts' | 'history' | 'account' | null>(null)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setUserEmail(data.session?.user.email ?? null)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setUserEmail(session?.user.email ?? null)
    })
    return () => { mounted = false; listener.subscription.unsubscribe() }
  }, [])

  useEffect(() => {
    document.documentElement.style.setProperty('--scriptly-text-scale', `${textScale / 100}`)
    localStorage.setItem('scriptly_text_scale', String(textScale))
  }, [textScale])

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(options))
    document.documentElement.classList.toggle('reduce-motion', options.reduceMotion)
    document.documentElement.classList.toggle('high-contrast', options.highContrast)
    document.documentElement.classList.toggle('large-controls', options.largeControls)
  }, [options])

  const toggle = (key: ToggleKey) => setOptions(current => ({ ...current, [key]: !current[key] }))

  const destructiveAction = (action: 'scripts' | 'history' | 'account') => {
    if (action === 'history') {
      localStorage.removeItem('scriptly_search_history')
      setNotice('Search history deleted.')
      setConfirming(null)
      return
    }

    setNotice(action === 'scripts'
      ? 'Script deletion needs the Scriptly database deletion endpoint before it can be enabled.'
      : 'Account deletion needs a secure server-side deletion endpoint before it can be enabled.')
    setConfirming(null)
  }

  const confirmationText = confirming === 'scripts'
    ? 'Delete every script you have published? This cannot be undone.'
    : confirming === 'history'
      ? 'Delete your saved search history?'
      : 'Delete your Scriptly account? This cannot be undone.'

  return <div className="settings-page-shell">
    <style>{`
      @keyframes settings-page-in{from{opacity:0;transform:translateY(18px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}
      @keyframes settings-section-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
      @keyframes settings-backdrop-in{from{opacity:0}to{opacity:1}}
      @keyframes settings-dialog-in{from{opacity:0;transform:translateY(12px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
      .settings-page-shell{--page:#0e1210;--surface:#151a17;--surface-2:#1b221e;--text:#a8b4ad;--heading:#f2f7f3;--border:#29332e;--muted:#748078;--green:#7df0a5;--green-strong:#42d879;--shadow:0 22px 60px rgba(0,0,0,.3);min-height:100vh;padding:42px 20px 80px;background:var(--page);color:var(--text);animation:settings-page-in .45s cubic-bezier(.2,.8,.2,1) both}
      .settings-page-inner{width:min(900px,100%);margin:0 auto}
      .settings-page-top{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:34px}
      .settings-page-back{display:inline-flex;align-items:center;gap:8px;padding:9px 12px;border:1px solid var(--border);border-radius:11px;background:var(--surface);color:var(--text);font-size:13px;font-weight:800;cursor:pointer;transition:.2s ease}
      .settings-page-back:hover{border-color:var(--green-strong);color:var(--heading);transform:translateX(-2px)}
      .settings-page-title{margin:0;color:var(--heading);font-size:40px;letter-spacing:-1.5px}
      .settings-page-subtitle{margin:7px 0 0;color:var(--muted);font-size:13px}
      .settings-section{margin-top:18px;overflow:hidden;border:1px solid var(--border);border-radius:20px;background:var(--surface);box-shadow:var(--shadow);animation:settings-section-in .42s cubic-bezier(.2,.8,.2,1) both;transition:border-color .2s ease,box-shadow .2s ease,transform .2s ease}
      .settings-section:nth-of-type(2){animation-delay:.06s}.settings-section:nth-of-type(3){animation-delay:.12s}
      .settings-section:hover{border-color:#35443c;box-shadow:0 26px 70px rgba(0,0,0,.34)}
      .settings-section-heading{padding:19px 22px;border-bottom:1px solid var(--border)}
      .settings-section-heading h2{margin:0;color:var(--heading);font-size:16px}.settings-section-heading p{margin:5px 0 0;color:var(--muted);font-size:12px;line-height:1.5}
      .settings-setting{display:flex;align-items:center;justify-content:space-between;gap:25px;padding:19px 22px;border-bottom:1px solid var(--border);transition:background .2s ease}.settings-setting:hover{background:color-mix(in srgb,var(--green) 3%,var(--surface))}.settings-setting:last-child{border-bottom:0}
      .settings-setting-copy{min-width:0}.settings-setting-copy strong{display:block;color:var(--heading);font-size:14px}.settings-setting-copy span{display:block;margin-top:5px;color:var(--muted);font-size:12px;line-height:1.5}
      .settings-slider{width:220px;accent-color:var(--green-strong);cursor:pointer}.settings-value{min-width:48px;color:var(--green-strong);font-size:12px;font-weight:900;text-align:right}
      .settings-toggle{position:relative;width:48px;height:28px;flex:0 0 48px;border:1px solid var(--border);border-radius:999px;background:var(--surface-2);cursor:pointer;transition:.2s ease}.settings-toggle:after{content:'';position:absolute;top:4px;left:4px;width:18px;height:18px;border-radius:50%;background:var(--muted);transition:.2s ease}.settings-toggle.on{border-color:var(--green-strong);background:color-mix(in srgb,var(--green) 18%,var(--surface-2))}.settings-toggle.on:after{left:24px;background:var(--green-strong)}
      .settings-select{min-width:150px;padding:10px 12px;border:1px solid var(--border);border-radius:11px;background:var(--surface-2);color:var(--heading);font-size:12px;font-weight:800;outline:0}.settings-select:focus{border-color:var(--green-strong)}
      .settings-account-badge{padding:9px 12px;border:1px solid var(--border);border-radius:11px;color:var(--heading);background:var(--surface-2);font-size:12px;font-weight:800}
      .settings-danger{border-color:rgba(239,68,68,.45)}.settings-danger .settings-section-heading{border-bottom-color:rgba(239,68,68,.28)}.settings-danger .settings-section-heading h2{color:#ff6b6b}.settings-danger .settings-setting{border-bottom-color:rgba(239,68,68,.18)}.settings-danger-button{padding:10px 13px;border:1px solid rgba(239,68,68,.5);border-radius:11px;background:rgba(239,68,68,.08);color:#ff7777;font-size:12px;font-weight:900;cursor:pointer;transition:.2s ease}.settings-danger-button:hover{background:rgba(239,68,68,.15);border-color:#ff6b6b;transform:translateY(-1px)}.settings-disabled{opacity:.55;cursor:not-allowed!important}
      .settings-notice{margin-top:14px;padding:12px 14px;border:1px solid var(--border);border-radius:12px;background:var(--surface);color:var(--muted);font-size:12px}
      .settings-confirm-backdrop{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:20px;background:rgba(0,0,0,.68);backdrop-filter:blur(8px);animation:settings-backdrop-in .2s ease both}.settings-confirm{width:min(430px,100%);padding:24px;border:1px solid rgba(239,68,68,.45);border-radius:18px;background:var(--surface);box-shadow:0 30px 90px rgba(0,0,0,.45);animation:settings-dialog-in .25s cubic-bezier(.2,.8,.2,1) both}.settings-confirm h3{margin:0;color:var(--heading);font-size:18px}.settings-confirm p{margin:9px 0 20px;color:var(--muted);font-size:13px;line-height:1.55}.settings-confirm-actions{display:flex;justify-content:flex-end;gap:9px}.settings-confirm-actions button{padding:9px 13px;border-radius:10px;font-size:12px;font-weight:850;cursor:pointer}.settings-cancel{border:1px solid var(--border);background:var(--surface-2);color:var(--text)}.settings-confirm-delete{border:1px solid #ff6b6b;background:rgba(239,68,68,.12);color:#ff7777}
      @media(max-width:650px){.settings-page-shell{padding:28px 12px 60px}.settings-page-title{font-size:32px}.settings-setting{align-items:flex-start;flex-direction:column;gap:14px}.settings-slider{width:100%}.settings-value{align-self:flex-end}.settings-select{width:100%}.settings-account-badge{width:100%;overflow:hidden;text-overflow:ellipsis}}
    `}</style>
    <div className="settings-page-inner">
      <div className="settings-page-top"><div><h1 className="settings-page-title">Settings</h1><p className="settings-page-subtitle">Customize your Scriptly experience.</p></div><button className="settings-page-back" onClick={onBack}>← Back</button></div>

      <section className="settings-section">
        <div className="settings-section-heading"><h2>Accessibility</h2><p>Make Scriptly easier and more comfortable to use.</p></div>
        <div className="settings-setting"><div className="settings-setting-copy"><strong>Text size</strong><span>Resize text across Scriptly.</span></div><div style={{display:'flex',alignItems:'center',gap:12}}><input className="settings-slider" type="range" min="80" max="150" step="5" value={textScale} onChange={event => setTextScale(Number(event.target.value))} aria-label="Text size"/><span className="settings-value">{textScale}%</span></div></div>
        <div className="settings-setting"><div className="settings-setting-copy"><strong>Reduce animations</strong><span>Reduce transitions and movement throughout the interface.</span></div><button className={`settings-toggle ${options.reduceMotion ? 'on' : ''}`} onClick={() => toggle('reduceMotion')} aria-label="Toggle reduced motion" aria-pressed={options.reduceMotion}/></div>
        <div className="settings-setting"><div className="settings-setting-copy"><strong>High contrast</strong><span>Increase contrast between text, borders and surfaces.</span></div><button className={`settings-toggle ${options.highContrast ? 'on' : ''}`} onClick={() => toggle('highContrast')} aria-label="Toggle high contrast" aria-pressed={options.highContrast}/></div>
        <div className="settings-setting"><div className="settings-setting-copy"><strong>Larger controls</strong><span>Make interactive controls easier to see and tap.</span></div><button className={`settings-toggle ${options.largeControls ? 'on' : ''}`} onClick={() => toggle('largeControls')} aria-label="Toggle larger controls" aria-pressed={options.largeControls}/></div>
      </section>

      {userEmail && <>
        <section className="settings-section">
          <div className="settings-section-heading"><h2>Privacy</h2><p>Control what other Scriptly users can see.</p></div>
          <div className="settings-setting"><div className="settings-setting-copy"><strong>Profile visibility</strong><span>Choose who can view your profile.</span></div><select className="settings-select" defaultValue="public"><option value="public">Public</option><option value="private">Private</option></select></div>
          <div className="settings-setting"><div className="settings-setting-copy"><strong>Show scripts on profile</strong><span>Allow your published scripts to appear on your profile.</span></div><button className="settings-toggle on" aria-label="Show scripts on profile" aria-pressed="true"/></div>
          <div className="settings-setting"><div className="settings-setting-copy"><strong>Show activity</strong><span>Allow other users to see your public activity.</span></div><button className="settings-toggle on" aria-label="Show activity" aria-pressed="true"/></div>
          <div className="settings-setting"><div className="settings-setting-copy"><strong>Account</strong><span>{userEmail}</span></div><span className="settings-account-badge">Signed in</span></div>
        </section>

        <section className="settings-section settings-danger">
          <div className="settings-section-heading"><h2>Danger Zone</h2><p>These actions can permanently remove data from your account.</p></div>
          <div className="settings-setting"><div className="settings-setting-copy"><strong>Delete all scripts</strong><span>Permanently remove scripts published by your account.</span></div><button className="settings-danger-button settings-disabled" disabled>Delete scripts</button></div>
          <div className="settings-setting"><div className="settings-setting-copy"><strong>Delete search history</strong><span>Remove your saved searches from this browser.</span></div><button className="settings-danger-button" onClick={() => setConfirming('history')}>Delete history</button></div>
          <div className="settings-setting"><div className="settings-setting-copy"><strong>Delete account</strong><span>Permanently delete your Scriptly account and associated data.</span></div><button className="settings-danger-button settings-disabled" disabled>Delete account</button></div>
        </section>
      </>}

      {notice && <div className="settings-notice">{notice}</div>}
    </div>

    {confirming && <div className="settings-confirm-backdrop" role="presentation"><div className="settings-confirm" role="dialog" aria-modal="true"><h3>Are you sure?</h3><p>{confirmationText}</p><div className="settings-confirm-actions"><button className="settings-cancel" onClick={() => setConfirming(null)}>Cancel</button><button className="settings-confirm-delete" onClick={() => destructiveAction(confirming)}>Continue</button></div></div></div>}
  </div>
}

export default SettingsPage

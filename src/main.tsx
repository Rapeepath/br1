import './lib/apiFallback'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/nunito'
import '@fontsource/mitr/400.css'
import '@fontsource/mitr/500.css'
import '@fontsource/mitr/600.css'
import '@fontsource-variable/noto-sans-thai'
import './styles/tokens.css'
import './styles/base.css'
import App from './App'
import { langOfPath } from './i18n'

// Pages arrive prerendered (scripts/prerender.mjs) for search engines and link previews; the app then
// renders afresh over that markup rather than hydrating it, since stored preferences (theme, compare list)
// legitimately differ from the build-time render.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App lang={langOfPath(window.location.pathname)} />
  </StrictMode>,
)

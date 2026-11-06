import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/nunito'
import '@fontsource/mitr/400.css'
import '@fontsource/mitr/500.css'
import '@fontsource/mitr/600.css'
import '@fontsource-variable/noto-sans-thai'
import '../styles/tokens.css'
import '../styles/base.css'
import './admin.css'
import './pos.css'
import AdminApp from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>,
)

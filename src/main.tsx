import 'tossface/dist/tossface.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { TDSMobileProvider } from '@toss/tds-mobile'
import App from './App'

const ua = navigator.userAgent
const userAgent = {
  fontA11y: undefined,
  fontScale: undefined,
  isAndroid: /Android/i.test(ua),
  isIOS: /iPhone|iPad|iPod/i.test(ua),
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TDSMobileProvider userAgent={userAgent}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </TDSMobileProvider>
  </StrictMode>,
)

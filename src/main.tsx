import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { TDSMobileProvider } from '@toss/tds-mobile'
import App from './App'

const tdsUserAgent = {
  fontA11y: undefined,
  fontScale: undefined,
  isAndroid: /Android/i.test(navigator.userAgent),
  isIOS: /iPhone|iPad|iPod/i.test(navigator.userAgent),
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TDSMobileProvider userAgent={tdsUserAgent}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </TDSMobileProvider>
  </StrictMode>,
)

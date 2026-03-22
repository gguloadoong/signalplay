import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { TDSMobileAITProvider } from '@toss/tds-mobile-ait'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TDSMobileAITProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </TDSMobileAITProvider>
  </StrictMode>,
)

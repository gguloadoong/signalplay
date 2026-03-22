import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

// TDS Provider를 동적으로 로드 — 토스 WebView 외부에서도 앱이 동작하도록
async function mount() {
  const root = createRoot(document.getElementById('root')!)

  let Provider: React.ComponentType<{ children: React.ReactNode }> | null = null

  try {
    const tds = await import('@toss/tds-mobile-ait')
    Provider = tds.TDSMobileAITProvider
  } catch {
    console.warn('[SignalPlay] TDS Provider 로드 실패 — 일반 브라우저 모드')
  }

  const app = (
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  )

  root.render(Provider ? <Provider>{app}</Provider> : app)
}

mount()

import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { BottomNav } from '@/components/shared/BottomNav'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { Onboarding } from '@/components/shared/Onboarding'
import { PageTransition } from '@/components/shared/PageTransition'
import { VotePage } from '@/pages/VotePage'
import { ResultPage } from '@/pages/ResultPage'
import './App.css'

const ONBOARDING_KEY = 'signalplay-onboarded'

function App() {
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem(ONBOARDING_KEY),
  )

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    setShowOnboarding(false)
  }

  return (
    <ErrorBoundary>
    <div className="app">
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      <main className="app-content">
        <PageTransition>
        <Routes>
          <Route path="/" element={<VotePage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </PageTransition>
      </main>
      <BottomNav />
    </div>
    </ErrorBoundary>
  )
}

export default App

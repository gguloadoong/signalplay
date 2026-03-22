import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { BottomNav } from '@/components/shared/BottomNav'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { Onboarding } from '@/components/shared/Onboarding'
import { BattlePage } from '@/pages/BattlePage'
import { FeedPage } from '@/pages/FeedPage'
import { ResultPage } from '@/pages/ResultPage'
import { RankingPage } from '@/pages/RankingPage'
import './App.css'

const ONBOARDING_KEY = 'signalplay-onboarded'

function App() {
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(ONBOARDING_KEY)) {
      setShowOnboarding(true)
    }
  }, [])

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    setShowOnboarding(false)
  }

  return (
    <ErrorBoundary>
    <div className="app">
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      <main className="app-content">
        <Routes>
          <Route path="/" element={<BattlePage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
    </ErrorBoundary>
  )
}

export default App

import { Routes, Route, Navigate } from 'react-router-dom'
import { BottomNav } from '@/components/shared/BottomNav'
import { BattlePage } from '@/pages/BattlePage'
import { FeedPage } from '@/pages/FeedPage'
import { ResultPage } from '@/pages/ResultPage'
import { RankingPage } from '@/pages/RankingPage'
import './App.css'

function App() {
  return (
    <div className="app">
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
  )
}

export default App

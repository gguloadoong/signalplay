import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { BottomNav } from '@/components/shared/BottomNav'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { PageTransition } from '@/components/shared/PageTransition'
import { VotePage } from '@/pages/VotePage'
import './App.css'

const ResultPage = lazy(() => import('@/pages/ResultPage').then((m) => ({ default: m.ResultPage })))
const CharactersPage = lazy(() => import('@/pages/CharactersPage').then((m) => ({ default: m.CharactersPage })))
const CharacterProfilePage = lazy(() => import('@/pages/CharacterProfilePage').then((m) => ({ default: m.CharacterProfilePage })))

function App() {
  return (
    <ErrorBoundary>
    <div className="app">
      <main className="app-content">
        <PageTransition>
        <Suspense>
          <Routes>
            <Route path="/" element={<VotePage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/characters" element={<CharactersPage />} />
            <Route path="/characters/:id" element={<CharacterProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        </PageTransition>
      </main>
      <BottomNav />
    </div>
    </ErrorBoundary>
  )
}

export default App

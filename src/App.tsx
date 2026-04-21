import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from './lib/firebase'
import { useAuth } from './hooks/useAuth'
import { AuthPage } from './pages/AuthPage'
import { BoardsPage } from './pages/BoardsPage'
import { BoardPage } from './pages/BoardPage'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-100">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-slate-800">Trello Clone</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{user.email}</span>
            <button
              onClick={() => signOut(auth)}
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              ログアウト
            </button>
          </div>
        </header>
        <main className="p-6">
          <Routes>
            <Route path="/" element={<BoardsPage />} />
            <Route path="/boards/:boardId" element={<BoardPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App

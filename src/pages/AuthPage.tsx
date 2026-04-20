import { useState } from 'react'
import { LoginForm } from '../features/auth/LoginForm'
import { SignUpForm } from '../features/auth/SignUpForm'

type Mode = 'login' | 'signup'

export function AuthPage() {
  const [mode, setMode] = useState<Mode>('login')

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-slate-800 mb-6 text-center">
          Trello Clone
        </h1>

        <div className="flex border-b border-slate-200 mb-6">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-center font-medium transition-colors ${
              mode === 'login'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            ログイン
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 text-center font-medium transition-colors ${
              mode === 'signup'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            新規登録
          </button>
        </div>

        {mode === 'login' ? <LoginForm /> : <SignUpForm />}
      </div>
    </div>
  )
}

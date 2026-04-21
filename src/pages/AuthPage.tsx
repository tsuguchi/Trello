import { useState } from 'react'
import { LoginForm } from '../features/auth/LoginForm'
import { SignUpForm } from '../features/auth/SignUpForm'

type Mode = 'login' | 'signup'

type Props = {
  isDark: boolean
  toggleDark: () => void
}

export function AuthPage({ isDark, toggleDark }: Props) {
  const [mode, setMode] = useState<Mode>('login')

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4 relative">
      <button
        onClick={toggleDark}
        aria-label={isDark ? 'ライトモードに切替' : 'ダークモードに切替'}
        className="absolute top-4 right-4 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
      >
        {isDark ? 'ライト' : 'ダーク'}
      </button>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 text-center">
          Trello Clone
        </h1>

        <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-center font-medium transition-colors ${
              mode === 'login'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            ログイン
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 text-center font-medium transition-colors ${
              mode === 'signup'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
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

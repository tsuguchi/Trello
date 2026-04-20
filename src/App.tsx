import { auth, db } from './lib/firebase'

function App() {
  const firebaseReady = Boolean(auth && db)
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">
          Trello Clone
        </h1>
        <div className="space-y-2 text-left">
          <p className="flex justify-between">
            <span className="text-slate-600">Tailwind CSS:</span>
            <span className="text-green-600 font-semibold">✓ 動作中</span>
          </p>
          <p className="flex justify-between">
            <span className="text-slate-600">Firebase:</span>
            <span className={firebaseReady ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
              {firebaseReady ? '✓ 初期化成功' : '✗ 初期化失敗'}
            </span>
          </p>
          <p className="flex justify-between">
            <span className="text-slate-600">Project ID:</span>
            <span className="text-slate-800 font-mono text-sm">{projectId || '未設定'}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default App

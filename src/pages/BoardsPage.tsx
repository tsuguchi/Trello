import { useState, type FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useBoards } from '../hooks/useBoards'
import { createBoard } from '../features/boards/api'
import { BoardList } from '../features/boards/BoardList'

export function BoardsPage() {
  const { user } = useAuth()
  const { boards, loading } = useBoards(user?.uid)
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!user || !title.trim()) return
    setSubmitting(true)
    try {
      await createBoard(user.uid, title.trim())
      setTitle('')
      setCreating(false)
    } finally {
      setSubmitting(false)
    }
  }

  function handleCancel() {
    setCreating(false)
    setTitle('')
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">マイボード</h1>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            新規作成
          </button>
        )}
      </div>

      {creating && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-lg shadow p-4 mb-6 flex gap-2"
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ボード名を入力"
            autoFocus
            required
            className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-slate-400"
          >
            作成
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-slate-600 hover:text-slate-900"
          >
            キャンセル
          </button>
        </form>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow p-4 animate-pulse"
            >
              <div className="h-5 bg-slate-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <BoardList boards={boards} />
      )}
    </div>
  )
}

import { useState, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteBoard } from './api'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import type { Board } from '../../types'

type Props = {
  boards: Board[]
}

export function BoardList({ boards }: Props) {
  const navigate = useNavigate()
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  function requestDelete(e: MouseEvent, boardId: string) {
    e.stopPropagation()
    setConfirmingId(boardId)
  }

  async function handleConfirmDelete() {
    if (!confirmingId) return
    const id = confirmingId
    setConfirmingId(null)
    await deleteBoard(id)
  }

  if (boards.length === 0) {
    return (
      <p className="text-slate-500 dark:text-slate-400 text-center py-8">
        まだボードがありません。作成してみましょう。
      </p>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {boards.map((board) => (
          <div
            key={board.id}
            onClick={() => navigate(`/boards/${board.id}`)}
            className="bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-md transition-shadow p-4 cursor-pointer group relative"
          >
            <h2 className="font-semibold text-slate-800 dark:text-slate-100">{board.title}</h2>
            <button
              onClick={(e) => requestDelete(e, board.id)}
              aria-label="削除"
              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {confirmingId && (
        <ConfirmDialog
          message="このボードを削除しますか？配下のリストとカードも全て削除されます。"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmingId(null)}
        />
      )}
    </>
  )
}

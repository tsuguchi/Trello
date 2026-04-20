import type { MouseEvent } from 'react'
import { deleteBoard } from './api'
import type { Board } from '../../types'

type Props = {
  boards: Board[]
  onSelect?: (boardId: string) => void
}

export function BoardList({ boards, onSelect }: Props) {
  async function handleDelete(e: MouseEvent, boardId: string) {
    e.stopPropagation()
    if (!confirm('このボードを削除しますか？')) return
    await deleteBoard(boardId)
  }

  if (boards.length === 0) {
    return (
      <p className="text-slate-500 text-center py-8">
        まだボードがありません。作成してみましょう。
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {boards.map((board) => (
        <div
          key={board.id}
          onClick={() => onSelect?.(board.id)}
          className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 cursor-pointer group relative"
        >
          <h2 className="font-semibold text-slate-800">{board.title}</h2>
          <button
            onClick={(e) => handleDelete(e, board.id)}
            aria-label="削除"
            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}

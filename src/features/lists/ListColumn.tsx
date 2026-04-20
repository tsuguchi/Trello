import { useState } from 'react'
import { deleteList, updateListTitle } from './api'
import type { List } from '../../types'

type Props = {
  boardId: string
  list: List
}

export function ListColumn({ boardId, list }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(list.title)

  function startEdit() {
    setDraft(list.title)
    setEditing(true)
  }

  async function commitEdit() {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== list.title) {
      await updateListTitle(boardId, list.id, trimmed)
    }
    setEditing(false)
  }

  async function handleDelete() {
    if (!confirm(`リスト「${list.title}」を削除しますか？`)) return
    await deleteList(boardId, list.id)
  }

  return (
    <div className="bg-slate-200 rounded-lg p-3 w-full sm:w-72 sm:flex-shrink-0 flex flex-col">
      <div className="flex items-start justify-between mb-3">
        {editing ? (
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitEdit()
              if (e.key === 'Escape') setEditing(false)
            }}
            autoFocus
            className="flex-1 px-2 py-1 rounded border border-blue-500 focus:outline-none"
          />
        ) : (
          <h3
            onClick={startEdit}
            className="font-semibold text-slate-800 px-2 py-1 cursor-pointer flex-1"
          >
            {list.title}
          </h3>
        )}
        <button
          onClick={handleDelete}
          aria-label="リスト削除"
          className="text-slate-400 hover:text-red-600 px-1 py-1"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2 mb-2 min-h-[10px]">
        {/* カードは次のフェーズで追加 */}
      </div>

      <button className="text-left text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-300 rounded px-2 py-1">
        + カードを追加
      </button>
    </div>
  )
}

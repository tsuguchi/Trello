import type { MouseEvent } from 'react'
import type { Card } from '../../types'
import { deleteCard } from './api'

type Props = {
  boardId: string
  listId: string
  card: Card
  onClick?: () => void
}

export function CardItem({ boardId, listId, card, onClick }: Props) {
  async function handleDelete(e: MouseEvent) {
    e.stopPropagation()
    if (!confirm('このカードを削除しますか？')) return
    await deleteCard(boardId, listId, card.id)
  }

  return (
    <div
      onClick={onClick}
      className="bg-white rounded shadow-sm hover:shadow p-2 cursor-pointer group relative"
    >
      {card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1">
          {card.labels.map((label) => (
            <span
              key={label.id}
              className="px-2 py-0.5 text-xs rounded-full text-white"
              style={{ backgroundColor: label.color }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}
      <p className="text-sm text-slate-800 pr-5">{card.title}</p>
      <button
        onClick={handleDelete}
        aria-label="カード削除"
        className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-xs text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        ✕
      </button>
    </div>
  )
}

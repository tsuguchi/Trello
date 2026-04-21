import { useState, type MouseEvent } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Card } from '../../types'
import { deleteCard } from './api'
import {
  formatDueDateShort,
  getDueBadgeClass,
  getDueStatus,
} from './dueDate'
import { ConfirmDialog } from '../../components/ConfirmDialog'

type Props = {
  boardId: string
  listId: string
  card: Card
  onClick?: () => void
}

export function CardItem({ boardId, listId, card, onClick }: Props) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: 'card', card, sourceListId: listId },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  function requestDelete(e: MouseEvent) {
    e.stopPropagation()
    setConfirmingDelete(true)
  }

  async function handleConfirmDelete() {
    setConfirmingDelete(false)
    await deleteCard(boardId, listId, card.id)
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={onClick}
        className="bg-white dark:bg-slate-900 rounded shadow-sm hover:shadow p-2 cursor-pointer group relative touch-none"
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
        <p className="text-sm text-slate-800 dark:text-slate-100 pr-5">{card.title}</p>
        {(card.dueDate || (card.checklist && card.checklist.length > 0)) && (
          <div className="flex flex-wrap gap-1 mt-1">
            {card.dueDate && (
              <span
                className={`inline-block px-2 py-0.5 text-xs rounded ${getDueBadgeClass(
                  getDueStatus(card.dueDate),
                )}`}
              >
                {formatDueDateShort(card.dueDate)}
              </span>
            )}
            {card.checklist && card.checklist.length > 0 && (
              <span className="inline-block px-2 py-0.5 text-xs rounded bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                ✓ {card.checklist.filter((i) => i.checked).length}/{card.checklist.length}
              </span>
            )}
          </div>
        )}
        <button
          onClick={requestDelete}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="カード削除"
          className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-xs text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          ✕
        </button>
      </div>

      {confirmingDelete && (
        <ConfirmDialog
          message="このカードを削除しますか？"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}
    </>
  )
}

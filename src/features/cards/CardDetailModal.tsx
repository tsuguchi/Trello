import { useEffect, useState } from 'react'
import { updateCard } from './api'
import {
  formatDueDateInput,
  parseDueDateInput,
} from './dueDate'
import type { Card, Label } from '../../types'

const PREDEFINED_LABELS: Label[] = [
  { id: 'red', name: '緊急', color: '#ef4444' },
  { id: 'orange', name: 'オレンジ', color: '#f97316' },
  { id: 'yellow', name: '黄', color: '#eab308' },
  { id: 'green', name: '完了', color: '#22c55e' },
  { id: 'blue', name: '進行中', color: '#3b82f6' },
  { id: 'purple', name: 'アイデア', color: '#a855f7' },
]

type Props = {
  boardId: string
  listId: string
  card: Card
  onClose: () => void
}

export function CardDetailModal({ boardId, listId, card, onClose }: Props) {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  async function saveTitle() {
    const trimmed = title.trim()
    if (trimmed && trimmed !== card.title) {
      await updateCard(boardId, listId, card.id, { title: trimmed })
    } else if (!trimmed) {
      setTitle(card.title)
    }
  }

  async function saveDescription() {
    if (description !== card.description) {
      await updateCard(boardId, listId, card.id, { description })
    }
  }

  async function toggleLabel(label: Label) {
    const hasLabel = card.labels.some((l) => l.id === label.id)
    const newLabels = hasLabel
      ? card.labels.filter((l) => l.id !== label.id)
      : [...card.labels, label]
    await updateCard(boardId, listId, card.id, { labels: newLabels })
  }

  async function changeDueDate(value: string) {
    const parsed = parseDueDateInput(value)
    await updateCard(boardId, listId, card.id, { dueDate: parsed })
  }

  async function clearDueDate() {
    await updateCard(boardId, listId, card.id, { dueDate: null })
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-start gap-2 mb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur()
            }}
            className="flex-1 text-lg font-semibold text-slate-800 px-2 py-1 rounded hover:bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            onClick={onClose}
            aria-label="閉じる"
            className="text-slate-400 hover:text-slate-600 px-2 py-1"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-semibold text-slate-600 mb-2">ラベル</h4>
          <div className="flex flex-wrap gap-2">
            {PREDEFINED_LABELS.map((label) => {
              const active = card.labels.some((l) => l.id === label.id)
              return (
                <button
                  key={label.id}
                  onClick={() => toggleLabel(label)}
                  className={`px-3 py-1 text-xs rounded-full text-white transition-opacity ${
                    active ? 'opacity-100' : 'opacity-40 hover:opacity-70'
                  }`}
                  style={{ backgroundColor: label.color }}
                >
                  {label.name}
                </button>
              )
            })}
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-semibold text-slate-600 mb-2">期日</h4>
          <div className="flex gap-2">
            <input
              type="date"
              value={formatDueDateInput(card.dueDate)}
              onChange={(e) => changeDueDate(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            {card.dueDate && (
              <button
                type="button"
                onClick={clearDueDate}
                className="text-sm text-slate-500 hover:text-red-600"
              >
                削除
              </button>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-600 mb-2">説明</h4>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={saveDescription}
            placeholder="説明を追加"
            rows={5}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>
    </div>
  )
}

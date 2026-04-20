import { useState, type FormEvent } from 'react'
import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { deleteList, updateListTitle } from './api'
import { createCard } from '../cards/api'
import { CardItem } from '../cards/CardItem'
import { CardDetailModal } from '../cards/CardDetailModal'
import type { Card, List } from '../../types'

type Props = {
  boardId: string
  list: List
  cards: Card[]
}

export function ListColumn({ boardId, list, cards }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(list.title)
  const [adding, setAdding] = useState(false)
  const [cardTitle, setCardTitle] = useState('')
  const [editingCardId, setEditingCardId] = useState<string | null>(null)

  const { setNodeRef } = useDroppable({
    id: `list-${list.id}`,
    data: { type: 'list', listId: list.id },
  })

  const editingCard = editingCardId
    ? cards.find((c) => c.id === editingCardId) ?? null
    : null

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

  async function handleAddCard(e: FormEvent) {
    e.preventDefault()
    const trimmed = cardTitle.trim()
    if (!trimmed) return
    const nextOrder =
      cards.length > 0 ? Math.max(...cards.map((c) => c.order)) + 1 : 0
    await createCard(boardId, list.id, trimmed, nextOrder)
    setCardTitle('')
    setAdding(false)
  }

  function cancelAdd() {
    setAdding(false)
    setCardTitle('')
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

      <SortableContext
        items={cards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div ref={setNodeRef} className="space-y-2 mb-2 min-h-[20px]">
          {cards.map((card) => (
            <CardItem
              key={card.id}
              boardId={boardId}
              listId={list.id}
              card={card}
              onClick={() => setEditingCardId(card.id)}
            />
          ))}
        </div>
      </SortableContext>

      {adding ? (
        <form onSubmit={handleAddCard}>
          <textarea
            value={cardTitle}
            onChange={(e) => setCardTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleAddCard(e as unknown as FormEvent)
              }
              if (e.key === 'Escape') cancelAdd()
            }}
            placeholder="カードの内容を入力"
            autoFocus
            required
            rows={2}
            className="w-full px-2 py-1 rounded border border-slate-300 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
            >
              追加
            </button>
            <button
              type="button"
              onClick={cancelAdd}
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              キャンセル
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="text-left text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-300 rounded px-2 py-1"
        >
          + カードを追加
        </button>
      )}

      {editingCard && (
        <CardDetailModal
          boardId={boardId}
          listId={list.id}
          card={editingCard}
          onClose={() => setEditingCardId(null)}
        />
      )}
    </div>
  )
}

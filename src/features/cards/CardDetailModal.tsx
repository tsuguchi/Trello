import { useEffect, useState, type FormEvent } from 'react'
import { Timestamp } from 'firebase/firestore'
import { updateCard } from './api'
import {
  formatDueDateInput,
  parseDueDateInput,
} from './dueDate'
import { useAuth } from '../../hooks/useAuth'
import type { Card, ChecklistItem, Comment, Label } from '../../types'

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
  const { user } = useAuth()
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description)
  const [newItemText, setNewItemText] = useState('')
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [itemDraft, setItemDraft] = useState('')
  const [commentText, setCommentText] = useState('')

  const checklist = card.checklist ?? []
  const completedCount = checklist.filter((i) => i.checked).length
  const comments = card.comments ?? []

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

  async function handleAddItem(e: FormEvent) {
    e.preventDefault()
    const trimmed = newItemText.trim()
    if (!trimmed) return
    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      text: trimmed,
      checked: false,
    }
    await updateCard(boardId, listId, card.id, {
      checklist: [...checklist, newItem],
    })
    setNewItemText('')
  }

  async function toggleItem(itemId: string) {
    const newList = checklist.map((i) =>
      i.id === itemId ? { ...i, checked: !i.checked } : i,
    )
    await updateCard(boardId, listId, card.id, { checklist: newList })
  }

  async function deleteItem(itemId: string) {
    const newList = checklist.filter((i) => i.id !== itemId)
    await updateCard(boardId, listId, card.id, { checklist: newList })
  }

  function startEditItem(item: ChecklistItem) {
    setEditingItemId(item.id)
    setItemDraft(item.text)
  }

  async function commitItemEdit() {
    if (!editingItemId) return
    const trimmed = itemDraft.trim()
    const original = checklist.find((i) => i.id === editingItemId)
    if (trimmed && original && trimmed !== original.text) {
      const newList = checklist.map((i) =>
        i.id === editingItemId ? { ...i, text: trimmed } : i,
      )
      await updateCard(boardId, listId, card.id, { checklist: newList })
    }
    setEditingItemId(null)
  }

  async function handleAddComment(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    const trimmed = commentText.trim()
    if (!trimmed) return
    const newComment: Comment = {
      id: crypto.randomUUID(),
      text: trimmed,
      authorId: user.uid,
      authorName: user.displayName || user.email || '名無し',
      createdAt: Timestamp.now(),
    }
    await updateCard(boardId, listId, card.id, {
      comments: [...comments, newComment],
    })
    setCommentText('')
  }

  async function deleteComment(commentId: string) {
    const newComments = comments.filter((c) => c.id !== commentId)
    await updateCard(boardId, listId, card.id, { comments: newComments })
  }

  function formatCommentDate(ts: Timestamp): string {
    const d = ts.toDate()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const h = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return `${m}/${day} ${h}:${min}`
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
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
            className="flex-1 text-lg font-semibold text-slate-800 dark:text-slate-100 px-2 py-1 rounded hover:bg-slate-50 dark:hover:bg-slate-700 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            onClick={onClose}
            aria-label="閉じる"
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 px-2 py-1"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">ラベル</h4>
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
          <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">期日</h4>
          <div className="flex gap-2">
            <input
              type="date"
              value={formatDueDateInput(card.dueDate)}
              onChange={(e) => changeDueDate(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            {card.dueDate && (
              <button
                type="button"
                onClick={clearDueDate}
                className="text-sm text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
              >
                削除
              </button>
            )}
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">
            チェックリスト
            {checklist.length > 0 && (
              <span className="ml-2 text-xs font-normal text-slate-400 dark:text-slate-500">
                {completedCount}/{checklist.length}
              </span>
            )}
          </h4>
          <div className="space-y-1 mb-2">
            {checklist.map((item) => (
              <div key={item.id} className="flex items-center gap-2 group">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleItem(item.id)}
                  className="w-4 h-4 rounded cursor-pointer"
                />
                {editingItemId === item.id ? (
                  <input
                    type="text"
                    value={itemDraft}
                    onChange={(e) => setItemDraft(e.target.value)}
                    onBlur={commitItemEdit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitItemEdit()
                      if (e.key === 'Escape') setEditingItemId(null)
                    }}
                    autoFocus
                    className="flex-1 px-2 py-1 text-sm rounded border border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                ) : (
                  <span
                    onClick={() => startEditItem(item)}
                    className={`flex-1 text-sm cursor-pointer ${
                      item.checked
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {item.text}
                  </span>
                )}
                <button
                  onClick={() => deleteItem(item.id)}
                  aria-label="項目を削除"
                  className="opacity-0 group-hover:opacity-100 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 text-xs px-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <form onSubmit={handleAddItem} className="flex gap-2">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="項目を追加"
              className="flex-1 px-3 py-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
              追加
            </button>
          </form>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">説明</h4>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={saveDescription}
            placeholder="説明を追加"
            rows={5}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">
            コメント
            {comments.length > 0 && (
              <span className="ml-2 text-xs font-normal text-slate-400 dark:text-slate-500">
                {comments.length}件
              </span>
            )}
          </h4>
          <div className="space-y-3 mb-3">
            {comments.map((comment) => (
              <div key={comment.id} className="group">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {comment.authorName}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {formatCommentDate(comment.createdAt)}
                  </span>
                  {user?.uid === comment.authorId && (
                    <button
                      onClick={() => deleteComment(comment.id)}
                      aria-label="コメント削除"
                      className="ml-auto opacity-0 group-hover:opacity-100 text-xs text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400"
                    >
                      削除
                    </button>
                  )}
                </div>
                <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                  {comment.text}
                </p>
              </div>
            ))}
          </div>
          <form onSubmit={handleAddComment} className="flex flex-col gap-2">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault()
                  handleAddComment(e as unknown as FormEvent)
                }
              }}
              placeholder="コメントを追加（Ctrl+Enter で送信）"
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="self-end bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:bg-slate-400 dark:disabled:bg-slate-600"
            >
              送信
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

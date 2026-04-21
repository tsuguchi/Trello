import { useMemo, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { useBoard } from '../hooks/useBoard'
import { useLists } from '../hooks/useLists'
import { useBoardCards } from '../hooks/useBoardCards'
import { ListColumn } from '../features/lists/ListColumn'
import { createList, updateListOrder } from '../features/lists/api'
import { moveCard, updateCard } from '../features/cards/api'
import type { Card } from '../types'

export function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>()
  const { board, loading: boardLoading } = useBoard(boardId)
  const { lists, loading: listsLoading } = useLists(boardId)
  const listIds = useMemo(() => lists.map((l) => l.id), [lists])
  const cardsByListId = useBoardCards(boardId, listIds)
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!boardId || !title.trim()) return
    const nextOrder =
      lists.length > 0 ? Math.max(...lists.map((l) => l.order)) + 1 : 0
    await createList(boardId, title.trim(), nextOrder)
    setTitle('')
    setAdding(false)
  }

  async function handleDragEnd(e: DragEndEvent) {
    if (!boardId) return
    const { active, over } = e
    if (!over) return

    const activeData = active.data.current
    const overData = over.data.current

    if (activeData?.type === 'list') {
      if (active.id === over.id) return
      const oldIndex = lists.findIndex((l) => l.id === active.id)
      const newIndex = lists.findIndex((l) => l.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return
      const reordered = arrayMove(lists, oldIndex, newIndex)
      await Promise.all(
        reordered.map((list, index) =>
          list.order === index
            ? Promise.resolve()
            : updateListOrder(boardId, list.id, index),
        ),
      )
      return
    }

    if (activeData?.type !== 'card') return

    const draggedCard = activeData.card as Card
    const sourceListId = activeData.sourceListId as string

    let targetListId: string
    let targetIndex: number

    if (overData?.type === 'card') {
      targetListId = overData.sourceListId as string
      const targetCards = cardsByListId[targetListId] ?? []
      targetIndex = targetCards.findIndex((c) => c.id === over.id)
      if (targetIndex === -1) targetIndex = targetCards.length
    } else if (overData?.type === 'list') {
      targetListId = overData.listId as string
      targetIndex = (cardsByListId[targetListId] ?? []).length
    } else {
      return
    }

    if (sourceListId === targetListId) {
      const sourceCards = cardsByListId[sourceListId] ?? []
      const oldIndex = sourceCards.findIndex((c) => c.id === active.id)
      if (oldIndex === -1 || oldIndex === targetIndex) return
      const reordered = arrayMove(sourceCards, oldIndex, targetIndex)
      await Promise.all(
        reordered.map((card, index) =>
          card.order === index
            ? Promise.resolve()
            : updateCard(boardId, sourceListId, card.id, { order: index }),
        ),
      )
    } else {
      await moveCard(
        boardId,
        sourceListId,
        targetListId,
        draggedCard,
        targetIndex,
      )

      const sourceRemaining = (cardsByListId[sourceListId] ?? []).filter(
        (c) => c.id !== draggedCard.id,
      )
      await Promise.all(
        sourceRemaining.map((card, index) =>
          card.order === index
            ? Promise.resolve()
            : updateCard(boardId, sourceListId, card.id, { order: index }),
        ),
      )

      const targetExisting = cardsByListId[targetListId] ?? []
      const targetWithNew = [
        ...targetExisting.slice(0, targetIndex),
        draggedCard,
        ...targetExisting.slice(targetIndex),
      ]
      await Promise.all(
        targetWithNew.map((card, index) => {
          if (card.id === draggedCard.id) return Promise.resolve()
          if (card.order === index) return Promise.resolve()
          return updateCard(boardId, targetListId, card.id, { order: index })
        }),
      )
    }
  }

  if (boardLoading || listsLoading) {
    return (
      <div>
        <Link
          to="/"
          className="text-sm text-blue-600 hover:text-blue-800 inline-block mb-2"
        >
          ← ボード一覧に戻る
        </Link>
        <div className="h-8 bg-slate-200 rounded w-40 mb-6 animate-pulse" />
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-slate-200 rounded-lg p-3 w-full sm:w-72 sm:flex-shrink-0"
            >
              <div className="h-6 bg-slate-300 rounded w-2/3 mb-3 animate-pulse" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div
                    key={j}
                    className="h-12 bg-white rounded shadow-sm animate-pulse"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!board) {
    return (
      <div>
        <Link to="/" className="text-sm text-blue-600 hover:text-blue-800">
          ← ボード一覧に戻る
        </Link>
        <p className="text-slate-500 mt-4">ボードが見つかりません。</p>
      </div>
    )
  }

  return (
    <div>
      <Link
        to="/"
        className="text-sm text-blue-600 hover:text-blue-800 inline-block mb-2"
      >
        ← ボード一覧に戻る
      </Link>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{board.title}</h1>
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="カードを検索"
          className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full sm:w-64"
        />
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex flex-col sm:flex-row gap-4 sm:overflow-x-auto pb-4 items-start">
          <SortableContext items={listIds} strategy={rectSortingStrategy}>
            {lists.map((list) => (
              <ListColumn
                key={list.id}
                boardId={boardId!}
                list={list}
                cards={cardsByListId[list.id] ?? []}
                searchTerm={searchTerm}
              />
            ))}
          </SortableContext>

          {adding ? (
            <form
              onSubmit={handleAdd}
              className="bg-slate-200 rounded-lg p-3 w-full sm:w-72 sm:flex-shrink-0"
            >
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="リスト名を入力"
                autoFocus
                required
                className="w-full px-2 py-1 rounded border border-slate-300 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  onClick={() => {
                    setAdding(false)
                    setTitle('')
                  }}
                  className="text-sm text-slate-600 hover:text-slate-900"
                >
                  キャンセル
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="bg-slate-200 hover:bg-slate-300 rounded-lg p-3 w-full sm:w-72 sm:flex-shrink-0 text-left text-slate-600"
            >
              + リストを追加
            </button>
          )}
        </div>
      </DndContext>
    </div>
  )
}

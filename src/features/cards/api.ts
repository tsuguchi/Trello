import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../../lib/firebase'
import type { Card, ChecklistItem, Label } from '../../types'

export async function createCard(
  boardId: string,
  listId: string,
  title: string,
  order: number,
) {
  await addDoc(
    collection(db, 'boards', boardId, 'lists', listId, 'cards'),
    {
      title,
      description: '',
      dueDate: null,
      labels: [],
      checklist: [],
      order,
      createdAt: serverTimestamp(),
    },
  )
}

export async function deleteCard(
  boardId: string,
  listId: string,
  cardId: string,
) {
  await deleteDoc(
    doc(db, 'boards', boardId, 'lists', listId, 'cards', cardId),
  )
}

type CardUpdates = {
  title?: string
  description?: string
  labels?: Label[]
  order?: number
  dueDate?: Date | null
  checklist?: ChecklistItem[]
}

export async function updateCard(
  boardId: string,
  listId: string,
  cardId: string,
  updates: CardUpdates,
) {
  await updateDoc(
    doc(db, 'boards', boardId, 'lists', listId, 'cards', cardId),
    updates,
  )
}

export async function moveCard(
  boardId: string,
  sourceListId: string,
  targetListId: string,
  card: Card,
  newOrder: number,
) {
  const batch = writeBatch(db)
  const oldRef = doc(
    db,
    'boards',
    boardId,
    'lists',
    sourceListId,
    'cards',
    card.id,
  )
  const newRef = doc(
    db,
    'boards',
    boardId,
    'lists',
    targetListId,
    'cards',
    card.id,
  )
  batch.set(newRef, {
    title: card.title,
    description: card.description,
    dueDate: card.dueDate,
    labels: card.labels,
    checklist: card.checklist ?? [],
    order: newOrder,
    createdAt: card.createdAt,
  })
  batch.delete(oldRef)
  await batch.commit()
}

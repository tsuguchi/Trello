import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../../lib/firebase'
import type { Label } from '../../types'

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

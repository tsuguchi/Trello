import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../../lib/firebase'

export async function createList(
  boardId: string,
  title: string,
  order: number,
) {
  await addDoc(collection(db, 'boards', boardId, 'lists'), {
    title,
    order,
  })
}

export async function deleteList(boardId: string, listId: string) {
  await deleteDoc(doc(db, 'boards', boardId, 'lists', listId))
}

export async function updateListTitle(
  boardId: string,
  listId: string,
  title: string,
) {
  await updateDoc(doc(db, 'boards', boardId, 'lists', listId), { title })
}

export async function updateListOrder(
  boardId: string,
  listId: string,
  order: number,
) {
  await updateDoc(doc(db, 'boards', boardId, 'lists', listId), { order })
}

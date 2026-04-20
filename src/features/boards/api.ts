import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../../lib/firebase'

export async function createBoard(ownerId: string, title: string) {
  await addDoc(collection(db, 'boards'), {
    ownerId,
    title,
    createdAt: serverTimestamp(),
  })
}

export async function deleteBoard(boardId: string) {
  await deleteDoc(doc(db, 'boards', boardId))
}

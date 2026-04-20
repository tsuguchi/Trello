import {
  addDoc,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  writeBatch,
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
  const listsRef = collection(db, 'boards', boardId, 'lists')
  const listsSnap = await getDocs(listsRef)

  const batch = writeBatch(db)

  for (const listDoc of listsSnap.docs) {
    const cardsRef = collection(
      db,
      'boards',
      boardId,
      'lists',
      listDoc.id,
      'cards',
    )
    const cardsSnap = await getDocs(cardsRef)
    for (const cardDoc of cardsSnap.docs) {
      batch.delete(cardDoc.ref)
    }
    batch.delete(listDoc.ref)
  }

  batch.delete(doc(db, 'boards', boardId))
  await batch.commit()
}

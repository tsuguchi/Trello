import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Card } from '../types'

export function useBoardCards(
  boardId: string | undefined,
  listIds: string[],
) {
  const [cardsByListId, setCardsByListId] = useState<Record<string, Card[]>>({})

  const listIdsKey = listIds.join('|')

  useEffect(() => {
    if (!boardId || listIds.length === 0) {
      setCardsByListId({})
      return
    }

    const unsubscribers = listIds.map((listId) => {
      const ref = collection(db, 'boards', boardId, 'lists', listId, 'cards')
      return onSnapshot(ref, (snapshot) => {
        const cards = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Card[]
        cards.sort((a, b) => a.order - b.order)
        setCardsByListId((prev) => ({ ...prev, [listId]: cards }))
      })
    })

    return () => unsubscribers.forEach((u) => u())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId, listIdsKey])

  return cardsByListId
}

import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Card } from '../types'

export function useCards(
  boardId: string | undefined,
  listId: string | undefined,
) {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!boardId || !listId) {
      setCards([])
      setLoading(false)
      return
    }

    const ref = collection(db, 'boards', boardId, 'lists', listId, 'cards')

    const unsubscribe = onSnapshot(ref, (snapshot) => {
      const cardData = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Card[]

      cardData.sort((a, b) => a.order - b.order)

      setCards(cardData)
      setLoading(false)
    })

    return unsubscribe
  }, [boardId, listId])

  return { cards, loading }
}

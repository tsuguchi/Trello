import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Board } from '../types'

export function useBoards(userId: string | undefined) {
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setBoards([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'boards'),
      where('ownerId', '==', userId),
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const boardList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Board[]

      boardList.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() ?? 0
        const bTime = b.createdAt?.toMillis() ?? 0
        return bTime - aTime
      })

      setBoards(boardList)
      setLoading(false)
    })

    return unsubscribe
  }, [userId])

  return { boards, loading }
}

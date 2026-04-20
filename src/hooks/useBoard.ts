import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Board } from '../types'

export function useBoard(boardId: string | undefined) {
  const [board, setBoard] = useState<Board | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!boardId) {
      setBoard(null)
      setLoading(false)
      return
    }

    const unsubscribe = onSnapshot(doc(db, 'boards', boardId), (snapshot) => {
      if (snapshot.exists()) {
        setBoard({ id: snapshot.id, ...snapshot.data() } as Board)
      } else {
        setBoard(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [boardId])

  return { board, loading }
}

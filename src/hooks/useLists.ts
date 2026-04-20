import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { List } from '../types'

export function useLists(boardId: string | undefined) {
  const [lists, setLists] = useState<List[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!boardId) {
      setLists([])
      setLoading(false)
      return
    }

    const ref = collection(db, 'boards', boardId, 'lists')

    const unsubscribe = onSnapshot(ref, (snapshot) => {
      const listData = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as List[]

      listData.sort((a, b) => a.order - b.order)

      setLists(listData)
      setLoading(false)
    })

    return unsubscribe
  }, [boardId])

  return { lists, loading }
}

import type { Timestamp } from 'firebase/firestore'

export type Label = {
  id: string
  name: string
  color: string
}

export type ChecklistItem = {
  id: string
  text: string
  checked: boolean
}

export type User = {
  uid: string
  email: string
  displayName: string
  createdAt: Timestamp
}

export type Board = {
  id: string
  ownerId: string
  title: string
  createdAt: Timestamp
}

export type List = {
  id: string
  title: string
  order: number
}

export type Card = {
  id: string
  title: string
  description: string
  dueDate: Timestamp | null
  labels: Label[]
  checklist?: ChecklistItem[]
  order: number
  createdAt: Timestamp
}

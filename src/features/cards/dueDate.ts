import type { Timestamp } from 'firebase/firestore'

export type DueStatus = 'overdue' | 'today' | 'upcoming'

export function formatDueDateShort(ts: Timestamp): string {
  const d = ts.toDate()
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export function formatDueDateInput(ts: Timestamp | null): string {
  if (!ts) return ''
  const d = ts.toDate()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseDueDateInput(s: string): Date | null {
  if (!s) return null
  return new Date(`${s}T00:00:00`)
}

export function getDueStatus(ts: Timestamp): DueStatus {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = ts.toDate()
  due.setHours(0, 0, 0, 0)
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000)
  if (diff < 0) return 'overdue'
  if (diff === 0) return 'today'
  return 'upcoming'
}

export function getDueBadgeClass(status: DueStatus): string {
  switch (status) {
    case 'overdue':
      return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
    case 'today':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200'
    case 'upcoming':
      return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
  }
}

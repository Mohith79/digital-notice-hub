// localStorage-based data store for the Digital Notice Board

export type UserRole = "admin" | "student"

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: UserRole
  department?: string
  createdAt: string
}

export interface Notice {
  id: string
  title: string
  content: string
  department: string
  category: "notice" | "holiday" | "attendance" | "academic" | "event"
  priority: "low" | "medium" | "high"
  createdBy: string
  createdAt: string
  updatedAt: string
}

export const DEPARTMENTS = ["CSE", "ECE", "EEE", "CSM", "CSD", "MECH", "CIVIL"] as const
export type Department = (typeof DEPARTMENTS)[number]

export const CATEGORIES = [
  { value: "notice" as const, label: "General Notice" },
  { value: "holiday" as const, label: "Holiday" },
  { value: "attendance" as const, label: "Attendance" },
  { value: "academic" as const, label: "Academic" },
  { value: "event" as const, label: "Event" },
]

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : fallback
  } catch {
    return fallback
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(value))
}

// Users
export function getUsers(): User[] {
  return getItem<User[]>("srit_users", [])
}

export function saveUser(user: User): void {
  const users = getUsers()
  users.push(user)
  setItem("srit_users", users)
}

export function findUserByEmail(email: string): User | undefined {
  return getUsers().find((u) => u.email === email)
}

export function hasAdmin(): boolean {
  return getUsers().some((u) => u.role === "admin")
}

// Notices
export function getNotices(): Notice[] {
  return getItem<Notice[]>("srit_notices", [])
}

export function getNoticesByDepartment(department: string): Notice[] {
  return getNotices().filter(
    (n) => n.department === department || n.department === "ALL"
  )
}

export function getNoticesByCategory(category: string): Notice[] {
  return getNotices().filter((n) => n.category === category)
}

export function saveNotice(notice: Notice): void {
  const notices = getNotices()
  notices.push(notice)
  setItem("srit_notices", notices)
}

export function updateNotice(id: string, updates: Partial<Notice>): void {
  const notices = getNotices().map((n) =>
    n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
  )
  setItem("srit_notices", notices)
}

export function deleteNotice(id: string): void {
  const notices = getNotices().filter((n) => n.id !== id)
  setItem("srit_notices", notices)
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

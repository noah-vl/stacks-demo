// Seed data for My Focus + Critical Path view

export interface User {
  id: string
  name: string
  role: "Controller" | "Preparer"
  avatar?: string
  initials: string
  color: string
}

export type TaskStatus = "todo" | "in_progress" | "blocked" | "done"

export interface Task {
  id: string
  title: string
  category: string
  ownerId: string
  reviewerId?: string
  status: TaskStatus
  dueDate: string
  estimatedHours: number
  lastUpdated: string
  entity: string
  blockedReason?: string
}

export interface Dependency {
  fromTaskId: string
  toTaskId: string // toTaskId is blocked by fromTaskId
}

export type BottleneckReasonType = "approval" | "data" | "exception" | "dependency" | "overdue"

export interface BottleneckEvent {
  taskId: string
  reasonType: BottleneckReasonType
  notes: string
  createdAt: string
}

// Users data
export const users: User[] = [
  {
    id: "u1",
    name: "Koen Bentvelsen",
    role: "Controller",
    avatar: "/avatars/koen.jpg",
    initials: "KB",
    color: "bg-neutral-200",
  },
  {
    id: "u2",
    name: "Albert Malikov",
    role: "Preparer",
    initials: "AM",
    color: "bg-teal-500",
  },
  {
    id: "u3",
    name: "Ivan Bovyrin",
    role: "Preparer",
    initials: "IB",
    color: "bg-purple-500",
  },
  {
    id: "u4",
    name: "Kyle Kinsey",
    role: "Controller",
    avatar: "/avatars/kyle.jpg",
    initials: "KK",
    color: "bg-neutral-300",
  },
  {
    id: "u5",
    name: "Jacob O'Connor",
    role: "Preparer",
    initials: "JO",
    color: "bg-orange-500",
  },
  {
    id: "u6",
    name: "Ilia Znamenskii",
    role: "Controller",
    initials: "IZ",
    color: "bg-indigo-500",
  },
]

// Tasks data
export const tasks: Task[] = [
  // Critical path tasks
  {
    id: "t1",
    title: "Close accounting period in ERP",
    category: "Financial Reporting",
    ownerId: "u3",
    reviewerId: "u1",
    status: "blocked",
    dueDate: "2026-01-22",
    estimatedHours: 4,
    lastUpdated: "2026-01-20T09:30:00Z",
    entity: "NL",
    blockedReason: "Waiting on bank reconciliation completion",
  },
  {
    id: "t2",
    title: "Reconcile - HSBC EUR Operations *0298",
    category: "Bank Reconciliation",
    ownerId: "u2",
    reviewerId: "u1",
    status: "blocked",
    dueDate: "2026-01-21",
    estimatedHours: 3,
    lastUpdated: "2026-01-19T14:20:00Z",
    entity: "NL",
    blockedReason: "Missing bank statement for Jan 15-20",
  },
  {
    id: "t3",
    title: "Post month-end accruals",
    category: "Journal Entries",
    ownerId: "u5",
    reviewerId: "u4",
    status: "in_progress",
    dueDate: "2026-01-23",
    estimatedHours: 6,
    lastUpdated: "2026-01-20T11:00:00Z",
    entity: "US",
  },
  {
    id: "t4",
    title: "Flux analysis - P&L consolidated",
    category: "Flux Analysis",
    ownerId: "u1",
    status: "todo",
    dueDate: "2026-01-24",
    estimatedHours: 8,
    lastUpdated: "2026-01-18T16:00:00Z",
    entity: "HOLDCO",
  },
  {
    id: "t5",
    title: "Review intercompany eliminations",
    category: "Consolidation",
    ownerId: "u6",
    reviewerId: "u1",
    status: "in_progress",
    dueDate: "2026-01-24",
    estimatedHours: 5,
    lastUpdated: "2026-01-20T08:45:00Z",
    entity: "HOLDCO",
  },
  {
    id: "t6",
    title: "Prepare board reporting package",
    category: "Financial Reporting",
    ownerId: "u1",
    status: "todo",
    dueDate: "2026-01-25",
    estimatedHours: 10,
    lastUpdated: "2026-01-17T10:00:00Z",
    entity: "HOLDCO",
  },
  // Non-critical but blocked
  {
    id: "t7",
    title: "Reconcile - Barclays EUR Cash *7605",
    category: "Bank Reconciliation",
    ownerId: "u2",
    reviewerId: "u1",
    status: "blocked",
    dueDate: "2026-01-21",
    estimatedHours: 2,
    lastUpdated: "2026-01-19T15:30:00Z",
    entity: "UK",
    blockedReason: "Pending FX rate confirmation from treasury",
  },
  {
    id: "t8",
    title: "Record depreciation entries",
    category: "Journal Entries",
    ownerId: "u4",
    status: "done",
    dueDate: "2026-01-20",
    estimatedHours: 2,
    lastUpdated: "2026-01-20T10:00:00Z",
    entity: "DE",
  },
  {
    id: "t9",
    title: "Reconcile - VAT on Purchases",
    category: "Tax Reconciliation",
    ownerId: "u2",
    reviewerId: "u6",
    status: "in_progress",
    dueDate: "2026-01-22",
    estimatedHours: 3,
    lastUpdated: "2026-01-20T13:00:00Z",
    entity: "NL",
  },
  {
    id: "t10",
    title: "Submit payroll journal",
    category: "Journal Entries",
    ownerId: "u3",
    reviewerId: "u4",
    status: "blocked",
    dueDate: "2026-01-20",
    estimatedHours: 2,
    lastUpdated: "2026-01-19T09:00:00Z",
    entity: "US",
    blockedReason: "Waiting on HR to confirm headcount changes",
  },
  {
    id: "t11",
    title: "Reconcile - Accounts Receivable",
    category: "Account Reconciliation",
    ownerId: "u5",
    reviewerId: "u1",
    status: "in_progress",
    dueDate: "2026-01-23",
    estimatedHours: 4,
    lastUpdated: "2026-01-20T14:00:00Z",
    entity: "US",
  },
  {
    id: "t12",
    title: "Reconcile - Fixed Assets",
    category: "Account Reconciliation",
    ownerId: "u6",
    status: "done",
    dueDate: "2026-01-21",
    estimatedHours: 3,
    lastUpdated: "2026-01-20T09:00:00Z",
    entity: "HOLDCO",
  },
]

// Dependencies (fromTaskId must be completed before toTaskId can proceed)
export const dependencies: Dependency[] = [
  // Bank recon -> Close ERP
  { fromTaskId: "t2", toTaskId: "t1" },
  // Bank recon -> Flux analysis (needs accurate numbers)
  { fromTaskId: "t2", toTaskId: "t4" },
  // Close ERP -> Flux analysis
  { fromTaskId: "t1", toTaskId: "t4" },
  // Accruals -> Flux analysis
  { fromTaskId: "t3", toTaskId: "t4" },
  // Intercompany -> Flux analysis
  { fromTaskId: "t5", toTaskId: "t4" },
  // Flux analysis -> Board package
  { fromTaskId: "t4", toTaskId: "t6" },
  // VAT -> Close ERP (for NL)
  { fromTaskId: "t9", toTaskId: "t1" },
  // AR reconciliation -> Accruals
  { fromTaskId: "t11", toTaskId: "t3" },
]

// Bottleneck events (additional context for blockers)
export const bottleneckEvents: BottleneckEvent[] = [
  {
    taskId: "t2",
    reasonType: "data",
    notes: "Bank statement feed delayed - HSBC technical issue reported Jan 18",
    createdAt: "2026-01-18T11:00:00Z",
  },
  {
    taskId: "t1",
    reasonType: "dependency",
    notes: "Blocked by t2 - cannot close period without reconciled bank accounts",
    createdAt: "2026-01-20T09:30:00Z",
  },
  {
    taskId: "t7",
    reasonType: "approval",
    notes: "FX rate needs sign-off from Treasury - sent email Jan 19",
    createdAt: "2026-01-19T15:30:00Z",
  },
  {
    taskId: "t10",
    reasonType: "data",
    notes: "HR system migration caused delay in headcount data export",
    createdAt: "2026-01-19T09:00:00Z",
  },
]

// Entity display names
export const entities: Record<string, { code: string; name: string; color: string }> = {
  NL: { code: "NL", name: "Stacks BV", color: "bg-neutral-100 text-neutral-700" },
  UK: { code: "UK", name: "Stacks Ltd", color: "bg-neutral-800 text-white" },
  US: { code: "US", name: "Stacks Inc", color: "bg-emerald-600 text-white" },
  DE: { code: "DE", name: "Stacks GmbH", color: "bg-blue-600 text-white" },
  HOLDCO: { code: "HOLDCO", name: "Stacks Worldwide", color: "bg-amber-500 text-white" },
}

// Category icons (for reference)
export const categories = [
  "Bank Reconciliation",
  "Account Reconciliation",
  "Journal Entries",
  "Financial Reporting",
  "Flux Analysis",
  "Consolidation",
  "Tax Reconciliation",
]

// Helper to get user by ID
export function getUserById(id: string): User | undefined {
  return users.find((u) => u.id === id)
}

// Helper to get task by ID
export function getTaskById(id: string): Task | undefined {
  return tasks.find((t) => t.id === id)
}

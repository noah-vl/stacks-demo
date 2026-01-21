"use client"

import { useState } from "react"
import {
  Search,
  ChevronDown,
  ChevronRight,
  Sparkles,
  CircleDot,
  Circle,
  Plus,
  User,
  Building2,
  Tag,
  Flag,
  Calendar,
  Check,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sidebar } from "@/components/sidebar"
import { Navbar } from "@/components/navbar"
import { RightDrawer, DrawerTask } from "@/components/focus/right-drawer"
import { cn } from "@/lib/utils"

// Entity dot colors - matching main dashboard
const entityDotColors: Record<string, string> = {
  NL: "bg-orange-500",
  UK: "bg-neutral-800",
  US: "bg-emerald-500",
  DE: "bg-blue-500",
  HOLDCO: "bg-amber-400",
}

function getEntityDotColor(entity: string): string {
  return entityDotColors[entity] || "bg-neutral-400"
}

// Task types
type TaskStatus = "overdue" | "upcoming" | "waiting_review" | "reviewed"

interface Assignee {
  name: string
  initials?: string
  image?: string
  color?: string
  role?: "preparer" | "reviewer"
}

interface Task {
  id: string
  title: string
  status: TaskStatus
  hasAgent?: boolean
  entity?: string
  category?: string
  dueDate?: string
  reviewerDueDate?: string
  description?: string
  frequency?: string
  assignees: Assignee[]
  supportingFile?: {
    name: string
    size: string
    type: "xls" | "pdf" | "csv"
  }
  accountBalance?: {
    recBalance: number
    glBalance: number
    difference: number
    differencePercent: number
    currency: string
  }
  transactionMatching?: {
    progress: number
    total: number
    difference: number
    differencePercent: number
    currency: string
  }
}

// Sample task data based on the screenshot
const tasks: Task[] = [
  // Overdue
  {
    id: "1",
    title: "NL - Flux MoM - Profit & Loss (consolidated)",
    status: "overdue",
    entity: "NL",
    category: "Financial Reporting",
    dueDate: "Jan 18",
    reviewerDueDate: "Jan 19",
    description: "Review month-over-month changes in the consolidated P&L statement. Identify and document significant variances that exceed threshold limits.",
    frequency: "Every Month",
    assignees: [
      { name: "Koen Bentvelsen", image: "/avatars/koen.jpg", role: "preparer" },
      { name: "Noah van Lienden", image: "/people/noah-pf.png", role: "reviewer" },
    ],
  },
  // Upcoming
  {
    id: "2",
    title: "Reconcile - HSBC – EUR Operations *0298",
    status: "upcoming",
    hasAgent: true,
    entity: "NL",
    category: "Bank reconciliation",
    dueDate: "Jan 21",
    reviewerDueDate: "Jan 22",
    description: "Cross-check bank statements with accounting records to confirm balances align. Flag any missing or unmatched transactions for further investigation and resolution.",
    frequency: "Every Month",
    assignees: [
      { name: "Koen Bentvelsen", image: "/avatars/koen.jpg", role: "preparer" },
      { name: "Noah van Lienden", image: "/people/noah-pf.png", role: "reviewer" },
    ],
    supportingFile: {
      name: "HSBC_January2026.xsl",
      size: "4.5 Mb",
      type: "xls",
    },
    accountBalance: {
      recBalance: 991000,
      glBalance: 1000000,
      difference: 9000,
      differencePercent: 0.9,
      currency: "€",
    },
    transactionMatching: {
      progress: 1000,
      total: 1000,
      difference: 0,
      differencePercent: 0,
      currency: "€",
    },
  },
  {
    id: "3",
    title: "Reconcile - Barclays – EUR Cash Account *7605",
    status: "upcoming",
    hasAgent: true,
    entity: "UK",
    category: "Bank reconciliation",
    dueDate: "Jan 21",
    reviewerDueDate: "Jan 22",
    description: "Cross-check bank statements with accounting records to confirm balances align. Flag any missing or unmatched transactions for further investigation and resolution.",
    frequency: "Every Month",
    assignees: [
      { name: "Koen Bentvelsen", image: "/avatars/koen.jpg", role: "preparer" },
      { name: "Noah van Lienden", image: "/people/noah-pf.png", role: "reviewer" },
    ],
    supportingFile: {
      name: "Barclays_January2026.xsl",
      size: "3.2 Mb",
      type: "xls",
    },
    accountBalance: {
      recBalance: 2450000,
      glBalance: 2450000,
      difference: 0,
      differencePercent: 0,
      currency: "€",
    },
    transactionMatching: {
      progress: 856,
      total: 856,
      difference: 0,
      differencePercent: 0,
      currency: "€",
    },
  },
  {
    id: "4",
    title: "Close accounting period in accounting ERP",
    status: "upcoming",
    entity: "NL",
    category: "Financial Reporting",
    dueDate: "Jan 22",
    description: "Lock the accounting period in the ERP system to prevent further entries. Ensure all month-end adjustments are complete before closing.",
    frequency: "Every Month",
    assignees: [{ name: "Noah van Lienden", image: "/people/noah-pf.png", role: "preparer" }],
  },
  {
    id: "5",
    title: "Reconcile - Allica Bank - Natwest Growth Finance",
    status: "upcoming",
    entity: "UK",
    category: "Cash Management",
    dueDate: "Jan 22",
    reviewerDueDate: "Jan 23",
    description: "Reconcile loan balance and interest accruals with bank statements. Verify payment schedule compliance.",
    frequency: "Every Month",
    assignees: [
      { name: "Naman Mathur", image: "/people/naman.jpeg", role: "preparer" },
      { name: "Noah van Lienden", image: "/people/noah-pf.png", role: "reviewer" },
    ],
  },
  {
    id: "6",
    title: "Reconcile - Bank of America - Operating Bank x1234",
    status: "upcoming",
    entity: "US",
    category: "Bank reconciliation",
    dueDate: "Jan 22",
    reviewerDueDate: "Jan 23",
    description: "Cross-check bank statements with accounting records to confirm balances align.",
    frequency: "Every Month",
    assignees: [
      { name: "Naman Mathur", image: "/people/naman.jpeg", role: "preparer" },
    ],
  },
  {
    id: "7",
    title: "Reconcile - Wells Fargo - Operating Bank Account",
    status: "upcoming",
    entity: "US",
    dueDate: "Jan 23",
    description: "Cross-check bank statements with accounting records to confirm balances align.",
    frequency: "Every Month",
    assignees: [
      { name: "Naman Mathur", image: "/people/naman.jpeg", role: "preparer" },
      { name: "Albert Malikov", image: "/people/albert.jpeg", role: "reviewer" },
    ],
  },
  {
    id: "8",
    title: "Reconcile - GSR International Limited - USD account",
    status: "upcoming",
    hasAgent: true,
    entity: "US",
    category: "Bank reconciliation",
    dueDate: "Jan 23",
    reviewerDueDate: "Jan 24",
    description: "Cross-check bank statements with accounting records to confirm balances align. Flag any missing or unmatched transactions for further investigation and resolution.",
    frequency: "Every Month",
    assignees: [
      { name: "Albert Malikov", image: "/people/albert.jpeg", role: "preparer" },
      { name: "Noah van Lienden", image: "/people/noah-pf.png", role: "reviewer" },
    ],
    supportingFile: {
      name: "GSR_January2026.xsl",
      size: "2.1 Mb",
      type: "xls",
    },
    accountBalance: {
      recBalance: 1500000,
      glBalance: 1500000,
      difference: 0,
      differencePercent: 0,
      currency: "$",
    },
    transactionMatching: {
      progress: 423,
      total: 450,
      difference: 1250,
      differencePercent: 0.08,
      currency: "$",
    },
  },
  // Waiting for review
  {
    id: "9",
    title: "Reconcile - Rabobank - Operating Bank x1234",
    status: "waiting_review",
    hasAgent: true,
    entity: "NL",
    category: "Bank reconciliation",
    dueDate: "Jan 22",
    reviewerDueDate: "Jan 23",
    description: "Cross-check bank statements with accounting records to confirm balances align. Flag any missing or unmatched transactions for further investigation and resolution.",
    frequency: "Every Month",
    assignees: [
      { name: "Albert Malikov", image: "/people/albert.jpeg", role: "preparer" },
      { name: "Noah van Lienden", image: "/people/noah-pf.png", role: "reviewer" },
    ],
    supportingFile: {
      name: "Rabobank_January2026.xsl",
      size: "5.8 Mb",
      type: "xls",
    },
    accountBalance: {
      recBalance: 3200000,
      glBalance: 3200000,
      difference: 0,
      differencePercent: 0,
      currency: "€",
    },
    transactionMatching: {
      progress: 1200,
      total: 1200,
      difference: 0,
      differencePercent: 0,
      currency: "€",
    },
  },
  {
    id: "10",
    title: "Reconcile - VAT on Purchases",
    status: "waiting_review",
    hasAgent: true,
    entity: "NL",
    dueDate: "Jan 21",
    reviewerDueDate: "Jan 22",
    category: "Tax Reconciliation",
    description: "Reconcile VAT on purchases with the general ledger. Verify input VAT claims are properly documented.",
    frequency: "Every Month",
    assignees: [{ name: "Albert Malikov", image: "/people/albert.jpeg", role: "preparer" }],
  },
  // Reviewed (sample of completed tasks)
  {
    id: "11",
    title: "Reconcile - Cash and Cash Equivalents",
    status: "reviewed",
    entity: "NL",
    category: "Financial Reporting",
    description: "Verify all cash and cash equivalent accounts are properly reconciled and documented.",
    frequency: "Every Month",
    assignees: [{ name: "Koen Bentvelsen", image: "/avatars/koen.jpg", role: "preparer" }],
  },
  {
    id: "12",
    title: "Post depreciation journal entries",
    status: "reviewed",
    entity: "DE",
    category: "Journal entries",
    description: "Post monthly depreciation entries for all fixed assets according to the depreciation schedule.",
    frequency: "Every Month",
    assignees: [{ name: "Kyle Kinsey", image: "/avatars/kyle.jpg", role: "preparer" }],
  },
]

// Convert Task to DrawerTask
function taskToDrawerTask(task: Task): DrawerTask {
  const preparer = task.assignees.find(a => a.role === "preparer") || task.assignees[0]
  const reviewer = task.assignees.find(a => a.role === "reviewer")
  
  // Determine task status for drawer
  const getTaskStatus = (): DrawerTask["taskStatus"] => {
    switch (task.status) {
      case "reviewed": return "approved"
      case "waiting_review": return "waiting_review"
      case "overdue": return "pending"
      default: return "in_progress"
    }
  }
  
  // Determine if current user is reviewer (in real app, check against auth)
  // For demo, assume current user (Koen) is reviewer when they're in the reviewer slot
  const isCurrentUserReviewer = reviewer?.name === "Koen Bentvelsen"
  const isCurrentUserPreparer = preparer?.name === "Koen Bentvelsen"
  
  return {
    id: task.id,
    title: task.title,
    entity: task.entity || "NL",
    category: task.category || "General",
    description: task.description,
    frequency: task.frequency,
    taskStatus: getTaskStatus(),
    currentUserRole: isCurrentUserReviewer ? "reviewer" : isCurrentUserPreparer ? "preparer" : "viewer",
    preparer: preparer ? {
      id: preparer.name,
      name: preparer.name,
      initials: preparer.initials,
      avatar: preparer.image,
      color: preparer.color,
      dueDate: task.dueDate,
      status: task.status === "reviewed" ? "completed" : task.status === "waiting_review" ? "submitted" : "pending",
      completedAt: task.status === "waiting_review" ? "Jan 21st - 2:30 PM" : undefined,
    } : undefined,
    reviewer: reviewer ? {
      id: reviewer.name,
      name: reviewer.name,
      initials: reviewer.initials,
      avatar: reviewer.image,
      color: reviewer.color,
      dueDate: task.reviewerDueDate,
      status: task.status === "reviewed" ? "approved" : task.status === "waiting_review" ? "reviewing" : "waiting",
    } : undefined,
    supportingFile: task.supportingFile,
    accountBalance: task.accountBalance,
    transactionMatching: task.transactionMatching,
    links: task.category?.toLowerCase().includes("journal") || task.category?.toLowerCase().includes("reconciliation") ? [
      {
        title: "Netsuite - Journal entries",
        url: "www.netsuite.com/journal_entry?=44/43828394900202",
        favicon: "oracle" as const,
      },
      {
        title: "Drive - Invoices",
        url: "www.drive.google.com/mydrive_invoices234?",
        favicon: "drive" as const,
      },
    ] : undefined,
  }
}

// Filter buttons configuration
const filterButtons = [
  { icon: CircleDot, label: "My Focus" },
  { icon: User, label: "Assignee" },
  { icon: Building2, label: "Type" },
  { icon: Building2, label: "Entity" },
  { icon: Tag, label: "Category" },
  { icon: Flag, label: "Status" },
]

// Grouping options
const groupingOptions = ["Status", "Assignee", "Entity", "Category", "Due Date"]

// Task group configuration
const taskGroups = [
  { key: "overdue", label: "Overdue", count: 1 },
  { key: "upcoming", label: "Upcoming", count: 8 },
  { key: "waiting_review", label: "Waiting for review", count: 2 },
  { key: "reviewed", label: "Reviewed", count: 93 },
]

function TaskRow({ task, onClick }: { task: Task; onClick?: () => void }) {
  const getStatusIndicator = () => {
    switch (task.status) {
      case "overdue":
        // Ring style with inner dot - amber/orange
        return (
          <div className="h-4 w-4 rounded-full border-[1.5px] border-amber-400 flex items-center justify-center bg-white">
            <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          </div>
        )
      case "waiting_review":
        // Solid blue dot
        return <div className="h-4 w-4 rounded-full bg-blue-500" />
      case "reviewed":
        // Green checkmark style
        return (
          <div className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center">
            <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
          </div>
        )
      default:
        // Empty circle for upcoming/pending
        return <div className="h-4 w-4 rounded-full border-[1.5px] border-neutral-300 bg-white" />
    }
  }

  return (
    <div 
      role="button"
      tabIndex={0}
      className="group flex items-center gap-4 py-3 px-4 hover:bg-neutral-50 transition-colors border-b border-neutral-100 last:border-b-0 cursor-pointer"
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
    >
      {/* Status Indicator */}
      <div className="shrink-0">{getStatusIndicator()}</div>

      {/* Task Title & Agent Tag */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className="text-sm text-neutral-900 truncate">{task.title}</span>
        {task.hasAgent && (
          <Badge className="bg-purple-50 text-purple-700 hover:bg-purple-50 border-0 gap-1 px-2 py-0.5 text-[11px] font-medium shrink-0">
            <Sparkles className="h-3 w-3" />
            Agent
          </Badge>
        )}
      </div>

      {/* Entity Tag - matching main dashboard style */}
      {task.entity && (
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={cn("h-2 w-2 rounded-full", getEntityDotColor(task.entity))} />
          <span className="inline-flex items-center rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500 uppercase tracking-wide">
            {task.entity}
          </span>
        </div>
      )}

      {/* Category Tag */}
      {task.category && (
        <Badge className="bg-neutral-100 text-neutral-600 hover:bg-neutral-100 border-0 px-2 py-0.5 text-[11px] font-medium shrink-0 max-w-[140px] truncate">
          {task.category}
        </Badge>
      )}

      {/* Due Date */}
      <div className="flex items-center gap-1.5 text-xs text-neutral-500 shrink-0">
        {task.dueDate && (
          <>
            <Calendar className="h-3.5 w-3.5" />
            {task.dueDate}
          </>
        )}
      </div>

      {/* Assignees */}
      <div className="flex -space-x-1.5 shrink-0">
        {task.assignees.length > 0 ? (
          task.assignees.slice(0, 3).map((assignee, index) => (
            <Avatar key={index} className="h-6 w-6 border-2 border-white">
              {assignee.image ? (
                <AvatarImage src={assignee.image} alt={assignee.name} />
              ) : null}
              <AvatarFallback
                className={`text-[9px] font-medium ${assignee.color || "bg-neutral-200"} text-white`}
              >
                {assignee.initials ||
                  assignee.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
              </AvatarFallback>
            </Avatar>
          ))
        ) : (
          <div className="h-6 w-6 rounded-full border-2 border-dashed border-neutral-200 flex items-center justify-center">
            <User className="h-3 w-3 text-neutral-300" />
          </div>
        )}
      </div>
    </div>
  )
}

function TaskGroup({
  group,
  tasks,
  isExpanded,
  onToggle,
  onTaskClick,
}: {
  group: { key: string; label: string; count: number }
  tasks: Task[]
  isExpanded: boolean
  onToggle: () => void
  onTaskClick: (task: Task) => void
}) {
  return (
    <div className="mb-2">
      {/* Group Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 py-2 px-4 text-left hover:bg-neutral-50 transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-neutral-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-neutral-400" />
        )}
        <span className="text-sm font-medium text-neutral-700">{group.label}</span>
        <span className="text-sm text-neutral-400">{group.count}</span>
      </button>

      {/* Task List */}
      {isExpanded && (
        <div className="border-l-2 border-neutral-100 ml-[18px]">
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ChecklistPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [grouping, setGrouping] = useState("Status")
  const [expandedGroups, setExpandedGroups] = useState<string[]>([
    "overdue",
    "upcoming",
    "waiting_review",
  ])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setDrawerOpen(true)
  }

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupKey) ? prev.filter((k) => k !== groupKey) : [...prev, groupKey]
    )
  }

  const getTasksForGroup = (groupKey: string) => {
    return tasks.filter((task) => task.status === groupKey)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar activePage="checklist" />
      <div className="flex flex-1 flex-col overflow-hidden border-l border-neutral-200">
        {/* Top Navbar */}
        <Navbar
          breadcrumbs={[
            { label: "Month-end Close" },
            { label: "January 2026", hasDropdown: true },
          ]}
          action={{
            label: "Create new task",
            icon: <Plus className="h-3.5 w-3.5" />,
            onClick: () => console.log("Create new task clicked"),
          }}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-6xl px-6 py-6 lg:px-8">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-white border-neutral-200 text-sm placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-neutral-300"
              />
            </div>

            {/* Filters Row */}
            <div className="flex items-center justify-between mb-6">
              {/* Filter Buttons */}
              <div className="flex items-center gap-2">
                {filterButtons.map((filter) => (
                  <Button
                    key={filter.label}
                    variant="outline"
                    size="sm"
                    className="gap-2 border-neutral-200 bg-white text-neutral-600 shadow-none hover:bg-neutral-50 font-normal"
                  >
                    <filter.icon className="h-3.5 w-3.5 text-neutral-400" />
                    {filter.label}
                  </Button>
                ))}
              </div>

              {/* Grouping Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-500">Grouping</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 border-neutral-200 bg-white text-neutral-600 shadow-none hover:bg-neutral-50 font-normal"
                    >
                      {grouping}
                      <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    {groupingOptions.map((option) => (
                      <DropdownMenuItem
                        key={option}
                        onClick={() => setGrouping(option)}
                        className={grouping === option ? "bg-neutral-100" : ""}
                      >
                        {option}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Task Groups */}
            <div className="bg-white rounded-lg border border-neutral-200">
              {taskGroups.map((group) => (
                <TaskGroup
                  key={group.key}
                  group={group}
                  tasks={getTasksForGroup(group.key)}
                  isExpanded={expandedGroups.includes(group.key)}
                  onToggle={() => toggleGroup(group.key)}
                  onTaskClick={handleTaskClick}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
      
      {/* Right Drawer */}
      <RightDrawer
        task={selectedTask ? taskToDrawerTask(selectedTask) : null}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  )
}

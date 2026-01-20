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

// Task types
type TaskStatus = "overdue" | "upcoming" | "waiting_review" | "reviewed"

interface Task {
  id: string
  title: string
  status: TaskStatus
  hasAgent?: boolean
  entity?: string
  category?: string
  dueDate?: string
  assignees: {
    name: string
    initials?: string
    image?: string
    color?: string
  }[]
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
    dueDate: "Oct 23",
    assignees: [
      { name: "Koen Bentvelsen", image: "/avatars/koen.jpg" },
      { name: "Ivan Bovyrin", initials: "IB", color: "bg-purple-500" },
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
    dueDate: "Oct 24",
    assignees: [
      { name: "Koen Bentvelsen", image: "/avatars/koen.jpg" },
      { name: "Ivan Bovyrin", initials: "IB", color: "bg-purple-500" },
    ],
  },
  {
    id: "3",
    title: "Reconcile - Barclays – EUR Cash Account *7605",
    status: "upcoming",
    hasAgent: true,
    entity: "NL",
    category: "Bank reconciliation",
    dueDate: "Oct 24",
    assignees: [
      { name: "Koen Bentvelsen", image: "/avatars/koen.jpg" },
      { name: "Ivan Bovyrin", initials: "IB", color: "bg-purple-500" },
    ],
  },
  {
    id: "4",
    title: "Close accounting period in accounting ERP",
    status: "upcoming",
    entity: "NL",
    category: "Financial Reporting",
    dueDate: "Oct 24",
    assignees: [{ name: "Ivan Bovyrin", initials: "IB", color: "bg-purple-500" }],
  },
  {
    id: "5",
    title: "Reconcile - Allica Bank - Natwest Growth Finance",
    status: "upcoming",
    entity: "NL",
    category: "Cash Management",
    assignees: [],
  },
  {
    id: "6",
    title: "Reconcile - Bank of America - Operating Bank x1234",
    status: "upcoming",
    entity: "NL",
    category: "Bank reconciliation",
    assignees: [],
  },
  {
    id: "7",
    title: "Reconcile - Wells Fargo - Operating Bank Account",
    status: "upcoming",
    entity: "NL",
    assignees: [],
  },
  {
    id: "8",
    title: "Reconcile - GSR International Limited - USD account",
    status: "upcoming",
    hasAgent: true,
    entity: "NL",
    category: "Bank reconciliation",
    assignees: [
      { name: "Albert Malikov", initials: "AM", color: "bg-teal-500" },
      { name: "Ivan Bovyrin", initials: "IB", color: "bg-purple-500" },
    ],
  },
  // Waiting for review
  {
    id: "9",
    title: "Reconcile - Rabobank - Operating Bank x1234",
    status: "waiting_review",
    hasAgent: true,
    entity: "NL",
    category: "Bank reconciliation",
    dueDate: "Oct 24",
    assignees: [
      { name: "Albert Malikov", initials: "AM", color: "bg-teal-500" },
      { name: "Ivan Bovyrin", initials: "IB", color: "bg-purple-500" },
    ],
  },
  {
    id: "10",
    title: "Reconcile - VAT on Purchases",
    status: "waiting_review",
    hasAgent: true,
    entity: "NL",
    assignees: [{ name: "Albert Malikov", initials: "AM", color: "bg-teal-500" }],
  },
  // Reviewed (sample of completed tasks)
  {
    id: "11",
    title: "Reconcile - Cash and Cash Equivalents",
    status: "reviewed",
    entity: "NL",
    category: "Financial Reporting",
    assignees: [{ name: "Koen Bentvelsen", image: "/avatars/koen.jpg" }],
  },
  {
    id: "12",
    title: "Post depreciation journal entries",
    status: "reviewed",
    entity: "DE",
    category: "Journal entries",
    assignees: [{ name: "Kyle Kinsey", image: "/avatars/kyle.jpg" }],
  },
]

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

function TaskRow({ task }: { task: Task }) {
  const getStatusIndicator = () => {
    switch (task.status) {
      case "overdue":
        return (
          <div className="h-4 w-4 rounded-full border-2 border-amber-400 flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-amber-400" />
          </div>
        )
      case "waiting_review":
        return <div className="h-4 w-4 rounded-full bg-blue-500" />
      case "reviewed":
        return <div className="h-4 w-4 rounded-full bg-neutral-300" />
      default:
        return <Circle className="h-4 w-4 text-neutral-300" strokeWidth={2} />
    }
  }

  return (
    <div className="group flex items-center gap-4 py-3 px-4 hover:bg-neutral-50 transition-colors border-b border-neutral-100 last:border-b-0">
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

      {/* Entity Tag */}
      {task.entity && (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0 px-2 py-0.5 text-[11px] font-medium shrink-0">
          {task.entity}
        </Badge>
      )}

      {/* Category Tag */}
      {task.category && (
        <Badge className="bg-neutral-100 text-neutral-600 hover:bg-neutral-100 border-0 px-2 py-0.5 text-[11px] font-medium shrink-0 max-w-[140px] truncate">
          {task.category}
        </Badge>
      )}

      {/* Due Date */}
      <div className="flex items-center gap-1.5 text-xs text-neutral-500 shrink-0 w-20">
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
}: {
  group: { key: string; label: string; count: number }
  tasks: Task[]
  isExpanded: boolean
  onToggle: () => void
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
            <TaskRow key={task.id} task={task} />
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

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupKey) ? prev.filter((k) => k !== groupKey) : [...prev, groupKey]
    )
  }

  const getTasksForGroup = (groupKey: string) => {
    return tasks.filter((task) => task.status === groupKey)
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar activePage="checklist" />
      <div className="flex flex-1 flex-col overflow-hidden border-l border-neutral-200">
        {/* Top Navbar */}
        <Navbar
          breadcrumbs={[
            { label: "Month-end Close" },
            { label: "September", hasDropdown: true },
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
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

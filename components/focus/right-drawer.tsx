"use client"

import { 
  MoreHorizontal, 
  Calendar, 
  CalendarCheck,
  RefreshCw, 
  ArrowRight, 
  ExternalLink,
  CheckCircle2,
  Check,
  Link as LinkIcon,
  Plus
} from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bottleneck } from "@/lib/focus-helpers"
import { getUserById, entities, Task, currentUserId } from "@/lib/focus-data"
import { cn } from "@/lib/utils"

// Link types for external resources
export interface TaskLink {
  title: string
  url: string
  favicon?: "oracle" | "drive" | "slack" | "xls" | "generic"
}

// Extended task interface for drawer display
export interface DrawerTask {
  id: string
  title: string
  entity: string
  category: string
  description?: string
  frequency?: string
  taskStatus?: "pending" | "in_progress" | "waiting_review" | "approved" | "rejected"
  currentUserRole?: "preparer" | "reviewer" | "viewer" // What role the current user has
  preparer?: {
    id: string
    name: string
    initials?: string
    avatar?: string
    color?: string
    dueDate?: string
    status?: "pending" | "submitted" | "completed"
    completedAt?: string // Timestamp when submitted
  }
  reviewer?: {
    id: string
    name: string
    initials?: string
    avatar?: string
    color?: string
    dueDate?: string
    status?: "waiting" | "reviewing" | "approved" | "rejected"
  }
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
  links?: TaskLink[]
}

interface RightDrawerProps {
  bottleneck?: Bottleneck | null
  task?: DrawerTask | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Task-specific descriptions for more realistic content
const taskDescriptions: Record<string, string> = {
  "t1": "Close the accounting period in the ERP system after all journal entries and reconciliations are completed. This is a critical step that locks the period for financial reporting.",
  "t2": "Reconcile the HSBC EUR Operations account ending in *0298 by matching bank transactions with GL entries. Investigate and resolve any discrepancies.",
  "t7": "Reconcile the Barclays EUR Cash account ending in *7605. Match all bank transactions with corresponding GL entries and document any exceptions.",
  "t10": "Submit the payroll journal entry to record employee compensation, benefits, and related tax withholdings for the current period.",
}

// Task-specific account balances for reconciliation tasks
const taskBalances: Record<string, { recBalance: number; glBalance: number; difference: number; differencePercent: number; currency: string }> = {
  "t2": { recBalance: 856420.50, glBalance: 862150.00, difference: 5729.50, differencePercent: 0.66, currency: "€" },
  "t7": { recBalance: 124350.00, glBalance: 124350.00, difference: 0, differencePercent: 0, currency: "€" },
}

// Convert Bottleneck to DrawerTask
function bottleneckToDrawerTask(bottleneck: Bottleneck): DrawerTask {
  const { task } = bottleneck
  const preparer = getUserById(task.ownerId)
  const reviewer = task.reviewerId ? getUserById(task.reviewerId) : null
  
  // Determine current user's role
  const isCurrentUserPreparer = task.ownerId === currentUserId
  const isCurrentUserReviewer = task.reviewerId === currentUserId
  const currentUserRole: "preparer" | "reviewer" | "viewer" = 
    isCurrentUserPreparer ? "preparer" : 
    isCurrentUserReviewer ? "reviewer" : "viewer"
  
  // Generate task-specific data for demo purposes
  const isReconciliation = task.category.toLowerCase().includes("reconciliation")
  const taskBalance = taskBalances[task.id]
  
  // Determine task status based on workflow
  let taskStatus: DrawerTask["taskStatus"] = "pending"
  if (task.status === "done") {
    taskStatus = "approved"
  } else if (task.status === "in_progress") {
    taskStatus = isCurrentUserReviewer ? "waiting_review" : "in_progress"
  } else if (task.status === "blocked") {
    taskStatus = "pending"
  }
  
  // Determine preparer status
  let preparerStatus: "pending" | "submitted" | "completed" = "pending"
  if (task.status === "done") {
    preparerStatus = "completed"
  } else if (task.status === "in_progress" && !isCurrentUserPreparer) {
    // If it's in progress and current user is reviewer, preparer has submitted
    preparerStatus = "submitted"
  } else if (task.status === "in_progress") {
    preparerStatus = "pending"
  }
  
  return {
    id: task.id,
    title: task.title,
    entity: task.entity,
    category: task.category,
    description: taskDescriptions[task.id] || bottleneck.notes || task.blockedReason || "Cross-check records to confirm balances align. Flag any missing or unmatched transactions for further investigation and resolution.",
    frequency: "Every Month",
    taskStatus,
    currentUserRole,
    preparer: preparer ? {
      id: preparer.id,
      name: preparer.name,
      initials: preparer.initials,
      avatar: preparer.avatar,
      color: preparer.color,
      dueDate: formatDate(task.dueDate),
      status: preparerStatus,
    } : undefined,
    reviewer: reviewer ? {
      id: reviewer.id,
      name: reviewer.name,
      initials: reviewer.initials,
      avatar: reviewer.avatar,
      color: reviewer.color,
      dueDate: addDays(task.dueDate, 1),
      status: task.status === "done" ? "approved" : "waiting",
    } : undefined,
    supportingFile: isReconciliation ? {
      name: `${task.entity}_Bank_${new Date().toLocaleString('default', { month: 'long' })}${new Date().getFullYear()}.xlsx`,
      size: "4.5 Mb",
      type: "xls",
    } : undefined,
    accountBalance: taskBalance || (isReconciliation ? {
      recBalance: 991000,
      glBalance: 1000000,
      difference: 9000,
      differencePercent: 0.9,
      currency: "€",
    } : undefined),
    transactionMatching: isReconciliation ? {
      progress: taskBalance?.difference === 0 ? 1000 : 985,
      total: 1000,
      difference: taskBalance?.difference || 0,
      differencePercent: taskBalance?.differencePercent || 0,
      currency: "€",
    } : undefined,
    links: getTaskLinks(task.id),
  }
}

// Task-specific links
function getTaskLinks(taskId: string): TaskLink[] | undefined {
  const links: Record<string, TaskLink[]> = {
    "t2": [
      { title: "HSBC Bank Statement Jan 2026", url: "https://drive.google.com/file/hsbc-statement", favicon: "drive" },
      { title: "Oracle NetSuite - Bank Account", url: "https://netsuite.com/bank/hsbc", favicon: "oracle" },
    ],
    "t7": [
      { title: "Barclays Bank Statement", url: "https://drive.google.com/file/barclays-statement", favicon: "drive" },
      { title: "FX Rate Confirmation Thread", url: "https://slack.com/thread/treasury", favicon: "slack" },
    ],
    "t1": [
      { title: "Period Close Checklist", url: "https://drive.google.com/file/close-checklist", favicon: "drive" },
      { title: "Oracle NetSuite - Period Close", url: "https://netsuite.com/period-close", favicon: "oracle" },
    ],
    "t10": [
      { title: "Payroll Report Jan 2026", url: "https://drive.google.com/file/payroll-report", favicon: "xls" },
    ],
  }
  return links[taskId]
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short" })
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr)
  date.setDate(date.getDate() + days)
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short" })
}

function formatCurrency(value: number, currency: string): string {
  return `${currency}${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// Get status badge config
function getStatusBadge(status?: string): { label: string; className: string } | null {
  switch (status) {
    case "waiting_review":
      return { label: "Waiting for review", className: "bg-blue-50 text-blue-700 border-blue-200" }
    case "in_progress":
      return { label: "In progress", className: "bg-yellow-50 text-yellow-700 border-yellow-200" }
    case "approved":
      return { label: "Approved", className: "bg-green-50 text-green-700 border-green-200" }
    case "rejected":
      return { label: "Rejected", className: "bg-red-50 text-red-700 border-red-200" }
    case "pending":
      return { label: "Not started", className: "bg-neutral-50 text-neutral-600 border-neutral-200" }
    default:
      return null
  }
}

// Get favicon component for links
function LinkFavicon({ type }: { type?: TaskLink["favicon"] }) {
  switch (type) {
    case "oracle":
      return (
        <Image 
          src="/oracle.png" 
          alt="Oracle NetSuite" 
          width={32} 
          height={32} 
          className="rounded"
        />
      )
    case "drive":
      return (
        <Image 
          src="/drive.png" 
          alt="Google Drive" 
          width={32} 
          height={32}
          className="rounded"
        />
      )
    case "slack":
      return (
        <Image 
          src="/slack.png" 
          alt="Slack" 
          width={32} 
          height={32}
          className="rounded"
        />
      )
    case "xls":
      return (
        <Image 
          src="/xls.png" 
          alt="Excel" 
          width={32} 
          height={32}
          className="rounded"
        />
      )
    default:
      return (
        <div className="h-8 w-8 rounded bg-neutral-100 flex items-center justify-center">
          <LinkIcon className="h-4 w-4 text-neutral-500" />
        </div>
      )
  }
}

// Reconciliation icon component
function ReconcileIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="10" rx="1" />
      <rect x="14" y="11" width="7" height="10" rx="1" />
      <path d="M10 8h4" />
      <path d="M10 16h4" />
    </svg>
  )
}

export function RightDrawer({ bottleneck, task: directTask, open, onOpenChange }: RightDrawerProps) {
  // Convert bottleneck to drawer task if provided
  const task: DrawerTask | null = directTask || (bottleneck ? bottleneckToDrawerTask(bottleneck) : null)
  
  if (!task) return null
  
  const entity = entities[task.entity]
  const statusBadge = getStatusBadge(task.taskStatus)
  const isReviewer = task.currentUserRole === "reviewer"
  const canApprove = isReviewer && task.taskStatus === "waiting_review"
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[420px] sm:max-w-[420px] p-0 flex flex-col" aria-describedby={undefined}>
        <SheetTitle className="sr-only">{task.title}</SheetTitle>
        <SheetDescription className="sr-only">Task details for {task.title}</SheetDescription>
        <ScrollArea className="flex-1 overflow-hidden">
          <div className="p-6 space-y-5">
            {/* Header with icon, status badge, and menu */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-500">
                  <ReconcileIcon className="h-4 w-4" />
                </div>
                {statusBadge && (
                  <Badge variant="outline" className={cn("text-xs font-medium", statusBadge.className)}>
                    {statusBadge.label}
                  </Badge>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-neutral-600">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit task</DropdownMenuItem>
                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                  <DropdownMenuItem>Copy link</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <Separator />
            
            {/* Title */}
            <h2 className="text-xl font-semibold text-neutral-900 leading-tight pr-4">
              {task.title}
            </h2>
            
            {/* Tags row (only show if no status badge or for additional context) */}
            {!statusBadge && (
              <div className="flex items-center gap-2 flex-wrap">
                {entity && (
                  <div className="flex items-center gap-1.5">
                    <span className={cn("h-2 w-2 rounded-full shrink-0", entity.dotColor)} />
                    <span className="inline-flex items-center rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] font-medium text-neutral-500 uppercase tracking-wide">
                      {entity.code}
                    </span>
                  </div>
                )}
                <Badge variant="secondary" className="bg-neutral-100 text-neutral-600 hover:bg-neutral-100 border-0 px-2 py-0.5 text-xs font-normal">
                  {task.category}
                </Badge>
                {task.frequency && (
                  <Badge variant="secondary" className="bg-neutral-100 text-neutral-600 hover:bg-neutral-100 border-0 px-2 py-0.5 text-xs font-normal gap-1">
                    <RefreshCw className="h-3 w-3" />
                    {task.frequency}
                  </Badge>
                )}
              </div>
            )}
            
            {/* Description */}
            {task.description && (
              <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-100">
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {task.description}
                </p>
              </div>
            )}
            
            {/* People section */}
            <div className="space-y-3">
              {/* Preparer */}
              {task.preparer && (
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {task.preparer.avatar && <AvatarImage src={task.preparer.avatar} alt={task.preparer.name} />}
                      <AvatarFallback className={cn("text-sm font-medium text-white", task.preparer.color)}>
                        {task.preparer.initials || task.preparer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">
                        {task.preparer.name}
                      </p>
                      <p className="text-xs text-neutral-500">Preparer</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 border border-neutral-200 rounded-md px-2.5 py-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {task.preparer.dueDate}
                    </div>
                    {task.preparer.status === "completed" || task.preparer.completedAt ? (
                      <div className="flex items-center gap-1.5 text-xs text-green-600">
                        <Check className="h-3.5 w-3.5" />
                        <span>{task.preparer.completedAt || "Completed"}</span>
                      </div>
                    ) : task.preparer.status === "submitted" ? (
                      <div className="flex items-center gap-1.5 text-xs text-blue-600">
                        <Check className="h-3.5 w-3.5" />
                        <span>Submitted</span>
                      </div>
                    ) : task.currentUserRole === "preparer" ? (
                      <Button size="sm" className="h-8 px-4 text-xs bg-red-500 hover:bg-red-600 text-white">
                        Submit
                      </Button>
                    ) : (
                      <span className="text-xs text-neutral-400">Pending</span>
                    )}
                  </div>
                </div>
              )}
              
              {/* Reviewer */}
              {task.reviewer && (
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {task.reviewer.avatar && <AvatarImage src={task.reviewer.avatar} alt={task.reviewer.name} />}
                      <AvatarFallback className={cn("text-sm font-medium text-white", task.reviewer.color)}>
                        {task.reviewer.initials || task.reviewer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">
                        {task.reviewer.name}
                      </p>
                      <p className="text-xs text-neutral-500">Reviewer</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 border border-neutral-200 rounded-md px-2.5 py-1.5">
                      <CalendarCheck className="h-3.5 w-3.5" />
                      {task.reviewer.dueDate}
                    </div>
                    {task.reviewer.status === "approved" ? (
                      <span className="text-xs text-green-600 font-medium">Approved</span>
                    ) : task.reviewer.status === "rejected" ? (
                      <span className="text-xs text-red-600 font-medium">Rejected</span>
                    ) : canApprove ? (
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                          Reject
                        </Button>
                        <Button size="sm" className="h-8 px-4 text-xs bg-neutral-900 hover:bg-neutral-800 text-white">
                          Approve
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-400">Waiting</span>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Links section */}
            {task.links && task.links.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-neutral-900">Links</h3>
                  <Button variant="outline" size="sm" className="h-7 px-3 text-xs gap-1.5 font-normal">
                    <LinkIcon className="h-3 w-3" />
                    Add link
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {task.links.map((link, index) => (
                    <a 
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      <LinkFavicon type={link.favicon} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900">{link.title}</p>
                        <p className="text-xs text-neutral-500 truncate">{link.url}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            {/* Account Balance section */}
            {task.accountBalance && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-neutral-900">Account Balance</h3>
                  <Button variant="outline" size="sm" className="h-7 px-3 text-xs gap-1.5 font-normal">
                    See all accounts
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
                
                {/* Supporting file */}
                {task.supportingFile && (
                  <div>
                    <p className="text-xs text-neutral-500 mb-2">Supporting file*</p>
                    <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Image 
                          src="/xls.png" 
                          alt="Excel file" 
                          width={36} 
                          height={36}
                          className="rounded"
                        />
                        <div>
                          <p className="text-sm font-medium text-neutral-900">{task.supportingFile.name}</p>
                          <p className="text-xs text-neutral-500">{task.supportingFile.size}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Balance data */}
                <div className="border border-neutral-200 rounded-lg divide-y divide-neutral-100">
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-neutral-500">Rec. Balance</span>
                    <span className="text-sm font-medium text-neutral-900 tabular-nums">
                      {formatCurrency(task.accountBalance.recBalance, task.accountBalance.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm text-neutral-500">GL Balance</span>
                      <RefreshCw className="h-3 w-3 text-neutral-400" />
                    </div>
                    <span className="text-sm font-medium text-neutral-900 tabular-nums">
                      {formatCurrency(task.accountBalance.glBalance, task.accountBalance.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 bg-neutral-50/50">
                    <span className="text-sm text-neutral-500">Difference</span>
                    <div className="flex items-center gap-2">
                      <Badge className={cn(
                        "px-1.5 py-0 text-[10px] font-medium border-0",
                        task.accountBalance.differencePercent > 0 
                          ? "bg-red-100 text-red-600" 
                          : "bg-green-100 text-green-600"
                      )}>
                        {task.accountBalance.differencePercent}%
                      </Badge>
                      <span className={cn(
                        "text-sm font-medium tabular-nums",
                        task.accountBalance.differencePercent > 0 ? "text-red-600" : "text-green-600"
                      )}>
                        {formatCurrency(task.accountBalance.difference, task.accountBalance.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* AI Transaction Matching section */}
            {task.transactionMatching && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-neutral-900">AI Transaction Matching</h3>
                  <Button variant="outline" size="sm" className="h-7 px-3 text-xs gap-1.5 font-normal">
                    Open
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="border border-neutral-200 rounded-lg divide-y divide-neutral-100">
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-neutral-500">Matching Progress</span>
                    <div className="flex items-center gap-1.5">
                      {task.transactionMatching.progress === task.transactionMatching.total && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                      <span className="text-sm font-medium text-neutral-900 tabular-nums">
                        {task.transactionMatching.progress}/{task.transactionMatching.total}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-neutral-500">Difference</span>
                    <div className="flex items-center gap-2">
                      <Badge className={cn(
                        "px-1.5 py-0 text-[10px] font-medium border-0",
                        task.transactionMatching.differencePercent > 0 
                          ? "bg-red-100 text-red-600" 
                          : "bg-green-100 text-green-600"
                      )}>
                        {task.transactionMatching.differencePercent}%
                      </Badge>
                      <span className={cn(
                        "text-sm font-medium tabular-nums",
                        task.transactionMatching.differencePercent > 0 ? "text-red-600" : "text-green-600"
                      )}>
                        {formatCurrency(task.transactionMatching.difference, task.transactionMatching.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

"use client"

import { ChevronRight, Circle, AlertCircle, Clock, GitBranch } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bottleneck } from "@/lib/focus-helpers"
import { getUserById, entities } from "@/lib/focus-data"
import { cn } from "@/lib/utils"

const reasonTypeConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  data: { 
    label: "Missing data", 
    color: "text-neutral-600 bg-neutral-100", 
    icon: <AlertCircle className="h-3 w-3" /> 
  },
  approval: { 
    label: "Pending approval", 
    color: "text-neutral-600 bg-neutral-100", 
    icon: <Clock className="h-3 w-3" /> 
  },
  dependency: { 
    label: "Blocked by dependency", 
    color: "text-neutral-600 bg-neutral-100", 
    icon: <GitBranch className="h-3 w-3" /> 
  },
  exception: { 
    label: "Exception", 
    color: "text-neutral-600 bg-neutral-100", 
    icon: <AlertCircle className="h-3 w-3" /> 
  },
  overdue: { 
    label: "Overdue", 
    color: "text-red-600 bg-red-50", 
    icon: <Clock className="h-3 w-3" /> 
  },
}

interface BottleneckListProps {
  bottlenecks: Bottleneck[]
  onSelectBottleneck: (bottleneck: Bottleneck) => void
}

export function BottleneckList({ bottlenecks, onSelectBottleneck }: BottleneckListProps) {
  if (bottlenecks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-neutral-200 bg-white">
        <Circle className="h-8 w-8 text-green-500 mb-3" strokeWidth={1.5} />
        <h3 className="text-sm font-medium text-neutral-900 mb-1">Everything on track</h3>
        <p className="text-sm text-neutral-500 max-w-sm">
          No bottlenecks detected for the current filters.
        </p>
      </div>
    )
  }
  
  return (
    <div className="rounded-xl border border-neutral-200 bg-white divide-y divide-neutral-100">
      {bottlenecks.map((bottleneck, index) => {
        const { task } = bottleneck
        const owner = getUserById(task.ownerId)
        const entity = entities[task.entity]
        
        // Calculate days until due
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const dueDate = new Date(task.dueDate)
        dueDate.setHours(0, 0, 0, 0)
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        const isOverdue = daysUntilDue < 0
        const isBlocked = task.status === "blocked"
        
        return (
          <button
            key={task.id}
            onClick={() => onSelectBottleneck(bottleneck)}
            className="w-full text-left group"
          >
            <div className="flex items-center gap-4 px-4 py-3 hover:bg-neutral-50 transition-colors">
              {/* Status indicator */}
              <div className="shrink-0">
                {isBlocked ? (
                  <div className="h-4 w-4 rounded-full border-[1.5px] border-red-500 bg-white flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  </div>
                ) : isOverdue ? (
                  <div className="h-4 w-4 rounded-full border-[1.5px] border-amber-400 bg-white flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  </div>
                ) : (
                  <div className="h-4 w-4 rounded-full border-[1.5px] border-neutral-300 bg-white" />
                )}
              </div>
              
              {/* Main content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-900 truncate group-hover:text-neutral-700">
                    {task.title}
                  </span>
                  {bottleneck.isOnCriticalPath && (
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" title="Critical path" />
                  )}
                </div>
              </div>
              
              {/* Entity - matching main dashboard style */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={cn("h-2 w-2 rounded-full", entity.dotColor)} />
                <span className="inline-flex items-center rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500 uppercase tracking-wide">
                  {entity.code}
                </span>
              </div>
              
              {/* Owner */}
              {owner && (
                <Avatar className="h-6 w-6 shrink-0">
                  {owner.avatar && <AvatarImage src={owner.avatar} alt={owner.name} />}
                  <AvatarFallback className={cn("text-[10px] font-medium text-white", owner.color)}>
                    {owner.initials}
                  </AvatarFallback>
                </Avatar>
              )}
              
              <ChevronRight className="h-4 w-4 text-neutral-300 shrink-0 group-hover:text-neutral-500" />
            </div>
          </button>
        )
      })}
    </div>
  )
}

// Compact version for the Focus Inbox drawer
export function BottleneckListCompact({ 
  bottlenecks, 
  onSelectBottleneck,
  maxItems = 5
}: BottleneckListProps & { maxItems?: number }) {
  const displayedBottlenecks = bottlenecks.slice(0, maxItems)
  
  if (bottlenecks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center px-4">
        <Circle className="h-6 w-6 text-green-500 mb-2" strokeWidth={1.5} />
        <h3 className="text-sm font-medium text-neutral-900 mb-1">All clear</h3>
        <p className="text-xs text-neutral-500">No bottlenecks to address right now.</p>
      </div>
    )
  }
  
  return (
    <div className="divide-y divide-neutral-100">
      {displayedBottlenecks.map((bottleneck) => {
        const { task } = bottleneck
        const owner = getUserById(task.ownerId)
        const entity = entities[task.entity]
        const reasonConfig = reasonTypeConfig[bottleneck.reasonType] || reasonTypeConfig.dependency
        const isBlocked = task.status === "blocked"
        
        // Calculate days until due
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const dueDate = new Date(task.dueDate)
        dueDate.setHours(0, 0, 0, 0)
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        const isOverdue = daysUntilDue < 0
        
        // Format due date display
        const formatDueDate = () => {
          if (daysUntilDue === 0) return "Due today"
          if (daysUntilDue === 1) return "Due tomorrow"
          if (daysUntilDue === -1) return "1d overdue"
          if (daysUntilDue < 0) return `${Math.abs(daysUntilDue)}d overdue`
          return `${daysUntilDue}d left`
        }
        
        return (
          <button
            key={task.id}
            onClick={() => onSelectBottleneck(bottleneck)}
            className="w-full text-left group"
          >
            <div className="flex items-start gap-3 pl-4 pr-5 py-3 hover:bg-neutral-50 transition-colors">
              {/* Status dot */}
              <div className={cn(
                "h-2.5 w-2.5 rounded-full shrink-0 border mt-1",
                isBlocked 
                  ? "border-red-500 bg-white flex items-center justify-center" 
                  : "border-amber-500 bg-white flex items-center justify-center"
              )}>
                <div className={cn(
                  "h-1 w-1 rounded-full",
                  isBlocked ? "bg-red-500" : "bg-amber-500"
                )} />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <p className="text-sm text-neutral-900 truncate group-hover:text-neutral-700">
                  {task.title}
                </p>
                
                {/* Badges row */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Entity badge - colored dot + neutral pill */}
                  <div className="flex items-center gap-1 rounded-full bg-neutral-100 pl-1.5 pr-2 py-0.5">
                    <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", entity.dotColor)} />
                    <span className="text-[10px] font-medium text-neutral-600 uppercase tracking-wide">
                      {entity.code}
                    </span>
                  </div>
                  
                  {/* Reason tag */}
                  <span className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                    reasonConfig.color
                  )}>
                    {reasonConfig.icon}
                    {reasonConfig.label}
                  </span>
                  
                  {/* Due date badge */}
                  <span className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] tabular-nums",
                    isOverdue 
                      ? "border-red-200 text-red-600 bg-red-50" 
                      : "border-neutral-200 text-neutral-500"
                  )}>
                    <Clock className="h-2.5 w-2.5" />
                    {formatDueDate()}
                  </span>
                </div>
              </div>
              
              {/* Owner avatar */}
              {owner && (
                <Avatar className="h-6 w-6 shrink-0">
                  {owner.avatar && <AvatarImage src={owner.avatar} alt={owner.name} />}
                  <AvatarFallback className={cn("text-[9px] font-medium text-white", owner.color)}>
                    {owner.initials}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </button>
        )
      })}
      
      {bottlenecks.length > maxItems && (
        <div className="px-4 py-2 text-xs text-neutral-500 text-center">
          +{bottlenecks.length - maxItems} more
        </div>
      )}
    </div>
  )
}

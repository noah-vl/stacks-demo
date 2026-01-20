"use client"

import { ChevronRight, Circle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bottleneck } from "@/lib/focus-helpers"
import { getUserById, entities } from "@/lib/focus-data"
import { cn } from "@/lib/utils"

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
                  <div className="h-4 w-4 rounded-full bg-red-500" />
                ) : isOverdue ? (
                  <div className="h-4 w-4 rounded-full border-2 border-amber-400 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-amber-400" />
                  </div>
                ) : (
                  <Circle className="h-4 w-4 text-neutral-300" strokeWidth={2} />
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
              
              {/* Entity */}
              <Badge className={cn("shrink-0 border-0 px-2 py-0.5 text-[11px] font-medium", entity.color)}>
                {entity.code}
              </Badge>
              
              {/* Time impact */}
              <span className="text-xs text-neutral-500 tabular-nums shrink-0 w-12 text-right">
                {bottleneck.timeImpact}h
              </span>
              
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
        const isBlocked = task.status === "blocked"
        
        return (
          <button
            key={task.id}
            onClick={() => onSelectBottleneck(bottleneck)}
            className="w-full text-left group"
          >
            <div className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors">
              {/* Status dot */}
              <div className={cn(
                "h-2 w-2 rounded-full shrink-0",
                isBlocked ? "bg-red-500" : "bg-amber-500"
              )} />
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-neutral-900 truncate group-hover:text-neutral-700">
                  {task.title}
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {task.entity} · {bottleneck.timeImpact}h impact
                </p>
              </div>
              
              {/* Owner avatar */}
              {owner && (
                <Avatar className="h-5 w-5 shrink-0">
                  {owner.avatar && <AvatarImage src={owner.avatar} alt={owner.name} />}
                  <AvatarFallback className={cn("text-[8px] font-medium text-white", owner.color)}>
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

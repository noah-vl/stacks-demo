"use client"

import { Check, Circle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CriticalPathNode } from "@/lib/focus-helpers"
import { getUserById, entities } from "@/lib/focus-data"
import { cn } from "@/lib/utils"

interface CriticalPathViewProps {
  criticalPath: CriticalPathNode[]
  onSelectNode: (node: CriticalPathNode) => void
}

export function CriticalPathView({ criticalPath, onSelectNode }: CriticalPathViewProps) {
  if (criticalPath.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Circle className="h-8 w-8 text-green-500 mb-3" strokeWidth={1.5} />
        <h3 className="text-sm font-medium text-neutral-900 mb-1">All complete</h3>
        <p className="text-sm text-neutral-500">
          Critical path tasks have been completed.
        </p>
      </div>
    )
  }
  
  // Calculate total hours on critical path
  const totalHours = criticalPath.reduce((sum, node) => sum + node.task.estimatedHours, 0)
  const completedHours = criticalPath
    .filter((node) => node.task.status === "done")
    .reduce((sum, node) => sum + node.task.estimatedHours, 0)
  
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-500">{criticalPath.length} tasks · {totalHours}h total</span>
        <span className="text-neutral-500 tabular-nums">{totalHours - completedHours}h remaining</span>
      </div>
      
      {/* Progress bar */}
      <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#342D87] rounded-full transition-all duration-500"
          style={{ width: `${(completedHours / totalHours) * 100}%` }}
        />
      </div>
      
      {/* Timeline */}
      <div className="relative pl-5 pt-2">
        {/* Vertical line */}
        <div className="absolute left-[7px] top-6 bottom-2 w-px bg-neutral-200" />
        
        <div className="space-y-0">
          {criticalPath.map((node, index) => {
            const { task } = node
            const owner = getUserById(task.ownerId)
            const entity = entities[task.entity]
            
            const isDone = task.status === "done"
            const isBlocked = node.isBlocked
            const isOverdue = node.isOverdue
            const isInProgress = task.status === "in_progress"
            
            const formatDate = (dateStr: string) => {
              return new Date(dateStr).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            }
            
            return (
              <button
                key={task.id}
                onClick={() => onSelectNode(node)}
                className="w-full text-left group relative"
                disabled={isDone}
              >
                <div className={cn(
                  "flex items-start gap-3 py-2.5 -ml-5 pl-5 rounded-lg transition-colors",
                  !isDone && "hover:bg-neutral-50"
                )}>
                  {/* Status dot */}
                  <div className="relative z-10 shrink-0 mt-1">
                    {isDone ? (
                      <div className="h-3.5 w-3.5 rounded-full bg-[#342D87] flex items-center justify-center">
                        <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                      </div>
                    ) : isBlocked ? (
                      <div className="h-3.5 w-3.5 rounded-full bg-red-500" />
                    ) : isOverdue ? (
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-amber-400 bg-white flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      </div>
                    ) : isInProgress ? (
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-[#342D87] bg-white flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#342D87]" />
                      </div>
                    ) : (
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-neutral-300 bg-white" />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm leading-snug",
                      isDone ? "text-neutral-400" : "text-neutral-900"
                    )}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[10px] font-medium",
                        isDone ? "bg-neutral-100 text-neutral-400" : entity.color
                      )}>
                        {entity.code}
                      </span>
                      <span className={cn(isOverdue && !isDone && "text-red-600")}>
                        {formatDate(task.dueDate)}
                      </span>
                      <span className="tabular-nums">{task.estimatedHours}h</span>
                      {owner && (
                        <Avatar className="h-4 w-4 ml-auto">
                          {owner.avatar && <AvatarImage src={owner.avatar} alt={owner.name} />}
                          <AvatarFallback className={cn(
                            "text-[8px] font-medium text-white",
                            isDone ? "bg-neutral-300" : owner.color
                          )}>
                            {owner.initials}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

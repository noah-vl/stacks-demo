"use client"

import { motion, AnimatePresence } from "framer-motion"
import { 
  ChevronRight, 
  Circle, 
  AlertCircle,
  Clock,
  GitBranch,
  Zap,
  ArrowRight
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Bottleneck } from "@/lib/focus-helpers"
import { getUserById, entities, currentUserId } from "@/lib/focus-data"
import { cn } from "@/lib/utils"

interface EnhancedBottleneckListProps {
  bottlenecks: Bottleneck[]
  onSelectBottleneck: (bottleneck: Bottleneck) => void
}

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

export function EnhancedBottleneckList({ bottlenecks, onSelectBottleneck }: EnhancedBottleneckListProps) {
  if (bottlenecks.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-neutral-200 bg-gradient-to-b from-white to-neutral-50/50"
      >
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <Circle className="h-6 w-6 text-emerald-600" strokeWidth={1.5} />
        </div>
        <h3 className="text-sm font-medium text-neutral-900 mb-1">Everything on track</h3>
        <p className="text-sm text-neutral-500 max-w-xs">
          No bottlenecks detected. The close is progressing smoothly.
        </p>
      </motion.div>
    )
  }
  
  // Calculate totals for header
  const totalDownstream = bottlenecks.reduce((sum, b) => sum + b.downstreamCount, 0)
  
  return (
    <div className="space-y-3">
      {/* Summary stats */}
      <div className="flex items-center gap-4 px-1">
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-neutral-600">
            <span className="font-medium text-neutral-900">{bottlenecks.length}</span> blockers
          </span>
        </div>
        {totalDownstream > 0 && (
          <>
            <div className="w-px h-3 bg-neutral-200" />
            <div className="flex items-center gap-1.5 text-xs text-neutral-600">
              <GitBranch className="h-3 w-3 text-neutral-400" />
              <span className="font-medium text-neutral-900">{totalDownstream}</span>
              <span>tasks blocked</span>
            </div>
          </>
        )}
      </div>
      
      {/* Bottleneck list */}
      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
        <AnimatePresence mode="popLayout">
          {bottlenecks.map((bottleneck, index) => (
            <BottleneckItem 
              key={bottleneck.task.id}
              bottleneck={bottleneck}
              index={index}
              isLast={index === bottlenecks.length - 1}
              onSelect={onSelectBottleneck}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function BottleneckItem({ 
  bottleneck, 
  index, 
  isLast,
  onSelect 
}: { 
  bottleneck: Bottleneck
  index: number
  isLast: boolean
  onSelect: (bottleneck: Bottleneck) => void
}) {
  const { task } = bottleneck
  const preparer = getUserById(task.ownerId)
  const reviewer = task.reviewerId ? getUserById(task.reviewerId) : null
  const entity = entities[task.entity]
  const reasonConfig = reasonTypeConfig[bottleneck.reasonType] || reasonTypeConfig.dependency
  
  // Determine current user's role in this task
  const isCurrentUserPreparer = task.ownerId === currentUserId
  const isCurrentUserReviewer = task.reviewerId === currentUserId
  
  // Calculate days until due
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDate = new Date(task.dueDate)
  dueDate.setHours(0, 0, 0, 0)
  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  const isOverdue = daysUntilDue < 0
  const isBlocked = task.status === "blocked"
  
  // Format due date display
  const formatDueDate = () => {
    if (daysUntilDue === 0) return "Due today"
    if (daysUntilDue === 1) return "Due tomorrow"
    if (daysUntilDue === -1) return "1 day overdue"
    if (daysUntilDue < 0) return `${Math.abs(daysUntilDue)}d overdue`
    return `${daysUntilDue}d remaining`
  }
  
  return (
    <TooltipProvider delayDuration={400}>
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, delay: index * 0.03 }}
        onClick={() => onSelect(bottleneck)}
        className={cn(
          "w-full text-left group",
          !isLast && "border-b border-neutral-100"
        )}
      >
        <div className="flex items-start gap-4 px-4 py-4 hover:bg-neutral-50/80 transition-colors">
          {/* Status indicator with severity */}
          <div className="shrink-0 pt-0.5">
            {isBlocked ? (
              <div className="relative">
                {/* Blocked - ring style with inner dot like amber */}
                <div className="h-4 w-4 rounded-full border-[1.5px] border-red-500 flex items-center justify-center bg-white">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                </div>
                {bottleneck.isOnCriticalPath && (
                  <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400 border border-white" />
                )}
              </div>
            ) : isOverdue ? (
              <div className="h-4 w-4 rounded-full border-[1.5px] border-amber-400 flex items-center justify-center bg-white">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              </div>
            ) : (
              <div className="h-4 w-4 rounded-full border-[1.5px] border-neutral-300 bg-white" />
            )}
          </div>
          
          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Title row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-neutral-900 truncate group-hover:text-neutral-700 leading-snug">
                    {task.title}
                  </span>
                  {bottleneck.isOnCriticalPath && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="shrink-0">
                          <Zap className="h-3.5 w-3.5 text-amber-500" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        On critical path
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
              
              {/* Assignee avatars - show both preparer and reviewer */}
              <div className="flex items-center -space-x-1.5 shrink-0">
                {/* Preparer avatar */}
                {preparer && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar className={cn(
                        "h-6 w-6 border-2 border-white",
                        isCurrentUserPreparer && "ring-2 ring-purple-200"
                      )}>
                        {preparer.avatar && <AvatarImage src={preparer.avatar} alt={preparer.name} />}
                        <AvatarFallback className={cn("text-[10px] font-medium text-white", preparer.color)}>
                          {preparer.initials}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="text-xs">
                      <span className="font-medium">{preparer.name}</span>
                      <span className="text-neutral-400 ml-1">· Preparer</span>
                    </TooltipContent>
                  </Tooltip>
                )}
                {/* Reviewer avatar */}
                {reviewer && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar className={cn(
                        "h-6 w-6 border-2 border-white",
                        isCurrentUserReviewer && "ring-2 ring-purple-200"
                      )}>
                        {reviewer.avatar && <AvatarImage src={reviewer.avatar} alt={reviewer.name} />}
                        <AvatarFallback className={cn("text-[10px] font-medium text-white", reviewer.color)}>
                          {reviewer.initials}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="text-xs">
                      <span className="font-medium">{reviewer.name}</span>
                      <span className="text-neutral-400 ml-1">· Reviewer</span>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
            
            {/* Meta row */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Entity badge - colored dot + neutral pill */}
              <div className="flex items-center gap-1.5 rounded-full bg-neutral-100 pl-2 pr-2.5 py-0.5">
                <span className={cn("h-2 w-2 rounded-full shrink-0", entity.dotColor)} />
                <span className="text-[11px] font-medium text-neutral-600 uppercase tracking-wide">
                  {entity.code}
                </span>
              </div>
              
              {/* Reason tag - plain pill style */}
              <span className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                reasonConfig.color
              )}>
                {reasonConfig.icon}
                {reasonConfig.label}
              </span>
              
              {/* Due date - bordered badge style */}
              <span className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] tabular-nums",
                isOverdue 
                  ? "border-red-200 text-red-600 bg-red-50" 
                  : "border-neutral-200 text-neutral-500"
              )}>
                <Clock className="h-3 w-3" />
                {formatDueDate()}
              </span>
            </div>
            
            {/* Impact summary */}
            {bottleneck.downstreamCount > 0 && (
              <div className="flex items-center gap-3 text-[11px] text-neutral-500">
                <span className="flex items-center gap-1">
                  <ArrowRight className="h-3 w-3 text-neutral-400" />
                  <span>Blocking <span className="font-medium text-neutral-700">{bottleneck.downstreamCount}</span> task{bottleneck.downstreamCount > 1 ? 's' : ''}</span>
                </span>
              </div>
            )}
          </div>
          
          {/* Arrow */}
          <ChevronRight className="h-4 w-4 text-neutral-300 shrink-0 mt-0.5 group-hover:text-neutral-500 transition-colors" />
        </div>
      </motion.button>
    </TooltipProvider>
  )
}

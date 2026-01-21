"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Check, 
  AlertTriangle,
  Calendar,
  ArrowDown,
  ArrowUp,
  Target,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { CriticalPathNode } from "@/lib/focus-helpers"
import { getUserById, entities } from "@/lib/focus-data"
import { cn } from "@/lib/utils"

// Smooth spring config for natural animations
const smoothSpring = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
}

const gentleSpring = {
  type: "spring" as const,
  stiffness: 300,
  damping: 25,
}

interface EnhancedCriticalPathProps {
  criticalPath: CriticalPathNode[]
  onSelectNode: (node: CriticalPathNode) => void
}

export function EnhancedCriticalPath({ criticalPath, onSelectNode }: EnhancedCriticalPathProps) {
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null)
  
  // Memoize relationship computation for performance
  const relationMap = useMemo(() => {
    const map = new Map<string, { upstream: Set<string>, downstream: Set<string> }>()
    criticalPath.forEach(node => {
      map.set(node.task.id, {
        upstream: new Set(node.dependencies.map(t => t.id)),
        downstream: new Set(node.dependents.map(t => t.id))
      })
    })
    return map
  }, [criticalPath])
  
  const hoveredRelations = hoveredTaskId ? relationMap.get(hoveredTaskId) : null
  
  if (criticalPath.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={gentleSpring}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ ...smoothSpring, delay: 0.1 }}
          className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4"
        >
          <Check className="h-6 w-6 text-emerald-600" />
        </motion.div>
        <h3 className="text-sm font-medium text-neutral-900 mb-1">All complete</h3>
        <p className="text-sm text-neutral-500">
          Critical path tasks have been completed.
        </p>
      </motion.div>
    )
  }
  
  // Count statuses
  const statusCounts = {
    done: criticalPath.filter(n => n.task.status === "done").length,
    inProgress: criticalPath.filter(n => n.task.status === "in_progress").length,
    blocked: criticalPath.filter(n => n.isBlocked).length,
    pending: criticalPath.filter(n => n.task.status === "todo" && !n.isBlocked).length
  }
  
  // Calculate completed count for progress
  const completedCount = statusCounts.done
  const totalCount = criticalPath.length
  const progressPercent = Math.round((completedCount / totalCount) * 100)
  
  // Calculate end date
  const finalTask = criticalPath[criticalPath.length - 1]
  const endDate = finalTask ? new Date(finalTask.task.dueDate) : null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const daysToEnd = endDate 
    ? Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="space-y-5">
      {/* Header with progress */}
      <motion.div 
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        {/* Stats row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm">
            <Target className="h-4 w-4 text-neutral-400" />
            <span className="text-neutral-600">
              <span className="font-medium text-neutral-900">{criticalPath.length}</span> tasks
            </span>
          </div>
          <div className="text-sm tabular-nums text-neutral-600">
            <span className="font-medium text-neutral-900">{completedCount}</span>/{totalCount} complete
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-[#342D87] to-[#4338ca] rounded-full"
            />
          </div>
          
          {/* Status breakdown */}
          <div className="flex items-center gap-3 text-[11px]">
            {statusCounts.done > 0 && (
              <div className="flex items-center gap-1 text-neutral-500">
                <div className="w-2 h-2 rounded-full bg-[#342D87]" />
                <span>{statusCounts.done} done</span>
              </div>
            )}
            {statusCounts.inProgress > 0 && (
              <div className="flex items-center gap-1 text-neutral-500">
                <div className="w-2 h-2 rounded-full border-2 border-[#342D87]" />
                <span>{statusCounts.inProgress} in progress</span>
              </div>
            )}
            {statusCounts.blocked > 0 && (
              <div className="flex items-center gap-1 text-red-600">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span>{statusCounts.blocked} blocked</span>
              </div>
            )}
            {statusCounts.pending > 0 && (
              <div className="flex items-center gap-1 text-neutral-500">
                <div className="w-2 h-2 rounded-full border-2 border-neutral-300" />
                <span>{statusCounts.pending} pending</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
      
      
      {/* Timeline */}
      <div className="relative pl-5">
        {/* Vertical line */}
        <div className="absolute left-[7px] top-4 bottom-4 w-px bg-gradient-to-b from-neutral-200 via-neutral-200 to-transparent" />
        
        <div className="space-y-0.5">
          {criticalPath.map((node, index) => {
            // Determine relationship to hovered item
            let relationToHovered: "upstream" | "downstream" | "self" | null = null
            if (hoveredTaskId) {
              if (node.task.id === hoveredTaskId) {
                relationToHovered = "self"
              } else if (hoveredRelations?.upstream.has(node.task.id)) {
                relationToHovered = "upstream"
              } else if (hoveredRelations?.downstream.has(node.task.id)) {
                relationToHovered = "downstream"
              }
            }
            
            return (
              <CriticalPathItem 
                key={node.task.id}
                node={node}
                index={index}
                total={criticalPath.length}
                onSelect={onSelectNode}
                onHover={setHoveredTaskId}
                isHovered={hoveredTaskId === node.task.id}
                relationToHovered={relationToHovered}
                hasHoveredItem={!!hoveredTaskId}
              />
            )
          })}
        </div>
      </div>
      
      {/* End date indicator */}
      {endDate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between pt-3 border-t border-neutral-100"
        >
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <Calendar className="h-3.5 w-3.5" />
            <span>Target completion</span>
          </div>
          <div className={cn(
            "text-xs font-medium",
            daysToEnd < 0 ? "text-red-600" : "text-neutral-900"
          )}>
            {endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            {daysToEnd >= 0 && (
              <span className="text-neutral-500 font-normal ml-1">
                ({daysToEnd === 0 ? "today" : `${daysToEnd}d`})
              </span>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Animation variants for the item container - instant visibility with subtle entrance
const itemVariants = {
  initial: { opacity: 0.8, x: -4 },
  animate: (index: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      type: "tween" as const,
      duration: 0.1,
      ease: "easeOut" as const,
      delay: index * 0.015,
    }
  }),
}

// Background variants for smooth color transitions
const bgVariants = {
  default: { 
    backgroundColor: "rgba(255, 255, 255, 0)",
    boxShadow: "0 0 0 0px rgba(0, 0, 0, 0)",
    scale: 1,
  },
  hover: { 
    backgroundColor: "rgba(250, 250, 250, 1)",
    boxShadow: "0 0 0 0px rgba(0, 0, 0, 0)",
    scale: 1,
  },
  self: { 
    backgroundColor: "rgba(245, 245, 245, 1)",
    boxShadow: "0 0 0 1px rgba(229, 229, 229, 1)",
    scale: 1.01,
  },
  upstream: { 
    backgroundColor: "rgba(255, 251, 235, 0.8)",
    boxShadow: "inset 2px 0 0 0 rgba(245, 158, 11, 0.5)",
    scale: 1,
  },
  downstream: { 
    backgroundColor: "rgba(239, 246, 255, 0.8)",
    boxShadow: "inset 2px 0 0 0 rgba(59, 130, 246, 0.5)",
    scale: 1,
  },
  faded: {
    backgroundColor: "rgba(255, 255, 255, 0)",
    boxShadow: "0 0 0 0px rgba(0, 0, 0, 0)",
    scale: 1,
  }
}

// Transition config for smooth hover state changes
const bgTransition = {
  type: "tween" as const,
  duration: 0.15,
  ease: "easeOut" as const
}

function CriticalPathItem({ 
  node, 
  index, 
  total,
  onSelect,
  onHover,
  isHovered,
  relationToHovered,
  hasHoveredItem
}: { 
  node: CriticalPathNode
  index: number
  total: number
  onSelect: (node: CriticalPathNode) => void
  onHover: (taskId: string | null) => void
  isHovered: boolean
  relationToHovered: "upstream" | "downstream" | "self" | null
  hasHoveredItem: boolean
}) {
  const { task } = node
  const owner = getUserById(task.ownerId)
  const entity = entities[task.entity]
  
  const isDone = task.status === "done"
  const isBlocked = node.isBlocked
  const isOverdue = node.isOverdue
  const isInProgress = task.status === "in_progress"
  
  // Dependency info
  const upstreamCount = node.dependencies.filter(t => t.status !== "done").length
  const downstreamCount = node.dependents.filter(t => t.status !== "done").length
  const hasDependencyInfo = upstreamCount > 0 || downstreamCount > 0
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }
  
  // Determine animation state
  const isRelated = relationToHovered === "upstream" || relationToHovered === "downstream"
  const isFaded = hasHoveredItem && !isRelated && relationToHovered !== "self"
  
  // Determine background variant
  const getBgVariant = () => {
    if (relationToHovered === "self") return "self"
    if (relationToHovered === "upstream") return "upstream"
    if (relationToHovered === "downstream") return "downstream"
    if (isFaded) return "faded"
    return "default"
  }
  
  return (
    <TooltipProvider delayDuration={400}>
      <motion.button
        variants={itemVariants}
        initial="initial"
        animate="animate"
        custom={index}
        onClick={() => !isDone && onSelect(node)}
        onMouseEnter={() => !isDone && onHover(task.id)}
        onMouseLeave={() => onHover(null)}
        disabled={isDone}
        className={cn(
          "w-full text-left group relative",
          !isDone && "cursor-pointer"
        )}
      >
        <motion.div 
          variants={bgVariants}
          initial="default"
          animate={getBgVariant()}
          whileHover={!isDone && !hasHoveredItem ? "hover" : undefined}
          transition={bgTransition}
          className="flex items-start gap-3 py-3 -ml-5 pl-5 pr-2 rounded-lg relative overflow-hidden"
        >
          {/* Fade overlay for unrelated items */}
          <motion.div
            initial={false}
            animate={{ opacity: isFaded ? 1 : 0 }}
            transition={{ duration: 0.12 }}
            className="absolute inset-0 bg-white/60 pointer-events-none rounded-lg"
          />
          
          {/* Cascade indicator with enter/exit animation */}
          <AnimatePresence mode="popLayout">
            {relationToHovered === "upstream" && (
              <motion.div 
                key="upstream-indicator"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="absolute -left-0.5 top-1/2 -translate-y-1/2 flex items-center z-10"
              >
                <div className="w-1 h-4 rounded-full bg-amber-400" />
              </motion.div>
            )}
            {relationToHovered === "downstream" && (
              <motion.div 
                key="downstream-indicator"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="absolute -left-0.5 top-1/2 -translate-y-1/2 flex items-center z-10"
              >
                <div className="w-1 h-4 rounded-full bg-blue-400" />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Status dot */}
          <div className="relative z-10 shrink-0 mt-0.5">
            {isDone ? (
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={smoothSpring}
                className="h-3.5 w-3.5 rounded-full bg-emerald-500 flex items-center justify-center"
              >
                <Check className="h-2 w-2 text-white" strokeWidth={3} />
              </motion.div>
            ) : isBlocked ? (
              <div className="h-3.5 w-3.5 rounded-full border-[1.5px] border-red-500 bg-white flex items-center justify-center">
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="h-1.5 w-1.5 rounded-full bg-red-500" 
                />
              </div>
            ) : isOverdue ? (
              <div className="h-3.5 w-3.5 rounded-full border-[1.5px] border-amber-400 bg-white flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              </div>
            ) : isInProgress ? (
              <div className="h-3.5 w-3.5 rounded-full border-[1.5px] border-[#342D87] bg-white flex items-center justify-center">
                <motion.div 
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="h-1.5 w-1.5 rounded-full bg-[#342D87]" 
                />
              </div>
            ) : (
              <div className="h-3.5 w-3.5 rounded-full border-[1.5px] border-neutral-300 bg-white" />
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0 space-y-1.5 relative z-10">
            {/* Title */}
            <p className={cn(
              "text-sm leading-snug pr-2",
              isDone ? "text-neutral-400 line-through" : "text-neutral-900"
            )}>
              {task.title}
            </p>
            
            {/* Meta */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Entity badge - colored dot + neutral pill */}
              <div className={cn(
                "flex items-center gap-1.5 rounded-full pl-2 pr-2.5 py-0.5",
                isDone ? "bg-neutral-50" : "bg-neutral-100"
              )}>
                <span className={cn(
                  "h-2 w-2 rounded-full shrink-0",
                  isDone ? "bg-neutral-300" : entity.dotColor
                )} />
                <span className={cn(
                  "text-[10px] font-medium uppercase tracking-wide",
                  isDone ? "text-neutral-400" : "text-neutral-600"
                )}>
                  {entity.code}
                </span>
              </div>
              
              {/* Date badge - bordered style */}
              <span className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] tabular-nums",
                isOverdue && !isDone 
                  ? "border-red-200 text-red-600 bg-red-50" 
                  : isDone 
                    ? "border-neutral-100 text-neutral-400"
                    : "border-neutral-200 text-neutral-500"
              )}>
                <Calendar className="h-3 w-3" />
                {formatDate(task.dueDate)}
              </span>
              
              {isBlocked && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-600 px-2 py-0.5 text-[10px] font-medium">
                  <AlertTriangle className="h-2.5 w-2.5" />
                  Blocked
                </span>
              )}
              
              {/* Dependency indicators - only show on incomplete tasks */}
              {!isDone && hasDependencyInfo && (
                <div className="flex items-center gap-1.5 ml-auto mr-1">
                  {upstreamCount > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.span 
                          className="inline-flex items-center gap-0.5 text-[10px] tabular-nums cursor-default"
                          initial={false}
                          animate={{
                            color: relationToHovered === "upstream" 
                              ? "rgb(245, 158, 11)" 
                              : "rgb(163, 163, 163)"
                          }}
                          transition={{ duration: 0.1 }}
                        >
                          <ArrowUp className="h-2.5 w-2.5" />
                          {upstreamCount}
                        </motion.span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        Waiting on {upstreamCount} task{upstreamCount > 1 ? 's' : ''}
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {downstreamCount > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.span 
                          className="inline-flex items-center gap-0.5 text-[10px] tabular-nums cursor-default"
                          initial={false}
                          animate={{
                            color: relationToHovered === "downstream" 
                              ? "rgb(59, 130, 246)" 
                              : "rgb(163, 163, 163)"
                          }}
                          transition={{ duration: 0.1 }}
                        >
                          <ArrowDown className="h-2.5 w-2.5" />
                          {downstreamCount}
                        </motion.span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        Blocking {downstreamCount} task{downstreamCount > 1 ? 's' : ''}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              )}
              
              {/* Owner avatar */}
              {owner && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar className={cn(
                      "h-4 w-4",
                      !upstreamCount && !downstreamCount && "ml-auto"
                    )}>
                      {owner.avatar && <AvatarImage src={owner.avatar} alt={owner.name} />}
                      <AvatarFallback className={cn(
                        "text-[8px] font-medium text-white",
                        isDone ? "bg-neutral-300" : owner.color
                      )}>
                        {owner.initials}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="text-xs">
                    {owner.name}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            
            {/* Expanded cascade info when hovered - with proper AnimatePresence */}
            <AnimatePresence mode="sync">
              {isHovered && hasDependencyInfo && (
                <motion.div 
                  key="cascade-info"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ 
                    opacity: 1, 
                    height: "auto",
                  }}
                  exit={{ 
                    opacity: 0, 
                    height: 0,
                  }}
                  transition={{
                    height: { duration: 0.15, ease: "easeOut" },
                    opacity: { duration: 0.1 }
                  }}
                  className="overflow-hidden"
                >
                  <div className="pt-2 mt-1 border-t border-neutral-100/80">
                    <div className="flex flex-col gap-1.5 text-[10px]">
                      {upstreamCount > 0 && (
                        <div className="flex items-baseline gap-1.5 min-w-0">
                          <ArrowUp className="h-3 w-3 shrink-0 text-amber-600 translate-y-0.5" />
                          <span className="font-medium text-amber-600 whitespace-nowrap shrink-0">Waiting on:</span>
                          <span className="text-neutral-500 truncate min-w-0">
                            {node.dependencies.filter(t => t.status !== "done").map(t => t.title).join(", ")}
                          </span>
                        </div>
                      )}
                      {downstreamCount > 0 && (
                        <div className="flex items-baseline gap-1.5 min-w-0">
                          <ArrowDown className="h-3 w-3 shrink-0 text-blue-600 translate-y-0.5" />
                          <span className="font-medium text-blue-600 whitespace-nowrap shrink-0">Blocking:</span>
                          <span className="text-neutral-500 truncate min-w-0">
                            {node.dependents.filter(t => t.status !== "done").map(t => t.title).join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
        
        {/* Connection line to next item */}
        {index < total - 1 && !isDone && (
          <div className="absolute left-[7px] top-[calc(100%-4px)] h-1 w-px bg-neutral-200" />
        )}
      </motion.button>
    </TooltipProvider>
  )
}

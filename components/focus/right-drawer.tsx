"use client"

import { Copy, Calendar, Check, Send } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Bottleneck, buildSlackMessage, buildEscalationMessage } from "@/lib/focus-helpers"
import { getUserById, entities } from "@/lib/focus-data"
import { cn } from "@/lib/utils"

interface RightDrawerProps {
  bottleneck: Bottleneck | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const reasonTypeLabels: Record<string, string> = {
  data: "Missing data",
  approval: "Pending approval",
  dependency: "Blocked by dependency",
  exception: "Exception",
  overdue: "Overdue",
}

export function RightDrawer({ bottleneck, open, onOpenChange }: RightDrawerProps) {
  const [copiedAction, setCopiedAction] = useState<string | null>(null)
  
  if (!bottleneck) return null
  
  const { task } = bottleneck
  const owner = getUserById(task.ownerId)
  const reviewer = task.reviewerId ? getUserById(task.reviewerId) : null
  const entity = entities[task.entity]
  const reasonLabel = reasonTypeLabels[bottleneck.reasonType] || reasonTypeLabels.dependency
  
  const handleCopySlackMessage = async () => {
    const message = buildSlackMessage(bottleneck)
    await navigator.clipboard.writeText(message)
    setCopiedAction("slack")
    setTimeout(() => setCopiedAction(null), 2000)
  }
  
  const handleCopyEscalation = async () => {
    const message = buildEscalationMessage(bottleneck)
    await navigator.clipboard.writeText(message)
    setCopiedAction("escalate")
    setTimeout(() => setCopiedAction(null), 2000)
  }
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }
  
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    return formatDate(dateStr)
  }
  
  const daysUntilDue = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dueDate = new Date(task.dueDate)
    dueDate.setHours(0, 0, 0, 0)
    return Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }
  
  const days = daysUntilDue()
  const isBlocked = task.status === "blocked"
  const isOverdue = days < 0
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:max-w-[400px] p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b border-neutral-200">
          <div className="flex items-start gap-3">
            {/* Status indicator */}
            <div className="mt-1 shrink-0">
              {isBlocked ? (
                <div className="h-3 w-3 rounded-full bg-red-500" />
              ) : isOverdue ? (
                <div className="h-3 w-3 rounded-full bg-amber-500" />
              ) : (
                <div className="h-3 w-3 rounded-full bg-blue-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-base font-medium text-neutral-900 leading-snug pr-4">
                {task.title}
              </SheetTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={cn("border-0 px-2 py-0.5 text-[11px] font-medium", entity.color)}>
                  {entity.code}
                </Badge>
                <span className="text-xs text-neutral-500">{task.category}</span>
              </div>
            </div>
          </div>
        </SheetHeader>
        
        <ScrollArea className="flex-1">
          <div className="px-6 py-5 space-y-6">
            {/* Issue summary */}
            <section>
              <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-2">
                Issue
              </h3>
              <p className="text-sm text-neutral-700 leading-relaxed">
                {bottleneck.notes}
              </p>
              <p className="text-xs text-neutral-500 mt-2">
                {reasonLabel}
              </p>
            </section>
            
            {/* Impact */}
            <section>
              <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-3">
                Impact
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Time at risk</span>
                  <span className="font-medium text-neutral-900 tabular-nums">{bottleneck.timeImpact}h</span>
                </div>
                {bottleneck.downstreamCount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Blocking</span>
                    <span className="text-neutral-900">{bottleneck.downstreamCount} task{bottleneck.downstreamCount > 1 ? "s" : ""}</span>
                  </div>
                )}
                {bottleneck.isOnCriticalPath && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Critical path</span>
                    <span className="text-red-600 font-medium">Yes</span>
                  </div>
                )}
              </div>
            </section>
            
            {/* Details */}
            <section>
              <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-3">
                Details
              </h3>
              <div className="space-y-3">
                {owner && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-500">Preparer</span>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        {owner.avatar && <AvatarImage src={owner.avatar} alt={owner.name} />}
                        <AvatarFallback className={cn("text-[9px] font-medium text-white", owner.color)}>
                          {owner.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-neutral-900">{owner.name}</span>
                    </div>
                  </div>
                )}
                {reviewer && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-500">Reviewer</span>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        {reviewer.avatar && <AvatarImage src={reviewer.avatar} alt={reviewer.name} />}
                        <AvatarFallback className={cn("text-[9px] font-medium text-white", reviewer.color)}>
                          {reviewer.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-neutral-900">{reviewer.name}</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">Due date</span>
                  <span className={cn(
                    "text-sm",
                    days < 0 ? "text-red-600 font-medium" : "text-neutral-900"
                  )}>
                    {formatDate(task.dueDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">Last activity</span>
                  <span className="text-sm text-neutral-900">{formatRelativeTime(task.lastUpdated)}</span>
                </div>
              </div>
            </section>
            
            {/* Blocked tasks */}
            {bottleneck.dependentTasks.length > 0 && (
              <section>
                <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-3">
                  Blocked tasks
                </h3>
                <div className="space-y-2">
                  {bottleneck.dependentTasks.slice(0, 4).map((depTask) => {
                    const depOwner = getUserById(depTask.ownerId)
                    return (
                      <div 
                        key={depTask.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-neutral-300 shrink-0" />
                        <span className="flex-1 text-neutral-700 truncate">
                          {depTask.title}
                        </span>
                        {depOwner && (
                          <Avatar className="h-4 w-4 shrink-0">
                            {depOwner.avatar && <AvatarImage src={depOwner.avatar} alt={depOwner.name} />}
                            <AvatarFallback className={cn("text-[8px] font-medium text-white", depOwner.color)}>
                              {depOwner.initials}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    )
                  })}
                  {bottleneck.dependentTasks.length > 4 && (
                    <p className="text-xs text-neutral-500">
                      +{bottleneck.dependentTasks.length - 4} more
                    </p>
                  )}
                </div>
              </section>
            )}
          </div>
        </ScrollArea>
        
        {/* Actions Footer */}
        <div className="border-t border-neutral-200 px-6 py-4 bg-white">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopySlackMessage}
              className="flex-1 gap-2"
            >
              {copiedAction === "slack" ? (
                <Check className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copiedAction === "slack" ? "Copied" : "Copy Slack message"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyEscalation}
              className="gap-2"
            >
              {copiedAction === "escalate" ? (
                <Check className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

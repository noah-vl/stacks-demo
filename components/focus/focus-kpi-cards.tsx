"use client"

import { FocusMetrics } from "@/lib/focus-helpers"
import { cn } from "@/lib/utils"

interface FocusKPICardsProps {
  metrics: FocusMetrics
}

export function FocusKPICards({ metrics }: FocusKPICardsProps) {
  const riskConfig = {
    on_track: { label: "On track", color: "text-green-600", dotColor: "bg-green-500" },
    at_risk: { label: "At risk", color: "text-amber-600", dotColor: "bg-amber-500" },
    critical: { label: "Critical", color: "text-red-600", dotColor: "bg-red-500" },
  }
  
  const risk = riskConfig[metrics.closeRisk]
  
  // Format days remaining
  const formatDaysRemaining = (days: number) => {
    if (days < 0) return `${Math.abs(days)}d overdue`
    if (days === 0) return "Due today"
    if (days === 1) return "Due tomorrow"
    return `${days}d remaining`
  }
  
  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Close Risk */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <p className="text-xs text-neutral-500 mb-2">Close risk</p>
        <div className="flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full", risk.dotColor)} />
          <p className={cn("text-lg font-semibold", risk.color)}>
            {risk.label}
          </p>
        </div>
      </div>
      
      {/* Blocked Items */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <p className="text-xs text-neutral-500 mb-2">Blocked items</p>
        <p className="text-lg font-semibold text-neutral-900 tabular-nums">
          {metrics.blockedCount}
          <span className="text-sm font-normal text-neutral-400 ml-1">tasks</span>
        </p>
      </div>
      
      {/* Time Impact */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <p className="text-xs text-neutral-500 mb-2">Time at risk</p>
        <p className="text-lg font-semibold text-neutral-900 tabular-nums">
          {metrics.totalTimeImpact}
          <span className="text-sm font-normal text-neutral-400 ml-1">hours</span>
        </p>
      </div>
      
      {/* Next Milestone */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <p className="text-xs text-neutral-500 mb-2">Next milestone</p>
        {metrics.nextMilestone ? (
          <>
            <p className={cn(
              "text-lg font-semibold tabular-nums",
              metrics.nextMilestone.daysRemaining < 0 ? "text-red-600" : "text-neutral-900"
            )}>
              {formatDaysRemaining(metrics.nextMilestone.daysRemaining)}
            </p>
          </>
        ) : (
          <p className="text-lg font-semibold text-green-600">Complete</p>
        )}
      </div>
    </div>
  )
}

// Compact version for Focus Inbox header
export function FocusKPICompact({ metrics }: FocusKPICardsProps) {
  const riskConfig = {
    on_track: { label: "On track", color: "text-green-600", dotColor: "bg-green-500" },
    at_risk: { label: "At risk", color: "text-amber-600", dotColor: "bg-amber-500" },
    critical: { label: "Critical", color: "text-red-600", dotColor: "bg-red-500" },
  }
  
  const risk = riskConfig[metrics.closeRisk]
  
  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-2">
        <div className={cn("h-2 w-2 rounded-full", risk.dotColor)} />
        <span className={cn("font-medium", risk.color)}>{risk.label}</span>
      </div>
      <span className="text-neutral-300">·</span>
      <span className="text-neutral-600">{metrics.blockedCount} blocked</span>
      <span className="text-neutral-300">·</span>
      <span className="text-neutral-600">{metrics.totalTimeImpact}h at risk</span>
    </div>
  )
}

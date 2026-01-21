"use client"

import { motion } from "framer-motion"
import { 
  Sparkles, 
  AlertTriangle, 
  Clock, 
  TrendingUp,
  ChevronRight,
  Zap
} from "lucide-react"
import { FocusMetrics, CriticalPathNode, Bottleneck } from "@/lib/focus-helpers"
import { getUserById } from "@/lib/focus-data"
import { cn } from "@/lib/utils"

interface AIAnalysisCardProps {
  metrics: FocusMetrics
  criticalPath: CriticalPathNode[]
  bottlenecks: Bottleneck[]
}

export function AIAnalysisCard({ metrics, criticalPath, bottlenecks }: AIAnalysisCardProps) {
  // Generate dynamic AI insights based on actual data
  const generateInsights = () => {
    const insights: { type: "warning" | "info" | "success"; message: string }[] = []
    
    // Critical path analysis
    const blockedOnCritical = criticalPath.filter(n => n.isBlocked).length
    const overdueOnCritical = criticalPath.filter(n => n.isOverdue && !n.isBlocked).length
    
    if (blockedOnCritical > 0) {
      const blockedTask = criticalPath.find(n => n.isBlocked)?.task
      const owner = blockedTask ? getUserById(blockedTask.ownerId) : null
      insights.push({
        type: "warning",
        message: `${blockedOnCritical} critical path task${blockedOnCritical > 1 ? 's are' : ' is'} blocked${owner ? ` - ${owner.name.split(' ')[0]} needs support on "${blockedTask?.title.slice(0, 40)}..."` : ''}`
      })
    }
    
    if (overdueOnCritical > 0) {
      insights.push({
        type: "warning", 
        message: `${overdueOnCritical} critical task${overdueOnCritical > 1 ? 's have' : ' has'} passed the due date`
      })
    }
    
    // Bottleneck cascade analysis
    const highImpactBottlenecks = bottlenecks.filter(b => b.downstreamCount >= 2)
    if (highImpactBottlenecks.length > 0) {
      const totalBlocked = highImpactBottlenecks.reduce((sum, b) => sum + b.downstreamCount, 0)
      insights.push({
        type: "info",
        message: `Resolving ${highImpactBottlenecks.length} key blocker${highImpactBottlenecks.length > 1 ? 's' : ''} would unblock ${totalBlocked} downstream tasks`
      })
    }
    
    // Progress insight
    const completedTasks = criticalPath.filter(n => n.task.status === "done").length
    const totalTasks = criticalPath.length
    if (completedTasks > 0 && totalTasks > 0) {
      const progressPercent = Math.round((completedTasks / totalTasks) * 100)
      if (progressPercent >= 50) {
        insights.push({
          type: "success",
          message: `Good progress: ${progressPercent}% of critical path complete`
        })
      }
    }
    
    // Time estimation
    if (metrics.criticalPathLength > 0 && metrics.closeRisk !== "on_track") {
      const remainingHours = metrics.criticalPathLength
      const workdaysNeeded = Math.ceil(remainingHours / 8)
      insights.push({
        type: "info",
        message: `Estimated ${workdaysNeeded} workday${workdaysNeeded > 1 ? 's' : ''} of effort remaining on critical path (${remainingHours}h)`
      })
    }
    
    return insights.slice(0, 3) // Max 3 insights
  }
  
  const insights = generateInsights()
  
  // Summary text based on risk level
  const getSummary = () => {
    switch (metrics.closeRisk) {
      case "critical":
        return `This close is at risk. There ${metrics.blockedCount === 1 ? 'is' : 'are'} ${metrics.blockedCount} blocked task${metrics.blockedCount !== 1 ? 's' : ''} impacting ${metrics.totalTimeImpact}h of work. Immediate attention needed on the critical path.`
      case "at_risk":
        return `The close has some blockers to address. ${metrics.blockedCount} task${metrics.blockedCount !== 1 ? 's' : ''} need${metrics.blockedCount === 1 ? 's' : ''} attention with ${metrics.totalTimeImpact}h at risk. Focus on the items below to stay on track.`
      default:
        return "The close is progressing well. No critical blockers detected. Continue monitoring the critical path items below."
    }
  }
  
  const riskColors = {
    on_track: "from-emerald-500/10 to-emerald-500/5 border-emerald-200",
    at_risk: "from-amber-500/10 to-amber-500/5 border-amber-200",
    critical: "from-red-500/10 to-red-500/5 border-red-200"
  }
  
  const riskIconColors = {
    on_track: "text-emerald-600",
    at_risk: "text-amber-600",
    critical: "text-red-600"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative rounded-xl border bg-gradient-to-br p-5 overflow-hidden",
        riskColors[metrics.closeRisk]
      )}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/40 to-transparent rounded-bl-full" />
      
      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-lg bg-white/60 backdrop-blur-sm",
            riskIconColors[metrics.closeRisk]
          )}>
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-neutral-900 mb-1">Close Analysis</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              {getSummary()}
            </p>
          </div>
        </div>
        
        {/* Insights */}
        {insights.length > 0 && (
          <div className="space-y-2 pt-2">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.1 + index * 0.05 }}
                className="flex items-start gap-2.5"
              >
                <div className="mt-0.5">
                  {insight.type === "warning" ? (
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                  ) : insight.type === "success" ? (
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Zap className="h-3.5 w-3.5 text-blue-600" />
                  )}
                </div>
                <span className="text-xs text-neutral-700 leading-relaxed">
                  {insight.message}
                </span>
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Quick stats */}
        <div className="flex items-center gap-4 pt-2 border-t border-neutral-200/50">
          <div className="flex items-center gap-1.5 text-xs text-neutral-600">
            <Clock className="h-3.5 w-3.5 text-neutral-400" />
            <span className="tabular-nums font-medium">{metrics.totalTimeImpact}h</span>
            <span className="text-neutral-500">at risk</span>
          </div>
          <div className="w-px h-3 bg-neutral-300" />
          <div className="flex items-center gap-1.5 text-xs text-neutral-600">
            <AlertTriangle className="h-3.5 w-3.5 text-neutral-400" />
            <span className="tabular-nums font-medium">{metrics.blockedCount}</span>
            <span className="text-neutral-500">blocked</span>
          </div>
          {metrics.nextMilestone && (
            <>
              <div className="w-px h-3 bg-neutral-300" />
              <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                <span className={cn(
                  "tabular-nums font-medium",
                  metrics.nextMilestone.daysRemaining < 0 ? "text-red-600" : ""
                )}>
                  {metrics.nextMilestone.daysRemaining < 0 
                    ? `${Math.abs(metrics.nextMilestone.daysRemaining)}d overdue`
                    : `${metrics.nextMilestone.daysRemaining}d to deadline`
                  }
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}

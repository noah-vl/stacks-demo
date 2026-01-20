// Helper functions for My Focus + Critical Path view

import {
  Task,
  Dependency,
  BottleneckEvent,
  tasks,
  dependencies,
  bottleneckEvents,
  getUserById,
  getTaskById,
} from "./focus-data"

export interface Bottleneck {
  task: Task
  timeImpact: number // in hours
  impactScore: number // weighted score for ranking
  downstreamCount: number
  reasonType: string
  notes: string
  isOnCriticalPath: boolean
  dependentTasks: Task[]
  ageInDays: number
}

export interface CriticalPathNode {
  task: Task
  position: number
  isBlocked: boolean
  isOverdue: boolean
  slackDays: number
  dependencies: Task[]
  dependents: Task[]
}

export interface FocusMetrics {
  closeRisk: "on_track" | "at_risk" | "critical"
  blockedCount: number
  totalTimeImpact: number
  nextMilestone: { title: string; dueDate: string; daysRemaining: number } | null
  criticalPathLength: number
}

// Calculate days between two dates
function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  return Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
}

// Check if a task is overdue
function isOverdue(task: Task): boolean {
  if (task.status === "done") return false
  const today = new Date()
  const dueDate = new Date(task.dueDate)
  return dueDate < today
}

// Get days until due (negative if overdue)
function daysUntilDue(task: Task): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDate = new Date(task.dueDate)
  dueDate.setHours(0, 0, 0, 0)
  return Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

// Build adjacency list for dependency graph
function buildDependencyGraph(): Map<string, string[]> {
  const graph = new Map<string, string[]>()
  
  // Initialize all tasks
  tasks.forEach((task) => {
    graph.set(task.id, [])
  })
  
  // Add edges (from -> to means 'to' depends on 'from')
  dependencies.forEach((dep) => {
    const dependents = graph.get(dep.fromTaskId) || []
    dependents.push(dep.toTaskId)
    graph.set(dep.fromTaskId, dependents)
  })
  
  return graph
}

// Get all tasks that depend on a given task (downstream)
function getDownstreamTasks(taskId: string, graph: Map<string, string[]>): Set<string> {
  const visited = new Set<string>()
  const queue = [taskId]
  
  while (queue.length > 0) {
    const current = queue.shift()!
    const dependents = graph.get(current) || []
    
    for (const dep of dependents) {
      if (!visited.has(dep)) {
        visited.add(dep)
        queue.push(dep)
      }
    }
  }
  
  return visited
}

// Get tasks that a given task depends on (upstream/blockers)
function getUpstreamTasks(taskId: string): Task[] {
  return dependencies
    .filter((dep) => dep.toTaskId === taskId)
    .map((dep) => getTaskById(dep.fromTaskId))
    .filter((t): t is Task => t !== undefined)
}

// Compute the critical path using longest path algorithm
export function computeCriticalPath(
  taskList: Task[] = tasks,
  deps: Dependency[] = dependencies
): CriticalPathNode[] {
  // Filter to incomplete tasks only
  const incompleteTasks = taskList.filter((t) => t.status !== "done")
  const taskMap = new Map(incompleteTasks.map((t) => [t.id, t]))
  
  // Build adjacency list and in-degree count
  const adjList = new Map<string, string[]>()
  const inDegree = new Map<string, number>()
  const reverseAdj = new Map<string, string[]>() // For getting dependencies
  
  incompleteTasks.forEach((task) => {
    adjList.set(task.id, [])
    reverseAdj.set(task.id, [])
    inDegree.set(task.id, 0)
  })
  
  // Add edges for incomplete tasks only
  deps.forEach((dep) => {
    if (taskMap.has(dep.fromTaskId) && taskMap.has(dep.toTaskId)) {
      adjList.get(dep.fromTaskId)!.push(dep.toTaskId)
      reverseAdj.get(dep.toTaskId)!.push(dep.fromTaskId)
      inDegree.set(dep.toTaskId, (inDegree.get(dep.toTaskId) || 0) + 1)
    }
  })
  
  // Topological sort with longest path calculation
  const dist = new Map<string, number>()
  const parent = new Map<string, string | null>()
  
  incompleteTasks.forEach((task) => {
    dist.set(task.id, task.estimatedHours)
    parent.set(task.id, null)
  })
  
  // Find nodes with no dependencies (start nodes)
  const queue: string[] = []
  inDegree.forEach((degree, taskId) => {
    if (degree === 0) queue.push(taskId)
  })
  
  // Process in topological order
  while (queue.length > 0) {
    const current = queue.shift()!
    const currentTask = taskMap.get(current)!
    const currentDist = dist.get(current)!
    
    const neighbors = adjList.get(current) || []
    for (const neighbor of neighbors) {
      const neighborTask = taskMap.get(neighbor)!
      const newDist = currentDist + neighborTask.estimatedHours
      
      if (newDist > dist.get(neighbor)!) {
        dist.set(neighbor, newDist)
        parent.set(neighbor, current)
      }
      
      inDegree.set(neighbor, inDegree.get(neighbor)! - 1)
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor)
      }
    }
  }
  
  // Find the end of critical path (task with maximum distance)
  let maxDist = 0
  let endTaskId: string | null = null
  
  dist.forEach((d, taskId) => {
    if (d > maxDist) {
      maxDist = d
      endTaskId = taskId
    }
  })
  
  if (!endTaskId) return []
  
  // Trace back the critical path
  const criticalPathIds: string[] = []
  let current: string | null = endTaskId
  
  while (current !== null) {
    criticalPathIds.unshift(current)
    current = parent.get(current) || null
  }
  
  // Build CriticalPathNode array
  return criticalPathIds.map((taskId, index) => {
    const task = taskMap.get(taskId)!
    const depTasks = (reverseAdj.get(taskId) || [])
      .map((id) => taskMap.get(id))
      .filter((t): t is Task => t !== undefined)
    
    const dependentTasks = (adjList.get(taskId) || [])
      .map((id) => taskMap.get(id))
      .filter((t): t is Task => t !== undefined)
    
    return {
      task,
      position: index + 1,
      isBlocked: task.status === "blocked",
      isOverdue: isOverdue(task),
      slackDays: daysUntilDue(task),
      dependencies: depTasks,
      dependents: dependentTasks,
    }
  })
}

// Compute bottlenecks ranked by time impact
export function computeBottlenecks(
  taskList: Task[] = tasks,
  deps: Dependency[] = dependencies,
  events: BottleneckEvent[] = bottleneckEvents
): Bottleneck[] {
  const graph = buildDependencyGraph()
  const criticalPath = computeCriticalPath(taskList, deps)
  const criticalPathIds = new Set(criticalPath.map((n) => n.task.id))
  
  // Find blocked or overdue tasks
  const blockedTasks = taskList.filter(
    (t) => t.status === "blocked" || (t.status !== "done" && isOverdue(t))
  )
  
  const bottlenecks: Bottleneck[] = blockedTasks.map((task) => {
    const downstream = getDownstreamTasks(task.id, graph)
    const downstreamTasks = Array.from(downstream)
      .map((id) => getTaskById(id))
      .filter((t): t is Task => t !== undefined && t.status !== "done")
    
    // Calculate downstream time impact
    const downstreamHours = downstreamTasks.reduce(
      (sum, t) => sum + t.estimatedHours,
      0
    )
    
    // Base time impact is task's hours + downstream hours
    let timeImpact = task.estimatedHours + downstreamHours
    
    // Find bottleneck event for additional context
    const event = events.find((e) => e.taskId === task.id)
    
    // Calculate impact score with multipliers
    let impactScore = timeImpact
    
    // Multiplier: on critical path = 2x
    if (criticalPathIds.has(task.id)) {
      impactScore *= 2
    }
    
    // Multiplier: overdue = 1.5x
    if (isOverdue(task)) {
      impactScore *= 1.5
    }
    
    // Multiplier: blocked status = 1.3x
    if (task.status === "blocked") {
      impactScore *= 1.3
    }
    
    // Calculate age
    const lastUpdated = new Date(task.lastUpdated)
    const today = new Date()
    const ageInDays = Math.floor(
      (today.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
    )
    
    return {
      task,
      timeImpact,
      impactScore,
      downstreamCount: downstreamTasks.length,
      reasonType: event?.reasonType || (task.status === "blocked" ? "dependency" : "overdue"),
      notes: event?.notes || task.blockedReason || "Task is overdue",
      isOnCriticalPath: criticalPathIds.has(task.id),
      dependentTasks: downstreamTasks,
      ageInDays,
    }
  })
  
  // Sort by impact score (descending)
  return bottlenecks.sort((a, b) => b.impactScore - a.impactScore)
}

// Calculate focus metrics
export function computeFocusMetrics(
  taskList: Task[] = tasks,
  deps: Dependency[] = dependencies
): FocusMetrics {
  const bottlenecks = computeBottlenecks(taskList, deps)
  const criticalPath = computeCriticalPath(taskList, deps)
  
  // Count blocked items
  const blockedCount = taskList.filter((t) => t.status === "blocked").length
  
  // Total time impact from bottlenecks
  const totalTimeImpact = bottlenecks.reduce((sum, b) => sum + b.timeImpact, 0)
  
  // Determine close risk
  let closeRisk: FocusMetrics["closeRisk"] = "on_track"
  
  // Critical if: any critical path task is blocked or overdue
  const criticalPathBlockedOrOverdue = criticalPath.some(
    (n) => n.isBlocked || n.isOverdue
  )
  
  if (criticalPathBlockedOrOverdue) {
    closeRisk = "critical"
  } else if (blockedCount > 0 || totalTimeImpact > 16) {
    closeRisk = "at_risk"
  }
  
  // Find next milestone (end of critical path or nearest due date)
  let nextMilestone: FocusMetrics["nextMilestone"] = null
  
  if (criticalPath.length > 0) {
    const lastTask = criticalPath[criticalPath.length - 1].task
    nextMilestone = {
      title: lastTask.title,
      dueDate: lastTask.dueDate,
      daysRemaining: daysUntilDue(lastTask),
    }
  }
  
  return {
    closeRisk,
    blockedCount,
    totalTimeImpact,
    nextMilestone,
    criticalPathLength: criticalPath.reduce((sum, n) => sum + n.task.estimatedHours, 0),
  }
}

// Build a Slack message for a bottleneck
export function buildSlackMessage(bottleneck: Bottleneck): string {
  const task = bottleneck.task
  const owner = getUserById(task.ownerId)
  const daysUntil = daysUntilDue(task)
  const dueStatus = daysUntil < 0 
    ? `${Math.abs(daysUntil)} days overdue` 
    : daysUntil === 0 
    ? "due today" 
    : `due in ${daysUntil} days`
  
  let message = `Hey ${owner?.name.split(" ")[0] || "there"} - quick heads up on "${task.title}"\n\n`
  
  // Add context
  message += `Status: ${task.status === "blocked" ? "Blocked" : "Needs attention"} (${dueStatus})\n`
  message += `Category: ${task.category} | Entity: ${task.entity}\n\n`
  
  // Add reason
  if (bottleneck.notes) {
    message += `Issue: ${bottleneck.notes}\n\n`
  }
  
  // Add impact
  if (bottleneck.downstreamCount > 0) {
    message += `Impact: This is blocking ${bottleneck.downstreamCount} other task${bottleneck.downstreamCount > 1 ? "s" : ""} (~${bottleneck.timeImpact}h of work at risk)\n`
  }
  
  if (bottleneck.isOnCriticalPath) {
    message += `This task is on the critical path for the close.\n\n`
  } else {
    message += "\n"
  }
  
  // Add suggested action based on reason type
  switch (bottleneck.reasonType) {
    case "data":
      message += "Suggested next step: Can you check if the data is available now, or escalate to the source team?"
      break
    case "approval":
      message += "Suggested next step: Can you follow up on the pending approval?"
      break
    case "dependency":
      message += "Suggested next step: Let me know if there's anything blocking you from completing the prerequisite task."
      break
    case "exception":
      message += "Suggested next step: Can you document the exception and propose a resolution?"
      break
    default:
      message += "Suggested next step: Let me know if you need any support to get this unblocked."
  }
  
  message += "\n\nThanks!"
  
  return message
}

// Build an escalation message for management
export function buildEscalationMessage(bottleneck: Bottleneck): string {
  const task = bottleneck.task
  const owner = getUserById(task.ownerId)
  const daysUntil = daysUntilDue(task)
  
  let message = `Escalation: Close Risk - "${task.title}"\n\n`
  message += `Owner: ${owner?.name || "Unassigned"}\n`
  message += `Status: ${task.status.toUpperCase()} | Due: ${new Date(task.dueDate).toLocaleDateString()}\n`
  message += `Time at risk: ${bottleneck.timeImpact} hours\n\n`
  
  message += `Issue summary:\n${bottleneck.notes}\n\n`
  
  if (bottleneck.isOnCriticalPath) {
    message += `This is on the CRITICAL PATH and may delay the close deadline.\n\n`
  }
  
  message += "Requesting prioritization and support to resolve."
  
  return message
}

// Filter bottlenecks by criteria
export function filterBottlenecks(
  bottlenecks: Bottleneck[],
  filters: {
    ownerId?: string
    category?: string
    entity?: string
  }
): Bottleneck[] {
  return bottlenecks.filter((b) => {
    if (filters.ownerId && b.task.ownerId !== filters.ownerId) return false
    if (filters.category && b.task.category !== filters.category) return false
    if (filters.entity && b.task.entity !== filters.entity) return false
    return true
  })
}

// Filter critical path by criteria
export function filterCriticalPath(
  path: CriticalPathNode[],
  filters: {
    ownerId?: string
    category?: string
    entity?: string
  }
): CriticalPathNode[] {
  if (!filters.ownerId && !filters.category && !filters.entity) {
    return path
  }
  
  return path.filter((n) => {
    if (filters.ownerId && n.task.ownerId !== filters.ownerId) return false
    if (filters.category && n.task.category !== filters.category) return false
    if (filters.entity && n.task.entity !== filters.entity) return false
    return true
  })
}

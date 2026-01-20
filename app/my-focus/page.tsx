"use client"

import { useState, useMemo } from "react"
import { 
  User, 
  Building2, 
  Tag, 
  ChevronDown,
  X
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sidebar } from "@/components/sidebar"
import { Navbar } from "@/components/navbar"
import { FocusKPICards } from "@/components/focus/focus-kpi-cards"
import { BottleneckList } from "@/components/focus/bottleneck-list"
import { CriticalPathView } from "@/components/focus/critical-path-view"
import { RightDrawer } from "@/components/focus/right-drawer"
import { 
  computeBottlenecks, 
  computeCriticalPath, 
  computeFocusMetrics,
  filterBottlenecks,
  filterCriticalPath,
  Bottleneck,
  CriticalPathNode
} from "@/lib/focus-helpers"
import { users, categories, entities, tasks as allTasks, dependencies } from "@/lib/focus-data"
import { cn } from "@/lib/utils"

// This would typically come from your app state/context
const currentMonth = "January 2026"

export default function MyFocusPage() {
  // Filters
  const [ownerFilter, setOwnerFilter] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [entityFilter, setEntityFilter] = useState<string | null>(null)
  
  // Drawer state
  const [selectedBottleneck, setSelectedBottleneck] = useState<Bottleneck | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  
  // Compute data
  const bottlenecks = useMemo(() => computeBottlenecks(allTasks, dependencies), [])
  const criticalPath = useMemo(() => computeCriticalPath(allTasks, dependencies), [])
  const metrics = useMemo(() => computeFocusMetrics(allTasks, dependencies), [])
  
  // Apply filters
  const filteredBottlenecks = useMemo(() => {
    return filterBottlenecks(bottlenecks, {
      ownerId: ownerFilter || undefined,
      category: categoryFilter || undefined,
      entity: entityFilter || undefined,
    })
  }, [bottlenecks, ownerFilter, categoryFilter, entityFilter])
  
  const filteredCriticalPath = useMemo(() => {
    return filterCriticalPath(criticalPath, {
      ownerId: ownerFilter || undefined,
      category: categoryFilter || undefined,
      entity: entityFilter || undefined,
    })
  }, [criticalPath, ownerFilter, categoryFilter, entityFilter])
  
  // Handle bottleneck selection
  const handleSelectBottleneck = (bottleneck: Bottleneck) => {
    setSelectedBottleneck(bottleneck)
    setDrawerOpen(true)
  }
  
  // Handle critical path node selection
  const handleSelectNode = (node: CriticalPathNode) => {
    // Find the corresponding bottleneck if it exists
    const matchingBottleneck = bottlenecks.find((b) => b.task.id === node.task.id)
    if (matchingBottleneck) {
      setSelectedBottleneck(matchingBottleneck)
      setDrawerOpen(true)
    } else if (node.isBlocked || node.isOverdue) {
      // Create a synthetic bottleneck for the node
      const syntheticBottleneck: Bottleneck = {
        task: node.task,
        timeImpact: node.task.estimatedHours,
        impactScore: node.task.estimatedHours,
        downstreamCount: node.dependents.length,
        reasonType: node.isBlocked ? "dependency" : "overdue",
        notes: node.task.blockedReason || "Task needs attention",
        isOnCriticalPath: true,
        dependentTasks: node.dependents,
        ageInDays: 0,
      }
      setSelectedBottleneck(syntheticBottleneck)
      setDrawerOpen(true)
    }
  }
  
  // Clear all filters
  const clearFilters = () => {
    setOwnerFilter(null)
    setCategoryFilter(null)
    setEntityFilter(null)
  }
  
  const hasActiveFilters = ownerFilter || categoryFilter || entityFilter
  
  // Get unique entities from tasks
  const uniqueEntities = Array.from(new Set(allTasks.map((t) => t.entity)))
  
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar activePage="my-focus" />
      <div className="flex flex-1 flex-col overflow-hidden border-l border-neutral-200">
        {/* Top Navbar */}
        <Navbar
          breadcrumbs={[
            { label: "Month-end Close" },
            { label: currentMonth, hasDropdown: true },
          ]}
          showFocusInbox
        />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-5xl px-6 py-6 lg:px-8">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">My Focus</h1>
              <p className="text-sm text-neutral-500 mt-1">Bottlenecks and critical path for this close</p>
            </div>
            
            {/* KPI Cards */}
            <div className="mb-8">
              <FocusKPICards metrics={metrics} />
            </div>
            
            {/* Filters */}
            <div className="flex items-center gap-2 mb-6">
              {/* Owner Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "gap-2 border-neutral-200 bg-white shadow-none font-normal",
                      ownerFilter ? "border-neutral-400 bg-neutral-50" : "text-neutral-600 hover:bg-neutral-50"
                    )}
                  >
                    <User className="h-3.5 w-3.5 text-neutral-400" />
                    {ownerFilter ? users.find((u) => u.id === ownerFilter)?.name : "Assignee"}
                    <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem onClick={() => setOwnerFilter(null)}>
                    All assignees
                  </DropdownMenuItem>
                  {users.map((user) => (
                    <DropdownMenuItem
                      key={user.id}
                      onClick={() => setOwnerFilter(user.id)}
                      className={ownerFilter === user.id ? "bg-neutral-100" : ""}
                    >
                      {user.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Category Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "gap-2 border-neutral-200 bg-white shadow-none font-normal",
                      categoryFilter ? "border-neutral-400 bg-neutral-50" : "text-neutral-600 hover:bg-neutral-50"
                    )}
                  >
                    <Tag className="h-3.5 w-3.5 text-neutral-400" />
                    {categoryFilter || "Category"}
                    <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-52">
                  <DropdownMenuItem onClick={() => setCategoryFilter(null)}>
                    All categories
                  </DropdownMenuItem>
                  {categories.map((cat) => (
                    <DropdownMenuItem
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={categoryFilter === cat ? "bg-neutral-100" : ""}
                    >
                      {cat}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Entity Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "gap-2 border-neutral-200 bg-white shadow-none font-normal",
                      entityFilter ? "border-neutral-400 bg-neutral-50" : "text-neutral-600 hover:bg-neutral-50"
                    )}
                  >
                    <Building2 className="h-3.5 w-3.5 text-neutral-400" />
                    {entityFilter || "Entity"}
                    <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem onClick={() => setEntityFilter(null)}>
                    All entities
                  </DropdownMenuItem>
                  {uniqueEntities.map((entityCode) => (
                    <DropdownMenuItem
                      key={entityCode}
                      onClick={() => setEntityFilter(entityCode)}
                      className={entityFilter === entityCode ? "bg-neutral-100" : ""}
                    >
                      <Badge className={cn("mr-2 border-0 px-1.5 py-0 text-[10px]", entities[entityCode]?.color)}>
                        {entityCode}
                      </Badge>
                      {entities[entityCode]?.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Clear filters */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="gap-1.5 text-neutral-500 hover:text-neutral-700"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </Button>
              )}
            </div>
            
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Left Column - Bottlenecks */}
              <div className="lg:col-span-3 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-medium text-neutral-900">Bottlenecks</h2>
                  <span className="text-xs text-neutral-400">
                    By time impact
                  </span>
                </div>
                <BottleneckList 
                  bottlenecks={filteredBottlenecks}
                  onSelectBottleneck={handleSelectBottleneck}
                />
              </div>
              
              {/* Right Column - Critical Path */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-base font-medium text-neutral-900">Critical Path</h2>
                <div className="rounded-xl border border-neutral-200 bg-white p-5">
                  <CriticalPathView 
                    criticalPath={filteredCriticalPath}
                    onSelectNode={handleSelectNode}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Right Drawer */}
      <RightDrawer
        bottleneck={selectedBottleneck}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  )
}

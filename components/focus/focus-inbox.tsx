"use client"

import { useState, useMemo } from "react"
import { Bell, ArrowRight } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { BottleneckListCompact } from "@/components/focus/bottleneck-list"
import { FocusKPICompact } from "@/components/focus/focus-kpi-cards"
import { RightDrawer } from "@/components/focus/right-drawer"
import { 
  computeBottlenecks, 
  computeFocusMetrics,
  Bottleneck
} from "@/lib/focus-helpers"
import { tasks, dependencies, bottleneckEvents } from "@/lib/focus-data"

export function FocusInbox() {
  const [open, setOpen] = useState(false)
  const [selectedBottleneck, setSelectedBottleneck] = useState<Bottleneck | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  
  // Compute bottlenecks and metrics
  const bottlenecks = useMemo(() => 
    computeBottlenecks(tasks, dependencies, bottleneckEvents), 
  [])
  
  const metrics = useMemo(() => 
    computeFocusMetrics(tasks, dependencies), 
  [])
  
  const handleSelectBottleneck = (bottleneck: Bottleneck) => {
    setSelectedBottleneck(bottleneck)
    setDrawerOpen(true)
  }
  
  const hasIssues = bottlenecks.length > 0
  
  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="relative h-8 w-8 p-0 hover:bg-neutral-100"
          >
            <Bell className="h-4 w-4 text-neutral-500" />
            {hasIssues && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                {bottlenecks.length}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[360px] sm:max-w-[360px] p-0 flex flex-col">
          <SheetHeader className="px-5 py-4 border-b border-neutral-100">
            <SheetTitle className="text-base font-medium text-neutral-900">
              Focus Inbox
            </SheetTitle>
            <div className="mt-2">
              <FocusKPICompact metrics={metrics} />
            </div>
          </SheetHeader>
          
          <ScrollArea className="flex-1">
            <div className="py-2">
              <BottleneckListCompact
                bottlenecks={bottlenecks}
                onSelectBottleneck={handleSelectBottleneck}
                maxItems={8}
              />
            </div>
          </ScrollArea>
          
          {/* Footer */}
          <div className="border-t border-neutral-100 px-5 py-3">
            <Link href="/my-focus" onClick={() => setOpen(false)}>
              <Button 
                variant="ghost" 
                size="sm"
                className="w-full justify-between text-neutral-600 hover:text-neutral-900"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Detail drawer */}
      <RightDrawer
        bottleneck={selectedBottleneck}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </>
  )
}

"use client"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  CalendarRange,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  FileText,
  Grid3X3,
  Inbox,
  Scale,
  Settings,
  Target,
} from "lucide-react"

interface NavItemProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  href?: string
}

function NavItem({ icon, label, active, href = "#" }: NavItemProps) {
  return (
    <a
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        active
          ? "bg-neutral-100 text-neutral-900 font-medium"
          : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
      )}
    >
      <span className="text-neutral-500">{icon}</span>
      {label}
    </a>
  )
}

interface SidebarProps {
  activePage?: "overview" | "checklist" | "reconciliations" | "flux" | "my-focus"
}

export function Sidebar({ activePage = "overview" }: SidebarProps) {
  return (
    <aside className="flex h-screen w-[280px] flex-col border-r border-neutral-200 bg-white">
      {/* Company Selector */}
      <div className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-between px-3 py-2 h-auto hover:bg-neutral-50"
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-linear-to-br from-amber-600 to-amber-800" />
            <span className="text-sm font-medium text-neutral-900">Stacks Worldwide</span>
          </div>
          <ChevronDown className="h-4 w-4 text-neutral-400" />
        </Button>
      </div>

      {/* Close Management Section */}
      <div className="flex-1 overflow-auto px-3">
        <p className="px-3 py-2 text-xs font-medium text-neutral-400">Close management</p>
        
        {/* Month Selector */}
        <Button
          variant="outline"
          className="mb-3 w-full justify-between border-neutral-200 bg-white px-3 py-2 text-sm font-normal text-neutral-700 shadow-none hover:bg-neutral-50"
        >
          June 2025
          <ChevronDown className="h-4 w-4 text-neutral-400" />
        </Button>

        {/* Navigation Items */}
        <nav className="space-y-0.5">
          <NavItem
            icon={<CalendarRange className="h-4 w-4" />}
            label="Close overview"
            href="/"
            active={activePage === "overview"}
          />
          <NavItem
            icon={<Target className="h-4 w-4" />}
            label="My Focus"
            href="/my-focus"
            active={activePage === "my-focus"}
          />
          <NavItem
            icon={<CheckSquare className="h-4 w-4" />}
            label="Checklist"
            href="/checklist"
            active={activePage === "checklist"}
          />
          <NavItem
            icon={<Scale className="h-4 w-4" />}
            label="Account Reconciliations"
            href="/reconciliations"
            active={activePage === "reconciliations"}
          />
          <NavItem
            icon={<FileText className="h-4 w-4" />}
            label="Flux Analysis"
            href="/flux"
            active={activePage === "flux"}
          />
        </nav>

        {/* Tools Section */}
        <p className="mt-6 px-3 py-2 text-xs font-medium text-neutral-400">Tools</p>
        
        <nav className="space-y-0.5">
          <NavItem
            icon={<Inbox className="h-4 w-4" />}
            label="Accounts Receivable"
          />
          <NavItem
            icon={<Grid3X3 className="h-4 w-4" />}
            label="Transaction Matching"
          />
        </nav>

        {/* Settings */}
        <div className="mt-4">
          <Button
            variant="ghost"
            className="w-full justify-between px-3 py-2 text-sm font-normal text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
          >
            <div className="flex items-center gap-3">
              <Settings className="h-4 w-4 text-neutral-500" />
              Settings
            </div>
            <ChevronRight className="h-4 w-4 text-neutral-400" />
          </Button>
        </div>
      </div>

      {/* User Profile */}
      <div className="mt-auto border-t border-neutral-200 p-3">
        <Button
          variant="ghost"
          className="w-full justify-between px-3 py-2 h-auto hover:bg-neutral-50"
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-neutral-100 text-neutral-600 text-[11px] font-medium">
                NV
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium text-neutral-900">Noah van Lienden</span>
              <span className="text-xs text-neutral-500">noah@stacks.ai</span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-neutral-400" />
        </Button>
      </div>
    </aside>
  )
}

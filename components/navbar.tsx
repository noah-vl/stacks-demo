"use client"

import { ChevronDown, Lock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FocusInbox } from "@/components/focus/focus-inbox"

interface BreadcrumbItem {
  label: string
  href?: string
  hasDropdown?: boolean
}

interface NavbarProps {
  breadcrumbs: BreadcrumbItem[]
  title?: string
  status?: {
    label: string
    variant: "open" | "closed" | "in-progress"
  }
  action?: {
    label: string
    icon?: React.ReactNode
    onClick?: () => void
  }
  showFocusInbox?: boolean
}

const statusStyles = {
  open: "bg-cyan-100 text-cyan-700 hover:bg-cyan-100",
  closed: "bg-neutral-100 text-neutral-600 hover:bg-neutral-100",
  "in-progress": "bg-amber-100 text-amber-700 hover:bg-amber-100",
}

export function Navbar({ breadcrumbs, title, status, action, showFocusInbox = true }: NavbarProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-6">
      <div className="flex items-center gap-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1 text-sm text-neutral-500">
          {breadcrumbs.map((item, index) => (
            <span key={index} className="flex items-center gap-1">
              {index > 0 && <span className="mx-1">/</span>}
              {item.href ? (
                <a href={item.href} className="hover:text-neutral-700">
                  {item.label}
                </a>
              ) : (
                <span className="flex items-center gap-1">
                  {item.label}
                  {item.hasDropdown && (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </span>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-3">
        {/* Focus Inbox Bell */}
        {showFocusInbox && <FocusInbox />}
        
        {/* Action Button */}
        {action && (
          <Button
            variant="outline"
            size="sm"
            onClick={action.onClick}
            className="gap-2 border-neutral-200 bg-white text-neutral-600 shadow-none hover:bg-neutral-50"
          >
            {action.icon}
            {action.label}
          </Button>
        )}
      </div>
    </header>
  )
}

interface PageHeaderProps {
  title: string
  status?: {
    label: string
    variant: "open" | "closed" | "in-progress"
  }
}

export function PageHeader({ title, status }: PageHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
        {title}
      </h1>
      {status && (
        <Badge
          className={`${statusStyles[status.variant]} border-0 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide`}
        >
          {status.label}
        </Badge>
      )}
    </div>
  )
}

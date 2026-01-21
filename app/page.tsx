"use client"

import { useState } from "react"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Lock, Tag } from "lucide-react"
import { motion } from "framer-motion"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sidebar } from "@/components/sidebar"
import { Navbar, PageHeader } from "@/components/navbar"

// Chart data for each category
const chartDataByCategory: Record<string, { date: string; value: number }[]> = {
  "All tasks": [
    { date: "Jan 1", value: 10 },
    { date: "Jan 5", value: 25 },
    { date: "Jan 8", value: 35 },
    { date: "Jan 10", value: 45 },
    { date: "Jan 12", value: 55 },
    { date: "Jan 15", value: 70 },
    { date: "Jan 17", value: 82 },
    { date: "Jan 19", value: 88 },
    { date: "Jan 20", value: 90 },
  ],
  "Journal entries": [
    { date: "Jan 1", value: 5 },
    { date: "Jan 5", value: 12 },
    { date: "Jan 8", value: 20 },
    { date: "Jan 10", value: 28 },
    { date: "Jan 12", value: 35 },
    { date: "Jan 15", value: 40 },
    { date: "Jan 17", value: 44 },
    { date: "Jan 19", value: 45 },
    { date: "Jan 20", value: 46 },
  ],
  "Account reconciliations": [
    { date: "Jan 1", value: 3 },
    { date: "Jan 5", value: 8 },
    { date: "Jan 8", value: 12 },
    { date: "Jan 10", value: 15 },
    { date: "Jan 12", value: 18 },
    { date: "Jan 15", value: 24 },
    { date: "Jan 17", value: 30 },
    { date: "Jan 19", value: 33 },
    { date: "Jan 20", value: 35 },
  ],
  "Flux analysis reports": [
    { date: "Jan 1", value: 0 },
    { date: "Jan 5", value: 0 },
    { date: "Jan 8", value: 0 },
    { date: "Jan 10", value: 0 },
    { date: "Jan 12", value: 0 },
    { date: "Jan 15", value: 1 },
    { date: "Jan 17", value: 1 },
    { date: "Jan 19", value: 1 },
    { date: "Jan 20", value: 1 },
  ],
  "Other": [
    { date: "Jan 1", value: 2 },
    { date: "Jan 5", value: 5 },
    { date: "Jan 8", value: 3 },
    { date: "Jan 10", value: 2 },
    { date: "Jan 12", value: 2 },
    { date: "Jan 15", value: 5 },
    { date: "Jan 17", value: 7 },
    { date: "Jan 19", value: 9 },
    { date: "Jan 20", value: 8 },
  ],
}

// Chart color - always dark purple
const chartColors = { 
  stroke: "#342D87", 
  fill: "url(#colorPurple)"
}

// Status summary by category - using consistent hex colors
const statusSummaryByCategory: Record<string, { label: string; value: string; color: string }[]> = {
  "All tasks": [
    { label: "Completed", value: "90 tasks", color: "#342D87" },
    { label: "To review", value: "3 tasks", color: "#7475EB" },
    { label: "Overdue", value: "2 tasks", color: "#F1331D" },
    { label: "Remaining", value: "6 tasks", color: "#F8BC0D" },
  ],
  "Journal entries": [
    { label: "Completed", value: "46 tasks", color: "#342D87" },
    { label: "To review", value: "0 tasks", color: "#7475EB" },
    { label: "Overdue", value: "0 tasks", color: "#F1331D" },
    { label: "Remaining", value: "0 tasks", color: "#F8BC0D" },
  ],
  "Account reconciliations": [
    { label: "Completed", value: "35 tasks", color: "#342D87" },
    { label: "To review", value: "2 tasks", color: "#7475EB" },
    { label: "Overdue", value: "2 tasks", color: "#F1331D" },
    { label: "Remaining", value: "4 tasks", color: "#F8BC0D" },
  ],
  "Flux analysis reports": [
    { label: "Completed", value: "1 task", color: "#342D87" },
    { label: "To review", value: "0 tasks", color: "#7475EB" },
    { label: "Overdue", value: "0 tasks", color: "#F1331D" },
    { label: "Remaining", value: "1 task", color: "#F8BC0D" },
  ],
  "Other": [
    { label: "Completed", value: "8 tasks", color: "#342D87" },
    { label: "To review", value: "1 task", color: "#7475EB" },
    { label: "Overdue", value: "0 tasks", color: "#F1331D" },
    { label: "Remaining", value: "1 task", color: "#F8BC0D" },
  ],
}

// Progress bar percentages by category
const progressBarByCategory: Record<string, { completed: number; review: number; overdue: number; remaining: number }> = {
  "All tasks": { completed: 89, review: 3, overdue: 2, remaining: 6 },
  "Journal entries": { completed: 100, review: 0, overdue: 0, remaining: 0 },
  "Account reconciliations": { completed: 81, review: 5, overdue: 5, remaining: 9 },
  "Flux analysis reports": { completed: 50, review: 0, overdue: 0, remaining: 50 },
  "Other": { completed: 80, review: 10, overdue: 0, remaining: 10 },
}

const entityProgress = [
  { code: "HOLDCO", label: "Stacks", value: "8/8", color: "bg-amber-400" },
  { code: "DE", label: "Stacks GmbH", value: "6/6", color: "bg-blue-500" },
  { code: "JPN", label: "Stacks GK", value: "4/4", color: "bg-orange-500" },
  { code: "UK", label: "Stacks Ltd", value: "4/4", color: "bg-neutral-800" },
  { code: "US", label: "Stacks Inc", value: "3/3", color: "bg-emerald-500" },
]

const categoryProgress = [
  { label: "Accruals", value: "12/12" },
  { label: "Prepaids and Other Assets", value: "7/7" },
  { label: "Fixed Assets", value: "6/6" },
  { label: "Equity", value: "5/5" },
  { label: "Accounts Receivable", value: "5/5" },
]

const preparerProgress = [
  { name: "Naman Mathur", value: "5/5", color: "bg-rose-500", textColor: "text-white", image: "/people/naman.jpeg" },
  { name: "Albert Malikov", value: "4/4", color: "bg-teal-500", textColor: "text-white", image: "/people/albert.jpeg" },
  { name: "Koen Bentvelsen", value: "3/3", color: "bg-neutral-200", textColor: "text-neutral-700", image: "/avatars/koen.jpg" },
  { name: "Noah van Lienden", value: "2/2", color: "bg-orange-500", textColor: "text-white", image: "/people/noah-pf.png" },
  { name: "Kyle Kinsey", value: "1/1", color: "bg-neutral-300", textColor: "text-neutral-700", image: "/avatars/kyle.jpg" },
]

const statCards = [
  { label: "All tasks", value: "90", total: "101" },
  { label: "Journal entries", value: "46", total: "46" },
  { label: "Account reconciliations", value: "35", total: "43" },
  { label: "Flux analysis reports", value: "1", total: "2" },
  { label: "Other", value: "8", total: "10" },
]

// This would typically come from your app state/context
const currentMonth = "January 2026"
const currentStatus = { label: "Open", variant: "open" as const }

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All tasks")
  
  const currentChartData = chartDataByCategory[selectedCategory]
  const currentStatusSummary = statusSummaryByCategory[selectedCategory]
  const currentProgressBar = progressBarByCategory[selectedCategory]
  
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden border-l border-neutral-200">
        {/* Top Navbar */}
        <Navbar
          breadcrumbs={[
            { label: "Month-end Close" },
            { label: currentMonth, hasDropdown: true },
          ]}
          action={{
            label: "Close period",
            icon: <Lock className="h-3.5 w-3.5" />,
            onClick: () => console.log("Close period clicked"),
          }}
        />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-5xl space-y-8 px-6 py-6 lg:px-8">
            {/* Page Header */}
            <PageHeader title={currentMonth} status={currentStatus} />

        {/* Stats Row */}
        <div className="rounded-xl bg-neutral-100 p-1.5">
          <div className="relative grid grid-cols-5 gap-1">
            {statCards.map((stat) => (
              <button
                key={stat.label}
                onClick={() => setSelectedCategory(stat.label)}
                className="relative px-5 py-4 rounded-lg text-left transition-colors"
              >
                {selectedCategory === stat.label && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white rounded-lg shadow-sm"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <div className="relative z-10">
                  <p className="text-xs text-neutral-500">{stat.label}</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-neutral-900">
                    {stat.value}
                    <span className="text-neutral-400 font-normal">/{stat.total}</span>
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Close Progress Section */}
        <section className="space-y-4">
          <h2 className="text-base font-medium text-neutral-900">Close progress</h2>
          
          {/* Multi-color Progress Bar */}
          <div className="flex h-2.5 w-full gap-0.5">
            <motion.div 
              className="rounded-full"
              initial={false}
              animate={{ width: `${currentProgressBar.completed}%` }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              style={{ backgroundColor: "#342D87" }}
            />
            <motion.div 
              className="rounded-full"
              initial={false}
              animate={{ width: `${currentProgressBar.review}%` }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              style={{ backgroundColor: "#7475EB" }}
            />
            <motion.div 
              className="rounded-full"
              initial={false}
              animate={{ width: `${currentProgressBar.overdue}%` }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              style={{ backgroundColor: "#F1331D" }}
            />
            <motion.div 
              className="rounded-full"
              initial={false}
              animate={{ width: `${currentProgressBar.remaining}%` }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              style={{ backgroundColor: "#F8BC0D" }}
            />
          </div>
          
          {/* Legend */}
          <div className="flex items-start gap-36 pt-2">
            {currentStatusSummary.map((item) => {
              const [count, ...rest] = item.value.split(" ")
              const unit = rest.join(" ")
              return (
                <div key={item.label} className="flex items-start gap-2">
                  <span className="mt-1 h-3 w-3 rounded" style={{ backgroundColor: item.color }} />
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-neutral-500">{item.label}</span>
                    <span className="text-sm text-neutral-900">
                      <span className="font-semibold">{count}</span> {unit}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Chart Section */}
        <div className="w-full">
          <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={currentChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorPurple" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#342D87" stopOpacity={0.12}/>
                <stop offset="95%" stopColor="#342D87" stopOpacity={0.02}/>
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#a3a3a3" }}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                fontSize: 12,
                padding: "8px 12px",
              }}
              formatter={(value) => [`${value ?? 0} tasks`, "Completed"]}
            />
            <Area
              isAnimationActive={true}
              animationDuration={500}
              type="stepAfter"
              dataKey="value"
              stroke={chartColors.stroke}
              strokeWidth={1.5}
              fillOpacity={1}
              fill={chartColors.fill}
            />
          </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Progress Lists */}
        <section className="grid gap-8 lg:grid-cols-3 pt-4">
          {/* Progress per entity */}
          <div>
            <h3 className="text-base font-medium text-neutral-900 mb-4">Progress per entity</h3>
            <div className="space-y-0">
              {entityProgress.map((item) => (
                <div key={item.code + item.label} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className={`h-2 w-2 rounded-full ${item.color}`} />
                    <span className="inline-flex items-center rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] font-medium text-neutral-500 uppercase tracking-wide">{item.code}</span>
                    <span className="text-sm text-neutral-700">{item.label}</span>
                  </div>
                  <span className="text-sm tabular-nums text-neutral-500">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Progress per category */}
          <div>
            <h3 className="text-base font-medium text-neutral-900 mb-4">Progress per category</h3>
            <div className="space-y-0">
              {categoryProgress.map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Tag className="h-4 w-4 text-neutral-400" strokeWidth={1.5} />
                    <span className="text-sm text-neutral-700">{item.label}</span>
                  </div>
                  <span className="text-sm tabular-nums text-neutral-500">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Progress per preparer */}
          <div>
            <h3 className="text-base font-medium text-neutral-900 mb-4">Progress per preparer</h3>
            <div className="space-y-0">
              {preparerProgress.map((item) => (
                <div key={item.name} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-6 w-6">
                      {item.image ? (
                        <AvatarImage src={item.image} alt={item.name} />
                      ) : null}
                      <AvatarFallback className={`text-[10px] font-medium ${item.color} ${item.textColor}`}>
                        {item.name
                          .split(" ")
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-neutral-700">{item.name}</span>
                  </div>
                  <span className="text-sm tabular-nums text-neutral-500">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
          </div>
        </main>
      </div>
    </div>
  )
}

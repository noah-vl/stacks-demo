"use client"

import { Settings, ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/sidebar"
import { Navbar } from "@/components/navbar"

export default function SettingsPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden border-l border-neutral-200">
        {/* Top Navbar */}
        <Navbar
          breadcrumbs={[
            { label: "Settings" },
          ]}
        />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-5xl px-6 py-6 lg:px-8">
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="rounded-full bg-neutral-100 p-4 mb-6">
                <Settings className="h-8 w-8 text-neutral-400" />
              </div>
              <h1 className="text-xl font-semibold text-neutral-900 mb-2">
                Settings
              </h1>
              <p className="text-sm text-neutral-500 mb-8 max-w-md">
                This is a demo. This page does not exist yet.
              </p>
              <Link href="/">
                <Button className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to homepage
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

"use client"

import React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { CollegeHeader } from "@/components/college-header"
import { NoticeCard } from "@/components/notice-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { getNoticesByDepartment, CATEGORIES, type Notice } from "@/lib/store"
import {
  LogOut,
  FileText,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  PartyPopper,
  Bell,
  Building2,
  User,
} from "lucide-react"

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  notice: <FileText className="h-4 w-4" />,
  holiday: <CalendarDays className="h-4 w-4" />,
  attendance: <ClipboardCheck className="h-4 w-4" />,
  academic: <GraduationCap className="h-4 w-4" />,
  event: <PartyPopper className="h-4 w-4" />,
}

export default function StudentDashboard() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [notices, setNotices] = useState<Notice[]>([])
  const [activeCategory, setActiveCategory] = useState("all")

  const loadNotices = useCallback(() => {
    if (user?.department) {
      const deptNotices = getNoticesByDepartment(user.department)
      setNotices(deptNotices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    }
  }, [user?.department])

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "student")) {
      router.push("/auth/login")
      return
    }
    loadNotices()
  }, [user, isLoading, router, loadNotices])

  if (isLoading || !user || user.role !== "student") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  function handleLogout() {
    logout()
    router.push("/")
  }

  const filteredNotices =
    activeCategory === "all"
      ? notices
      : notices.filter((n) => n.category === activeCategory)

  const highPriorityNotices = notices.filter((n) => n.priority === "high")

  return (
    <div className="min-h-screen bg-background">
      <CollegeHeader />

      {/* Student Navbar */}
      <nav className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-semibold">{user.name}</h1>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <Building2 className="mr-1 h-3 w-3" />
                  {user.department}
                </Badge>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" className="bg-transparent" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* High Priority Alert */}
        {highPriorityNotices.length > 0 && (
          <Card className="mb-6 border-destructive/50 bg-destructive/5">
            <CardContent className="flex items-start gap-3 pt-6">
              <Bell className="mt-0.5 h-5 w-5 text-destructive" />
              <div>
                <p className="font-semibold text-destructive">
                  {highPriorityNotices.length} Important{" "}
                  {highPriorityNotices.length === 1 ? "Notice" : "Notices"}
                </p>
                <p className="text-sm text-muted-foreground">
                  You have high priority notices that require your attention.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Row */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
          <Card
            className={`cursor-pointer transition-shadow hover:shadow-md ${activeCategory === "all" ? "ring-2 ring-primary" : ""}`}
            onClick={() => setActiveCategory("all")}
          >
            <CardContent className="flex flex-col items-center pt-6 text-center">
              <FileText className="mb-1 h-6 w-6 text-primary" />
              <p className="text-xl font-bold">{notices.length}</p>
              <p className="text-xs text-muted-foreground">All Notices</p>
            </CardContent>
          </Card>
          {CATEGORIES.map((cat) => {
            const count = notices.filter((n) => n.category === cat.value).length
            return (
              <Card
                key={cat.value}
                className={`cursor-pointer transition-shadow hover:shadow-md ${activeCategory === cat.value ? "ring-2 ring-primary" : ""}`}
                onClick={() => setActiveCategory(cat.value)}
              >
                <CardContent className="flex flex-col items-center pt-6 text-center">
                  {CATEGORY_ICONS[cat.value]}
                  <p className="text-xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">{cat.label}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Notices */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {activeCategory === "all"
                  ? `All Notices for ${user.department}`
                  : `${CATEGORIES.find((c) => c.value === activeCategory)?.label ?? "Notices"} - ${user.department}`}
              </CardTitle>
              <Badge variant="secondary">{filteredNotices.length} notices</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {filteredNotices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="mb-3 h-12 w-12 text-muted-foreground/40" />
                <p className="text-muted-foreground">No notices available.</p>
                <p className="text-sm text-muted-foreground">
                  Check back later for updates from your department.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredNotices.map((notice) => (
                  <NoticeCard key={notice.id} notice={notice} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

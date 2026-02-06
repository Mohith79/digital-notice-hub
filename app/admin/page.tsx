"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { CollegeHeader } from "@/components/college-header"
import { NoticeForm } from "@/components/notice-form"
import { NoticeCard } from "@/components/notice-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import {
  getNotices,
  saveNotice,
  updateNotice,
  deleteNotice,
  getUsers,
  DEPARTMENTS,
  CATEGORIES,
  type Notice,
} from "@/lib/store"
import { toast } from "sonner"
import {
  LogOut,
  Plus,
  FileText,
  Users,
  Building2,
  Bell,
  LayoutDashboard,
} from "lucide-react"

export default function AdminDashboard() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [notices, setNotices] = useState<Notice[]>([])
  const [filterDept, setFilterDept] = useState("ALL")
  const [filterCategory, setFilterCategory] = useState("ALL")
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const loadNotices = useCallback(() => {
    setNotices(getNotices().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
  }, [])

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/auth/login")
      return
    }
    loadNotices()
  }, [user, isLoading, router, loadNotices])

  if (isLoading || !user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  function handlePostNotice(notice: Notice) {
    saveNotice(notice)
    loadNotices()
    toast.success("Notice posted successfully!")
  }

  function handleUpdateNotice(notice: Notice) {
    updateNotice(notice.id, notice)
    loadNotices()
    setShowEditDialog(false)
    setEditingNotice(null)
    toast.success("Notice updated successfully!")
  }

  function handleDeleteNotice(id: string) {
    deleteNotice(id)
    loadNotices()
    toast.success("Notice deleted.")
  }

  function handleEditClick(notice: Notice) {
    setEditingNotice(notice)
    setShowEditDialog(true)
  }

  function handleLogout() {
    logout()
    router.push("/")
  }

  const users = getUsers()
  const studentCount = users.filter((u) => u.role === "student").length

  const filteredNotices = notices.filter((n) => {
    const deptMatch = filterDept === "ALL" || n.department === filterDept || n.department === "ALL"
    const catMatch = filterCategory === "ALL" || n.category === filterCategory
    return deptMatch && catMatch
  })

  const deptCounts: Record<string, number> = {}
  for (const dept of DEPARTMENTS) {
    deptCounts[dept] = notices.filter((n) => n.department === dept || n.department === "ALL").length
  }

  return (
    <div className="min-h-screen bg-background">
      <CollegeHeader />

      {/* Admin Navbar */}
      <nav className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
              <LayoutDashboard className="h-4 w-4 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-semibold">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">Welcome, {user.name}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="bg-transparent" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{notices.length}</p>
                <p className="text-xs text-muted-foreground">Total Notices</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{DEPARTMENTS.length}</p>
                <p className="text-xs text-muted-foreground">Departments</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{studentCount}</p>
                <p className="text-xs text-muted-foreground">Students</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {notices.filter((n) => n.priority === "high").length}
                </p>
                <p className="text-xs text-muted-foreground">High Priority</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="post" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-3">
            <TabsTrigger value="post">
              <Plus className="mr-2 h-4 w-4" />
              Post Notice
            </TabsTrigger>
            <TabsTrigger value="manage">
              <FileText className="mr-2 h-4 w-4" />
              Manage Notices
            </TabsTrigger>
            <TabsTrigger value="departments">
              <Building2 className="mr-2 h-4 w-4" />
              Departments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="post">
            <Card>
              <CardHeader>
                <CardTitle>Create New Notice</CardTitle>
              </CardHeader>
              <CardContent>
                <NoticeForm onSubmit={handlePostNotice} userId={user.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <CardTitle>All Notices ({filteredNotices.length})</CardTitle>
                  <div className="flex gap-2">
                    <Select value={filterDept} onValueChange={setFilterDept}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Departments</SelectItem>
                        {DEPARTMENTS.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Categories</SelectItem>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredNotices.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="mb-3 h-12 w-12 text-muted-foreground/40" />
                    <p className="text-muted-foreground">No notices found.</p>
                    <p className="text-sm text-muted-foreground">
                      Post your first notice from the Post Notice tab.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {filteredNotices.map((notice) => (
                      <NoticeCard
                        key={notice.id}
                        notice={notice}
                        showActions
                        onEdit={handleEditClick}
                        onDelete={handleDeleteNotice}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {DEPARTMENTS.map((dept) => {
                const deptStudents = users.filter(
                  (u) => u.role === "student" && u.department === dept
                ).length
                return (
                  <Card key={dept}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{dept}</CardTitle>
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-3">
                        <Badge variant="secondary">
                          {deptCounts[dept]} Notices
                        </Badge>
                        <Badge variant="outline">
                          {deptStudents} Students
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Notice</DialogTitle>
          </DialogHeader>
          {editingNotice && (
            <NoticeForm
              onSubmit={handleUpdateNotice}
              initialData={editingNotice}
              userId={user.id}
              submitLabel="Update Notice"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

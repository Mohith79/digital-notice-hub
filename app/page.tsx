"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CollegeHeader } from "@/components/college-header"
import { NoticeCard } from "@/components/notice-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { getNotices, DEPARTMENTS, type Notice } from "@/lib/store"
import {
  LogIn,
  Shield,
  GraduationCap,
  FileText,
  Building2,
  CalendarDays,
  ClipboardCheck,
  PartyPopper,
  Megaphone,
  LayoutDashboard,
} from "lucide-react"

export default function HomePage() {
  const { user } = useAuth()
  const [notices, setNotices] = useState<Notice[]>([])
  const [selectedDept, setSelectedDept] = useState("ALL")

  useEffect(() => {
    setNotices(
      getNotices().sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    )
  }, [])

  const filteredNotices =
    selectedDept === "ALL"
      ? notices
      : notices.filter((n) => n.department === selectedDept || n.department === "ALL")

  const recentNotices = filteredNotices.slice(0, 10)

  return (
    <div className="min-h-screen bg-background">
      <CollegeHeader />

      {/* Navigation Bar */}
      <nav className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold">Digital Notice Board</h1>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <Button size="sm" asChild>
                <Link href={user.role === "admin" ? "/admin" : "/student"}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  My Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" size="sm" className="bg-transparent" asChild>
                  <Link href="/auth/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/signup?role=student">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Sign Up
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Hero Section with Campus Image */}
        <div className="relative mb-8 overflow-hidden rounded-lg">
          {/* Campus Image */}
          <div className="relative h-64 md:h-80 lg:h-96">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/srit-campus.jpeg"
              alt="SRIT Campus - Srinivasa Ramanujan Institute of Technology building with green lawns and palm trees"
              className="h-full w-full object-cover"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-foreground/60" />
            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
              <Megaphone className="mb-3 h-10 w-10 text-card" />
              <h2 className="mb-2 text-2xl font-bold text-card md:text-3xl lg:text-4xl text-balance">
                SRIT Digital Notice Board
              </h2>
              <p className="max-w-2xl text-sm text-card/80 md:text-base leading-relaxed">
                Stay updated with the latest notices, holidays, attendance updates, academic
                announcements, and events from all departments of Srinivasa Ramanujan Institute
                of Technology.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Badge className="gap-1 border-card/30 bg-card/15 text-card backdrop-blur-sm">
                  <FileText className="h-3 w-3" /> Notices
                </Badge>
                <Badge className="gap-1 border-card/30 bg-card/15 text-card backdrop-blur-sm">
                  <CalendarDays className="h-3 w-3" /> Holidays
                </Badge>
                <Badge className="gap-1 border-card/30 bg-card/15 text-card backdrop-blur-sm">
                  <ClipboardCheck className="h-3 w-3" /> Attendance
                </Badge>
                <Badge className="gap-1 border-card/30 bg-card/15 text-card backdrop-blur-sm">
                  <GraduationCap className="h-3 w-3" /> Academics
                </Badge>
                <Badge className="gap-1 border-card/30 bg-card/15 text-card backdrop-blur-sm">
                  <PartyPopper className="h-3 w-3" /> Events
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Department Tabs */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Filter by Department
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedDept === "ALL" ? "default" : "outline"}
              size="sm"
              className={selectedDept !== "ALL" ? "bg-transparent" : ""}
              onClick={() => setSelectedDept("ALL")}
            >
              All Departments
            </Button>
            {DEPARTMENTS.map((dept) => (
              <Button
                key={dept}
                variant={selectedDept === dept ? "default" : "outline"}
                size="sm"
                className={selectedDept !== dept ? "bg-transparent" : ""}
                onClick={() => setSelectedDept(dept)}
              >
                <Building2 className="mr-1 h-3 w-3" />
                {dept}
              </Button>
            ))}
          </div>
        </div>

        {/* Notices Grid */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {selectedDept === "ALL"
                ? "Latest Notices"
                : `Notices for ${selectedDept}`}
            </h3>
            <Badge variant="secondary">{recentNotices.length} notices</Badge>
          </div>

          {recentNotices.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <FileText className="mb-3 h-16 w-16 text-muted-foreground/30" />
                <p className="text-lg font-medium text-muted-foreground">No notices posted yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {user?.role === "admin" ? (
                    <Link href="/admin" className="text-primary hover:underline">
                      Go to the admin dashboard to post your first notice.
                    </Link>
                  ) : (
                    "Check back later for updates from departments."
                  )}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {recentNotices.map((notice) => (
                <NoticeCard key={notice.id} notice={notice} />
              ))}
            </div>
          )}
        </div>

        {/* Quick Access Cards */}
        {!user && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                    <GraduationCap className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">For Students</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
                  Sign up with your department to get personalized notices, holiday lists,
                  attendance updates, and academic announcements.
                </p>
                <Button asChild>
                  <Link href="/auth/signup?role=student">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Student Sign Up
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                    <Shield className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">For Administrators</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
                  Manage the digital notice board - post notices, update holidays,
                  track attendance, and manage department information.
                </p>
                <Button variant="outline" className="bg-transparent" asChild>
                  <Link href="/auth/signup?role=admin">
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Sign Up
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 border-t border-border pt-6 pb-8 text-center">
          <p className="text-sm text-muted-foreground">
            Srinivasa Ramanujan Institute of Technology (AUTONOMOUS)
          </p>
          <p className="text-xs text-muted-foreground">
            Rotarypuram Village, BK Samudram Mandal, Ananthapuramu - 515701
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {"Accredited by NBA Under Tier-I & NAAC with \"A\" Grade, Affiliated to JNTUA, Ananthapuramu"}
          </p>
        </footer>
      </main>
    </div>
  )
}

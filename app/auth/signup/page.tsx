"use client"

import React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { CollegeHeader } from "@/components/college-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { findUserByEmail, saveUser, hasAdmin, generateId, DEPARTMENTS } from "@/lib/store"
import { toast } from "sonner"
import { UserPlus, Shield, GraduationCap } from "lucide-react"
import { Suspense } from "react"

function SignupForm() {
  const searchParams = useSearchParams()
  const roleParam = searchParams.get("role")
  const isAdmin = roleParam === "admin"

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [department, setDepartment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.")
      setIsSubmitting(false)
      return
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.")
      setIsSubmitting(false)
      return
    }

    if (findUserByEmail(email)) {
      toast.error("An account with this email already exists.")
      setIsSubmitting(false)
      return
    }

    if (isAdmin && hasAdmin()) {
      toast.error("An admin account already exists. Please contact the existing admin.")
      setIsSubmitting(false)
      return
    }

    if (!isAdmin && !department) {
      toast.error("Please select your department.")
      setIsSubmitting(false)
      return
    }

    const user = {
      id: generateId(),
      name,
      email,
      password,
      role: isAdmin ? "admin" as const : "student" as const,
      department: isAdmin ? undefined : department,
      createdAt: new Date().toISOString(),
    }

    saveUser(user)
    login(user)
    toast.success(`Account created successfully! Welcome, ${name}.`)

    if (isAdmin) {
      router.push("/admin")
    } else {
      router.push("/student")
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
          {isAdmin ? (
            <Shield className="h-6 w-6 text-primary-foreground" />
          ) : (
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          )}
        </div>
        <CardTitle className="text-2xl font-bold">
          {isAdmin ? "Admin Registration" : "Student Registration"}
        </CardTitle>
        <CardDescription>
          {isAdmin
            ? "Create an admin account to manage the notice board"
            : "Create a student account to view department notices"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {!isAdmin && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="department">Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select your department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            <UserPlus className="mr-2 h-4 w-4" />
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-primary hover:underline">
            Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background">
      <CollegeHeader />
      <main className="flex flex-col items-center justify-center px-4 py-12">
        <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
          <SignupForm />
        </Suspense>
      </main>
    </div>
  )
}

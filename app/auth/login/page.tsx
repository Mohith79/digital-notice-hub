"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CollegeHeader } from "@/components/college-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { findUserByEmail } from "@/lib/store"
import { toast } from "sonner"
import { LogIn, Shield, GraduationCap } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    const user = findUserByEmail(email)
    if (!user) {
      toast.error("No account found with this email.")
      setIsSubmitting(false)
      return
    }
    if (user.password !== password) {
      toast.error("Incorrect password.")
      setIsSubmitting(false)
      return
    }

    login(user)
    toast.success(`Welcome back, ${user.name}!`)

    if (user.role === "admin") {
      router.push("/admin")
    } else {
      router.push("/student")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <CollegeHeader />
      <main className="flex flex-col items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
              <LogIn className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to access the Digital Notice Board
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 flex flex-col gap-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    {"Don't have an account?"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/auth/signup?role=student">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Sign Up as Student
                  </Link>
                </Button>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/auth/signup?role=admin">
                    <Shield className="mr-2 h-4 w-4" />
                    Sign Up as Admin
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

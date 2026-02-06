"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DEPARTMENTS, CATEGORIES, type Notice, generateId } from "@/lib/store"
import { toast } from "sonner"
import { Send } from "lucide-react"

interface NoticeFormProps {
  onSubmit: (notice: Notice) => void
  initialData?: Partial<Notice>
  userId: string
  submitLabel?: string
}

export function NoticeForm({ onSubmit, initialData, userId, submitLabel = "Post Notice" }: NoticeFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "")
  const [content, setContent] = useState(initialData?.content ?? "")
  const [department, setDepartment] = useState(initialData?.department ?? "")
  const [category, setCategory] = useState(initialData?.category ?? "")
  const [priority, setPriority] = useState(initialData?.priority ?? "medium")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!department || !category) {
      toast.error("Please fill in all required fields.")
      return
    }

    const notice: Notice = {
      id: initialData?.id ?? generateId(),
      title,
      content,
      department,
      category: category as Notice["category"],
      priority: priority as Notice["priority"],
      createdBy: userId,
      createdAt: initialData?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    onSubmit(notice)

    if (!initialData) {
      setTitle("")
      setContent("")
      setDepartment("")
      setCategory("")
      setPriority("medium")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="notice-title">Title</Label>
        <Input
          id="notice-title"
          placeholder="Enter notice title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="notice-content">Content</Label>
        <Textarea
          id="notice-content"
          placeholder="Enter notice details..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label>Department</Label>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
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
        </div>

        <div className="flex flex-col gap-2">
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Priority</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" className="w-full md:w-auto md:self-end">
        <Send className="mr-2 h-4 w-4" />
        {submitLabel}
      </Button>
    </form>
  )
}

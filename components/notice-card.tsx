"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Notice } from "@/lib/store"
import { format } from "date-fns"
import { Trash2, Edit, Calendar, Building2, AlertTriangle, Tag } from "lucide-react"

interface NoticeCardProps {
  notice: Notice
  showActions?: boolean
  onEdit?: (notice: Notice) => void
  onDelete?: (id: string) => void
}

function categoryColor(category: string) {
  switch (category) {
    case "holiday":
      return "bg-emerald-100 text-emerald-800 border-emerald-200"
    case "attendance":
      return "bg-amber-100 text-amber-800 border-amber-200"
    case "academic":
      return "bg-sky-100 text-sky-800 border-sky-200"
    case "event":
      return "bg-violet-100 text-violet-800 border-violet-200"
    default:
      return "bg-secondary text-secondary-foreground border-border"
  }
}

function priorityColor(priority: string) {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800 border-red-200"
    case "medium":
      return "bg-amber-100 text-amber-800 border-amber-200"
    default:
      return "bg-secondary text-secondary-foreground border-border"
  }
}

export function NoticeCard({ notice, showActions = false, onEdit, onDelete }: NoticeCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="text-lg leading-tight">{notice.title}</CardTitle>
          {showActions && (
            <div className="flex gap-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEdit(notice)}
                  aria-label="Edit notice"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => onDelete(notice.id)}
                  aria-label="Delete notice"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <Badge variant="outline" className={categoryColor(notice.category)}>
            <Tag className="mr-1 h-3 w-3" />
            {notice.category.charAt(0).toUpperCase() + notice.category.slice(1)}
          </Badge>
          <Badge variant="outline" className={priorityColor(notice.priority)}>
            {notice.priority === "high" && <AlertTriangle className="mr-1 h-3 w-3" />}
            {notice.priority.charAt(0).toUpperCase() + notice.priority.slice(1)} Priority
          </Badge>
          <Badge variant="outline">
            <Building2 className="mr-1 h-3 w-3" />
            {notice.department === "ALL" ? "All Departments" : notice.department}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {notice.content}
        </p>
        <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>Posted {format(new Date(notice.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
        </div>
      </CardContent>
    </Card>
  )
}

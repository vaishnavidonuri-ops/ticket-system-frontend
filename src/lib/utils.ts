import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const API = "/api/v1"

export const CURRENT_USER = { id: "EMP001", name: "Alice Johnson", avatar: "AJ", role: "IT Support" }

export const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"

export const formatDateTime = (d?: string) =>
  d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"

export const getInitials = (name: string) =>
  name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)

export const STATUS_COLORS: Record<string, string> = {
  "New":         "bg-blue-100 text-blue-700 border-blue-200",
  "In Progress": "bg-orange-100 text-orange-700 border-orange-200",
  "Resolved":    "bg-green-100 text-green-700 border-green-200",
  "Closed":      "bg-slate-100 text-slate-600 border-slate-200",
  "Pending":     "bg-purple-100 text-purple-700 border-purple-200",
}

export const STATUS_DOT: Record<string, string> = {
  "New":         "bg-blue-500",
  "In Progress": "bg-orange-500",
  "Resolved":    "bg-green-500",
  "Closed":      "bg-slate-400",
  "Pending":     "bg-purple-500",
}

export const PRIORITY_COLORS: Record<string, string> = {
  "Low":      "bg-green-100 text-green-700 border-green-200",
  "Normal":   "bg-blue-100 text-blue-700 border-blue-200",
  "Medium":   "bg-yellow-100 text-yellow-700 border-yellow-200",
  "High":     "bg-orange-100 text-orange-700 border-orange-200",
  "Critical": "bg-red-100 text-red-700 border-red-200",
}

export const PRIORITY_DOT: Record<string, string> = {
  "Low":      "bg-green-500",
  "Normal":   "bg-blue-500",
  "Medium":   "bg-yellow-500",
  "High":     "bg-orange-500",
  "Critical": "bg-red-600",
}

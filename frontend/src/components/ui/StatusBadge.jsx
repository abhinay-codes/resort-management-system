import { cn } from "@/lib/utils"

export function StatusBadge({ status, className }) {
  if (!status) return null

  const formatStatus = (s) =>
    s
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase())

  const getClasses = (s) => {
    switch (s) {
      case "CONFIRMED":
      case "SUCCESS":
      case "AVAILABLE":
      case "COMPLETED":
      case "RESOLVED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"

      case "PENDING":
      case "BOOKED":
      case "OPEN":
        return "bg-amber-50 text-amber-700 border-amber-200"

      case "CHECKED_IN":
      case "IN_PROGRESS":
      case "OCCUPIED":
        return "bg-blue-50 text-blue-700 border-blue-200"

      case "CANCELLED":
      case "FAILED":
        return "bg-red-50 text-red-700 border-red-200"

      case "CLEANING":
        return "bg-purple-50 text-purple-700 border-purple-200"

      case "MAINTENANCE":
        return "bg-orange-50 text-orange-700 border-orange-200"

      case "CHECKED_OUT":
      case "REFUNDED":
      default:
        return "bg-slate-50 text-slate-700 border-slate-200"
    }
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide",
        getClasses(status),
        className
      )}
    >
      {formatStatus(status)}
    </span>
  )
}


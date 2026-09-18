import { cn } from "@/lib/utils"

export function StatCard({ title, value, description, icon: Icon, className }) {
  return (
    <div className={cn("rounded-2xl border border-slate-200 bg-white p-6 shadow-sm", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
        </div>
        {Icon && (
          <div className="rounded-xl bg-slate-50 p-3">
            <Icon className="h-5 w-5 text-slate-700" />
          </div>
        )}
      </div>
      {description && <p className="mt-4 text-sm text-slate-500">{description}</p>}
    </div>
  )
}


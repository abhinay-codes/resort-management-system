import { cn } from "@/lib/utils"

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn("rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center", className)}>
      {Icon && <Icon className="mx-auto h-12 w-12 text-slate-400 mb-5" />}
      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-slate-600">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}


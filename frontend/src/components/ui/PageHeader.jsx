import { cn } from "@/lib/utils"

export function PageHeader({ eyebrow, title, description, action, className }) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8", className)}>
      <div>
        {eyebrow && (
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            {eyebrow}
          </p>
        )}
        <h1 className={cn("text-3xl font-semibold tracking-tight text-slate-900", eyebrow && "mt-2")}>
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-slate-600 max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}


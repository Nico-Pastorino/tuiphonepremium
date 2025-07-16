"use client"

import * as React from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppState } from "@/hooks/use-app-state"

const Toast = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "success" | "error" | "info" | "warning"
    title?: string
    onClose?: () => void
  }
>(({ className, variant = "info", title, children, onClose, ...props }, ref) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
  }

  const Icon = icons[variant]

  const variants = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  }

  const iconColors = {
    success: "text-green-500",
    error: "text-red-500",
    info: "text-blue-500",
    warning: "text-yellow-500",
  }

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex items-start gap-3 p-4 border rounded-lg shadow-lg backdrop-blur-sm animate-in slide-in-from-right-full duration-300",
        variants[variant],
        className,
      )}
      {...props}
    >
      <Icon className={cn("w-5 h-5 mt-0.5 flex-shrink-0", iconColors[variant])} />
      <div className="flex-1 min-w-0">
        {title && <div className="font-semibold text-sm mb-1">{title}</div>}
        <div className="text-sm">{children}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className="flex-shrink-0 p-1 hover:bg-black/10 rounded-md transition-colors">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
})
Toast.displayName = "Toast"

export function ToastContainer() {
  const { notifications, removeNotification } = useAppState()

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm w-full">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          variant={notification.type}
          title={notification.title}
          onClose={() => removeNotification(notification.id)}
        >
          {notification.message}
        </Toast>
      ))}
    </div>
  )
}

export { Toast }

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-green-500 text-white hover:bg-green-600",
        warning: "border-transparent bg-yellow-500 text-white hover:bg-yellow-600",
        info: "border-transparent bg-blue-500 text-white hover:bg-blue-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  status?: 'idle' | 'uploading' | 'ready' | 'pending' | 'translating' | 'completed' | 'error' | 'paused'
}

const statusVariantMap = {
  idle: 'outline' as const,
  uploading: 'info' as const,
  ready: 'success' as const,
  pending: 'warning' as const,
  translating: 'info' as const, 
  completed: 'success' as const,
  error: 'destructive' as const,
  paused: 'secondary' as const,
}

const statusTextMap = {
  idle: '待开始',
  uploading: '上传中',
  ready: '就绪',
  pending: '准备中',
  translating: '翻译中',
  completed: '已完成',
  error: '出错',
  paused: '已暂停',
}

export function StatusBadge({ 
  className, 
  variant, 
  status, 
  children,
  ...props 
}: StatusBadgeProps) {
  const finalVariant = status ? statusVariantMap[status] : variant
  const displayText = status ? statusTextMap[status] : children

  return (
    <div className={cn(badgeVariants({ variant: finalVariant }), className)} {...props}>
      {displayText}
    </div>
  )
}
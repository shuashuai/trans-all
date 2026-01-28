import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils/cn"

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
  text?: string
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6", 
  lg: "h-8 w-8"
}

export function LoadingSpinner({ 
  size = "md", 
  text, 
  className, 
  ...props 
}: LoadingSpinnerProps) {
  return (
    <div 
      className={cn("flex items-center justify-center space-x-2", className)} 
      {...props}
    >
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && (
        <span className="text-sm text-muted-foreground">{text}</span>
      )}
    </div>
  )
}
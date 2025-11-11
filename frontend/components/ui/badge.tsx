import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border border-gray-200 bg-gray-100 text-gray-900",
        primary: "border border-primary-200 bg-primary-100 text-primary-800",
        secondary: "border border-green-200 bg-green-100 text-green-800",
        destructive: "border border-red-200 bg-red-100 text-red-800",
        success: "border border-green-200 bg-green-100 text-green-800",
        warning: "border border-yellow-200 bg-yellow-100 text-yellow-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

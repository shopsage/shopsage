import * as React from "react"
import { cn } from "@/lib/utils"

const InputGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative flex items-center", className)}
    {...props}
  />
))
InputGroup.displayName = "InputGroup"

const InputGroupContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 relative", className)}
    {...props}
  />
))
InputGroupContent.displayName = "InputGroupContent"

const InputGroupButton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("ml-2", className)}
    {...props}
  />
))
InputGroupButton.displayName = "InputGroupButton"

export { InputGroup, InputGroupContent, InputGroupButton }

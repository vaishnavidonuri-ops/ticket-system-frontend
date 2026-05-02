import { cn } from "@/lib/utils"
import { type ButtonHTMLAttributes, forwardRef } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success" | "outline"
  size?: "sm" | "md" | "lg" | "icon"
}

const variantCls = {
  primary:   "bg-blue-700 text-white hover:bg-blue-800 border-transparent shadow-sm",
  secondary: "bg-white text-slate-700 border-slate-300 hover:bg-slate-50",
  ghost:     "bg-transparent text-slate-600 border-transparent hover:bg-slate-100 hover:text-slate-800",
  danger:    "bg-red-600 text-white hover:bg-red-700 border-transparent shadow-sm",
  success:   "bg-green-700 text-white hover:bg-green-800 border-transparent shadow-sm",
  outline:   "bg-transparent text-blue-700 border-blue-300 hover:bg-blue-50",
}

const sizeCls = {
  sm:   "h-7 px-3 text-xs gap-1.5",
  md:   "h-9 px-4 text-sm gap-2",
  lg:   "h-10 px-6 text-sm gap-2",
  icon: "h-8 w-8 p-0",
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "md", children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
        variantCls[variant],
        sizeCls[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
)

Button.displayName = "Button"

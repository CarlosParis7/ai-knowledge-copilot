import * as React from "react"

import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-10 w-full rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-3.5 py-2 text-sm text-[var(--ink)] shadow-xs transition-[border-color,box-shadow] duration-150",
                    "placeholder:text-[var(--ink-3)]",
                    "focus-visible:outline-none focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]",
                    "file:border-0 file:bg-transparent file:text-sm file:font-medium",
                    "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--surface-2)]",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }

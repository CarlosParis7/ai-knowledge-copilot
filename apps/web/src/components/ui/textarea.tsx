import * as React from "react"

import { cn } from "@/lib/utils"

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    "flex min-h-[80px] w-full rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--ink)] shadow-xs transition-[border-color,box-shadow] duration-150",
                    "placeholder:text-[var(--ink-3)]",
                    "focus-visible:outline-none focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]",
                    "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--surface-2)]",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Textarea.displayName = "Textarea"

export { Textarea }

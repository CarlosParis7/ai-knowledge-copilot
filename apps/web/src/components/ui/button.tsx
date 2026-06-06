import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-[background-color,color,box-shadow,border-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--surface)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0 [&_svg]:size-4",
    {
        variants: {
            variant: {
                default:
                    "bg-[var(--accent)] text-[var(--ink-on-accent)] shadow-xs hover:bg-[var(--accent-hover)] active:bg-[var(--accent-press)]",
                destructive:
                    "bg-[var(--danger)] text-white shadow-xs hover:brightness-95 active:brightness-90",
                outline:
                    "border border-[var(--line-strong)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-2)] active:bg-[var(--surface-3)]",
                secondary:
                    "bg-[var(--surface-2)] text-[var(--ink)] hover:bg-[var(--surface-3)] active:bg-[var(--surface-3)]",
                ghost:
                    "text-[var(--ink-2)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] active:bg-[var(--surface-3)]",
                link: "text-[var(--accent)] underline-offset-4 hover:underline",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3 text-[13px]",
                lg: "h-11 rounded-lg px-6",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }

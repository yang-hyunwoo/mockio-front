"use client"

import React from "react"

type Variant = "primary" | "outline" | "ghost" | "glass"
type Size = "sm" | "md" | "lg"

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant
    size?: Size
    pill?: boolean
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
}

function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(" ")
}

const base =
    "inline-flex items-center justify-center gap-2 transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
    "disabled:opacity-40 disabled:cursor-not-allowed"

const sizes: Record<Size, string> = {
    sm: "h-9 px-4 text-sm rounded-xl",
    md: "h-10 px-5 text-sm rounded-xl",
    lg: "h-11 px-6 text-sm rounded-2xl",
}

const variants: Record<Variant, string> = {
    primary: "font-semibold bg-[#355a7a] text-white hover:bg-[#2f4f6b] focus-visible:ring-[#355a7a]/40",
    outline:
        " font-semibold border border-[var(--border-soft)] text-[var(--brand-secondary)] " +
        "hover:border-[var(--brand-secondary)] hover:bg-[var(--surface-glass)] " +
        "focus-visible:ring-[var(--brand-secondary)]/30",
    ghost:
        "font-normal  bg-transparent text-[var(--brand-muted)] hover:text-foreground " +
        "focus-visible:ring-white/20",
    glass:
        "font-semibold border border-[var(--border-glass)] bg-[var(--surface-glass-strong)] backdrop-blur " +
        "text-[var(--text-primary)] shadow-sm hover:bg-[var(--surface-glass)] focus-visible:ring-white/20",
}

export default function Button({
                                   className,
                                   variant = "outline",
                                   size = "md",
                                   pill = false,
                                   leftIcon,
                                   rightIcon,
                                   children,
                                   ...props
                               }: Props) {
    return (
        <button
            {...props}
            className={cx(base, sizes[size], variants[variant], pill && "rounded-full", className)}
        >
            {leftIcon}
            {children}
            {rightIcon}
        </button>
    )
}
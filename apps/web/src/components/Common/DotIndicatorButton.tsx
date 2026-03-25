"use client"

import React from "react"

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    active?: boolean
}

function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(" ")
}

export default function DotIndicatorButton({ active = false, className, ...props }: Props) {
    return (
        <button
            {...props}
            type="button"
            className={cx(
                "h-2 rounded-full transition-all",
                active ? "w-6 bg-[var(--brand)]" : "w-2 bg-[var(--border-glass)]",
                className
            )}
        />
    )
}

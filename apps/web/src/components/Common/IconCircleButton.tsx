
import React from "react"

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  disabledOpacity?: boolean // prev/next처럼 opacity 처리 필요하면 true
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

export default function IconCircleButton({
  className,
  disabled,
  disabledOpacity = true,
  children,
  ...props
}: Props) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={cx(
        "pointer-events-auto h-9 w-9 rounded-full",
        "border border-[var(--border-glass)]",
        "bg-[var(--surface-glass-strong)] backdrop-blur",
        "grid place-items-center shadow-sm transition-opacity",
        disabled && disabledOpacity ? "opacity-30 cursor-not-allowed" : "opacity-100",
        className
      )}
    >
      {children}
    </button>
  )
}

"use client";

import { ChevronDown, HelpCircle } from "lucide-react";
import { FaqItem } from "@mockio/shared/src/api/faq/FaqItem";

interface FaqCardProps {
    item: FaqItem;
    open: boolean;
    onToggle: () => void;
}

export default function FaqCard({ item, open, onToggle }: FaqCardProps) {
    return (
        <div className="overflow-hidden rounded-2xl border border-black/5 bg-white/80 shadow-sm backdrop-blur-sm transition-colors dark:border-white/10 dark:bg-zinc-900/80">
            <button
                type="button"
                onClick={onToggle}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
                <div className="flex min-w-0 items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-[var(--brand-primary)]/10 p-2 text-[var(--brand-primary)]">
                        <HelpCircle className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--text-primary)] sm:text-base">
                            {item.question}
                        </p>
                    </div>
                </div>

                <ChevronDown
                    className={`h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 ${
                        open ? "rotate-180" : ""
                    }`}
                />
            </button>

            <div
                className={`grid transition-all duration-200 ${
                    open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
            >
                <div className="overflow-hidden">
                    <div className="border-t border-black/5 px-5 py-4 text-sm leading-7 text-gray-600 dark:border-white/10 dark:text-gray-300">
                        {item.answer}
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import { Search } from "lucide-react";

interface FaqSearchBoxProps {
    value: string;
    onChange: (value: string) => void;
}

export default function FaqSearchBox({
                                         value,
                                         onChange,
                                     }: FaqSearchBoxProps) {
    return (
        <div className="mt-6 relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="궁금한 내용을 검색해 보세요."
                className="h-12 w-full rounded-2xl border border-black/10 bg-white/80 pl-11 pr-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 dark:border-white/10 dark:bg-zinc-900/80"
            />
        </div>
    );
}
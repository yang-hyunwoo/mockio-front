"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    page: number;
    totalPages: number;
    onChange: (page: number) => void;
}

export default function FaqPagination({
                                          page,
                                          totalPages,
                                          onChange,
                                      }: PaginationProps) {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="mt-8 flex items-center justify-center gap-2">
            <button
                type="button"
                onClick={() => onChange(page - 1)}
                disabled={page === 1}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-zinc-900 dark:text-gray-300 dark:hover:bg-zinc-800"
            >
                <ChevronLeft className="h-4 w-4" />
            </button>

            {pages.map((pageNumber) => {
                const active = page === pageNumber;

                return (
                    <button
                        key={pageNumber}
                        type="button"
                        onClick={() => onChange(pageNumber)}
                        className={`inline-flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-medium transition ${
                            active
                                ? "bg-[var(--brand-primary)] text-white shadow-md"
                                : "border border-black/10 bg-white text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:bg-zinc-900 dark:text-gray-300 dark:hover:bg-zinc-800"
                        }`}
                    >
                        {pageNumber}
                    </button>
                );
            })}

            <button
                type="button"
                onClick={() => onChange(page + 1)}
                disabled={page === totalPages}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-zinc-900 dark:text-gray-300 dark:hover:bg-zinc-800"
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
}
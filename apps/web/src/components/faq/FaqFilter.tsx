"use client";

import { FaqType } from "@mockio/shared/src/api/faq/FaqItem";

export type FilterFaqType = "ALL" | FaqType;

export const FAQ_TYPES: { key: FilterFaqType; label: string }[] = [
    { key: "ALL", label: "전체" },
    { key: "ACCOUNT", label: "계정" },
    { key: "INTERVIEW", label: "면접 이용" },
    { key: "FEEDBACK", label: "AI 피드백" },
    { key: "PAYMENT", label: "결제" },
    { key: "TECHNICAL", label: "기술 문제" },
    { key: "ETC", label: "기타" },
];

interface FaqFilterProps {
    selectedType: FilterFaqType;
    onChange: (type: FilterFaqType) => void;
}

export default function FaqFilter({
                                      selectedType,
                                      onChange,
                                  }: FaqFilterProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {FAQ_TYPES.map((type) => {
                const active = selectedType === type.key;

                return (
                    <button
                        key={type.key}
                        type="button"
                        onClick={() => onChange(type.key)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                            active
                                ? "bg-[var(--brand-primary)] text-white shadow-md"
                                : "border border-black/10 bg-white/70 text-gray-600 hover:bg-white dark:border-white/10 dark:bg-zinc-900/70 dark:text-gray-300 dark:hover:bg-zinc-800"
                        }`}
                    >
                        {type.label}
                    </button>
                );
            })}
        </div>
    );
}

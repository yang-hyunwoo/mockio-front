"use client";

import { useEffect, useMemo, useState } from "react";
import { FaqItem } from "@mockio/shared/src/api/faq/FaqItem";
import { FaqListApi } from "@/lib/api/faq/FaqListApi";
import FaqCard from "@/components/faq/FaqCard";
import FaqPagination from "@/components/faq/FaqPagination";
import FaqFilter, { FilterFaqType } from "@/components/faq/FaqFilter";
import FaqSearchBox from "@/components/faq/FaqSearchBox";

const PAGE_SIZE = 5;

export default function FaqPage() {
    const [faqList, setFaqList] = useState<FaqItem[]>([]);
    const [selectedType, setSelectedType] = useState<FilterFaqType>("ALL");
    const [keyword, setKeyword] = useState("");
    const [openId, setOpenId] = useState<number | null>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFaqList = async () => {
            try {
                setLoading(true);
                const result = await FaqListApi();
                setFaqList(result.items);
            } catch (error) {
                console.error("FAQ 목록 조회 실패", error);
            } finally {
                setLoading(false);
            }
        };

        void fetchFaqList();
    }, []);

    const filteredFaqs = useMemo(() => {
        const lowerKeyword = keyword.trim().toLowerCase();

        return faqList.filter((item) => {
            const matchesType =
                selectedType === "ALL" || item.faqType.code === selectedType;

            const matchesKeyword =
                !lowerKeyword ||
                item.question.toLowerCase().includes(lowerKeyword) ||
                item.answer.toLowerCase().includes(lowerKeyword);

            return matchesType && matchesKeyword;
        });
    }, [faqList, selectedType, keyword]);

    const totalPages = Math.ceil(filteredFaqs.length / PAGE_SIZE);

    const pagedFaqs = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        return filteredFaqs.slice(start, end);
    }, [filteredFaqs, page]);

    useEffect(() => {
        setPage(1);
        setOpenId(null);
    }, [selectedType, keyword]);

    useEffect(() => {
        if (page > totalPages && totalPages > 0) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    return (
        <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-[28px] border border-black/5 bg-white/70 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/70">
                <div className="border-b border-black/5 px-6 py-8 dark:border-white/10 sm:px-8">
                    <p className="text-sm font-semibold tracking-[0.18em] text-(--brand-primary)">
                        SUPPORT
                    </p>
                    <h1 className="mt-3 text-2xl font-bold text-foreground sm:text-3xl">
                        자주 묻는 질문
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                        계정, 면접 이용, AI 피드백, 결제, 기술 문제 등 자주 묻는 질문을
                        한 곳에서 확인할 수 있습니다.
                    </p>

                    <FaqSearchBox value={keyword} onChange={setKeyword} />
                </div>

                <div className="px-6 py-6 sm:px-8">
                    <FaqFilter
                        selectedType={selectedType}
                        onChange={setSelectedType}
                    />

                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <p>
                            총{" "}
                            <span className="font-semibold text-foreground">
                                {filteredFaqs.length}
                            </span>
                            개의 FAQ
                        </p>
                        <p>{totalPages > 0 ? `${page} / ${totalPages} 페이지` : "0 / 0 페이지"}</p>
                    </div>

                    <div className="mt-6 space-y-3">
                        {loading ? (
                            <div className="rounded-2xl border border-dashed border-black/10 px-6 py-12 text-center dark:border-white/10">
                                <p className="text-base font-semibold text-foreground">
                                    FAQ를 불러오는 중입니다.
                                </p>
                            </div>
                        ) : filteredFaqs.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-black/10 px-6 py-12 text-center dark:border-white/10">
                                <p className="text-base font-semibold text-[var(--text-primary)]">
                                    검색 결과가 없습니다.
                                </p>
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    다른 키워드로 검색하거나 카테고리를 변경해 주세요.
                                </p>
                            </div>
                        ) : (
                            pagedFaqs.map((item) => (
                                <FaqCard
                                    key={item.id}
                                    item={item}
                                    open={openId === item.id}
                                    onToggle={() =>
                                        setOpenId((prev) => (prev === item.id ? null : item.id))
                                    }
                                />
                            ))
                        )}
                    </div>

                    <FaqPagination
                        page={page}
                        totalPages={totalPages}
                        onChange={(nextPage) => {
                            setPage(nextPage);
                            setOpenId(null);
                        }}
                    />
                </div>
            </div>
        </section>
    );
}
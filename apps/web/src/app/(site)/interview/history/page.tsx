"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BadgeCheck, ChevronLeft, ChevronRight, Clock3, FileText, PlayCircle } from "lucide-react"
import { InterviewListApi } from "@/lib/api/interview/InterviewListApi"
import { InterviewItem } from "@mockio/shared/src/api/interview/InterviewPage"
import { PageResponse } from "@mockio/shared/src/api/PageResponse"

type InterviewStatusCode = "ACTIVE" | "ENDED"

const PAGE_SIZE = 10

const getStatusMeta = (status: InterviewStatusCode, item: InterviewItem) => {
    switch (status) {
        case "ENDED":
            return {
                label: "완료",
                badgeClass:
                    "bg-emerald-500/12 text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400 dark:ring-emerald-400/20",
                buttonLabel: "결과 보기",
                buttonHref: `/interview/history/${item.id}`,
                icon: <BadgeCheck className="h-4 w-4" />,
            }
        case "ACTIVE":
            return {
                label: "진행중",
                badgeClass:
                    "bg-blue-500/12 text-blue-600 ring-1 ring-blue-500/20 dark:text-blue-400 dark:ring-blue-400/20",
                buttonLabel: "이어하기",
                buttonHref: `/interview`,
                icon: <Clock3 className="h-4 w-4" />,
            }
    }
}

const isInterviewStatusCode = (value: string): value is InterviewStatusCode => {
    return ["ACTIVE", "ENDED"].includes(value)
}

export default function InterviewListPage() {
    const [items, setItems] = useState<InterviewItem[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(0)
    const [pageInfo, setPageInfo] = useState<PageResponse<InterviewItem> | null>(null)

    useEffect(() => {
        const fetchInterviews = async () => {
            setLoading(true)

            try {
                const data = await InterviewListApi(page, PAGE_SIZE)
                if (!data) {
                    setItems([])
                    setPageInfo(null)
                    return
                }

                setItems(data.content)
                setPageInfo(data)
            } catch (error) {
                console.error("면접 목록 조회 실패", error)
                setItems([])
                setPageInfo(null)
            } finally {
                setLoading(false)
            }
        }

        fetchInterviews()
    }, [page])

    const handlePrevPage = () => {
        if (page > 0) {
            setPage((prev) => prev - 1)
        }
    }

    const handleNextPage = () => {
        if (pageInfo && page < pageInfo.totalPages - 1) {
            setPage((prev) => prev + 1)
        }
    }

    if (loading) {
        return (
            <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="overflow-hidden rounded-[28px] border border-black/5 bg-white/70 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/70">
                    <div className="px-6 py-8 sm:px-8">
                        <div className="h-4 w-28 animate-pulse rounded-full bg-black/10 dark:bg-white/10" />
                        <div className="mt-4 h-8 w-56 animate-pulse rounded-full bg-black/10 dark:bg-white/10" />
                        <div className="mt-2 h-4 w-72 animate-pulse rounded-full bg-black/10 dark:bg-white/10" />

                        <div className="mt-8 space-y-4">
                            {[1, 2, 3].map((idx) => (
                                <div
                                    key={idx}
                                    className="rounded-3xl border border-black/5 bg-white/80 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/3"
                                >
                                    <div className="h-5 w-40 animate-pulse rounded-full bg-black/10 dark:bg-white/10" />
                                    <div className="mt-3 h-4 w-24 animate-pulse rounded-full bg-black/10 dark:bg-white/10" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-[28px] border border-black/5 bg-white/70 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/70">
                <div className="border-b border-black/5 px-6 py-8 dark:border-white/10 sm:px-8">
                    <p className="text-sm font-semibold tracking-[0.18em] text-(--brand-primary)">
                        INTERVIEW HISTORY
                    </p>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                                내 면접 기록
                            </h1>
                            <p className="mt-2 text-sm text-(--brand-muted)">
                                진행했던 AI 면접 내역과 결과를 한눈에 확인해보세요.
                            </p>
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/80 px-4 py-2 text-sm text-(--brand-muted) shadow-sm dark:border-white/10 dark:bg-white/4">
                            <FileText className="h-4 w-4" />
                            총 {pageInfo?.totalElements ?? 0}건
                        </div>
                    </div>
                </div>

                <div className="px-6 py-6 sm:px-8">
                    {items.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-black/10 bg-white/60 px-6 py-16 text-center dark:border-white/10 dark:bg-white/2">
                            <p className="text-lg font-semibold text-foreground">
                                아직 면접 기록이 없습니다.
                            </p>
                            <p className="mt-2 text-sm text-(--brand-muted)">
                                첫 면접을 시작하면 여기에서 기록을 확인할 수 있습니다.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                {items.map((item) => {

                                    const statusCode: InterviewStatusCode = isInterviewStatusCode(item.status.code)
                                        ? item.status.code
                                        : "ENDED"

                                    const statusMeta = getStatusMeta(statusCode, item)

                                    return (
                                        <article
                                            key={item.id}
                                            className="group rounded-3xl border border-black/5 bg-white/80 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)] dark:border-white/10 dark:bg-white/3"
                                        >
                                            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.badgeClass}`}
                                                        >
                                                            {statusMeta.icon}
                                                            {item.status.label}
                                                        </span>

                                                        <span className="text-xs text-(--brand-muted)">
                                                            생성일 {item.createdAt}
                                                        </span>
                                                    </div>

                                                    <h2 className="mt-3 truncate text-xl font-semibold text-foreground">
                                                        {item.title}
                                                    </h2>

                                                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-(--brand-muted)">
                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-black/3 px-3 py-1 dark:bg-white/4">
                                                            질문 {item.totalCount}개
                                                        </span>
                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-black/3 px-3 py-1 dark:bg-white/4">
                                                            진행률 {item.progress}%
                                                        </span>
                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-black/3 px-3 py-1 dark:bg-white/4">
                                                            피드백 #{item.feedbackStyle.label}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex shrink-0 items-center gap-3">
                                                    <Link
                                                        href={statusMeta.buttonHref}
                                                        className="inline-flex h-11 items-center justify-center rounded-full bg-(--brand-primary) px-5 text-sm font-semibold text-white transition-colors hover:bg-(--brand-primary-hover)"
                                                    >
                                                        {statusMeta.buttonLabel}
                                                    </Link>
                                                </div>
                                            </div>
                                        </article>
                                    )
                                })}
                            </div>

                            <div className="mt-8 flex items-center justify-center gap-3">
                                <button
                                    type="button"
                                    onClick={handlePrevPage}
                                    disabled={page === 0}
                                    className="inline-flex h-10 items-center justify-center rounded-full border border-black/10 bg-white px-4 text-sm font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.03]"
                                >
                                    <ChevronLeft className="mr-1 h-4 w-4" />
                                    이전
                                </button>

                                <div className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-(--brand-muted) dark:border-white/10 dark:bg-white/3">
                                    {pageInfo ? `${pageInfo.pageNumber + 1} / ${pageInfo.totalPages}` : "0 / 0"}
                                </div>

                                <button
                                    type="button"
                                    onClick={handleNextPage}
                                    disabled={!pageInfo || page >= pageInfo.totalPages - 1}
                                    className="inline-flex h-10 items-center justify-center rounded-full border border-black/10 bg-white px-4 text-sm font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/3"
                                >
                                    다음
                                    <ChevronRight className="ml-1 h-4 w-4" />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </section>
    )
}
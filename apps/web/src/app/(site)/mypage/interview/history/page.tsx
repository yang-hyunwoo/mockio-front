"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowUpRight,
    ArrowDownRight,
    Minus,
    MessageSquareText,
    Target,
    TrendingUp,
    TriangleAlert,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

type TrackFilter = "ALL" | "BACKEND" | "CS" | "SPRING";
type InterviewStatus = "READY" | "IN_PROGRESS" | "COMPLETED";

interface ScoreHistoryItem {
    interviewId: number;
    title: string;
    track: Exclude<TrackFilter, "ALL">;
    score: number;
    date: string;
}

interface HistoryItem {
    interviewId: number;
    title: string;
    track: Exclude<TrackFilter, "ALL">;
    status: InterviewStatus;
    score?: number;
    feedbackCount: number;
    createdAt: string;
}

interface WeakPointItem {
    category: string;
    averageScore: number;
}

interface GrowthSectionProps {
    scoreHistory: ScoreHistoryItem[];
    historyItems: HistoryItem[];
}

const mockData: GrowthSectionProps = {
    scoreHistory: [
        { interviewId: 1, title: "백엔드 기술 면접", track: "BACKEND", score: 64, date: "03.01" },
        { interviewId: 2, title: "Spring 심화 면접", track: "SPRING", score: 71, date: "03.05" },
        { interviewId: 3, title: "CS 기본 면접", track: "SPRING", score: 69, date: "03.09" },
        { interviewId: 4, title: "JPA 면접", track: "BACKEND", score: 76, date: "03.12" },
        { interviewId: 5, title: "실전 모의 면접", track: "BACKEND", score: 82, date: "03.18" },
        { interviewId: 6, title: "운영체제 면접", track: "CS", score: 74, date: "03.19" },
        { interviewId: 7, title: "Spring Boot 심화", track: "SPRING", score: 79, date: "03.20" },
    ],
    historyItems: [
        {
            interviewId: 12,
            title: "실전 모의 면접 12",
            track: "BACKEND",
            status: "COMPLETED",
            score: 88,
            feedbackCount: 5,
            createdAt: "2026-03-19",
        },
        {
            interviewId: 11,
            title: "실전 모의 면접 11",
            track: "BACKEND",
            status: "COMPLETED",
            score: 84,
            feedbackCount: 5,
            createdAt: "2026-03-18",
        },
        {
            interviewId: 10,
            title: "JPA 면접 10",
            track: "BACKEND",
            status: "COMPLETED",
            score: 76,
            feedbackCount: 5,
            createdAt: "2026-03-17",
        },
        {
            interviewId: 9,
            title: "CS 기본 면접 9",
            track: "CS",
            status: "COMPLETED",
            score: 69,
            feedbackCount: 5,
            createdAt: "2026-03-16",
        },
        {
            interviewId: 8,
            title: "Spring 심화 면접 8",
            track: "SPRING",
            status: "IN_PROGRESS",
            feedbackCount: 3,
            createdAt: "2026-03-15",
        },
        {
            interviewId: 7,
            title: "백엔드 기술 면접 7",
            track: "BACKEND",
            status: "READY",
            feedbackCount: 0,
            createdAt: "2026-03-14",
        },
        {
            interviewId: 6,
            title: "백엔드 기술 면접 6",
            track: "BACKEND",
            status: "COMPLETED",
            score: 73,
            feedbackCount: 5,
            createdAt: "2026-03-13",
        },
        {
            interviewId: 5,
            title: "실전 모의 면접 5",
            track: "BACKEND",
            status: "COMPLETED",
            score: 82,
            feedbackCount: 5,
            createdAt: "2026-03-12",
        },
        {
            interviewId: 4,
            title: "JPA 면접 4",
            track: "BACKEND",
            status: "COMPLETED",
            score: 76,
            feedbackCount: 5,
            createdAt: "2026-03-11",
        },
        {
            interviewId: 3,
            title: "CS 기본 면접 3",
            track: "CS",
            status: "COMPLETED",
            score: 69,
            feedbackCount: 5,
            createdAt: "2026-03-10",
        },
        {
            interviewId: 2,
            title: "Spring 심화 면접 2",
            track: "SPRING",
            status: "IN_PROGRESS",
            feedbackCount: 3,
            createdAt: "2026-03-09",
        },
        {
            interviewId: 1,
            title: "백엔드 기술 면접 1",
            track: "BACKEND",
            status: "READY",
            feedbackCount: 0,
            createdAt: "2026-03-08",
        },
    ],
};

const weakPointsByTrack: Record<TrackFilter, WeakPointItem[]> = {
    ALL: [
        { category: "운영체제", averageScore: 62 },
        { category: "네트워크", averageScore: 68 },
        { category: "데이터베이스", averageScore: 71 },
    ],
    BACKEND: [
        { category: "트랜잭션", averageScore: 66 },
        { category: "JPA", averageScore: 72 },
        { category: "API 설계", averageScore: 74 },
    ],
    CS: [
        { category: "운영체제", averageScore: 62 },
        { category: "네트워크", averageScore: 67 },
        { category: "자료구조", averageScore: 73 },
    ],
    SPRING: [
        { category: "AOP", averageScore: 65 },
        { category: "시큐리티", averageScore: 69 },
        { category: "빈 생명주기", averageScore: 75 },
    ],
};

const ITEMS_PER_PAGE = 5;

const TRACK_OPTIONS: { label: string; value: TrackFilter }[] = [
    { label: "전체", value: "ALL" },
    { label: "백엔드", value: "BACKEND" },
    { label: "CS", value: "CS" },
    { label: "스프링", value: "SPRING" },
];

function CustomScoreTooltip({
                                active,
                                payload,
                                label,
                            }: {
    active?: boolean;
    payload?: Array<{ value: number; payload: ScoreHistoryItem }>;
    label?: string;
}) {
    if (!active || !payload || payload.length === 0) {
        return null;
    }

    const item = payload[0].payload;
    const score = payload[0].value;

    return (
        <div className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white shadow-lg">
            <div className="font-medium">날짜: {label}</div>
            <div className="mt-1">점수: {score}점</div>
            <div className="mt-1 text-xs text-slate-300">{item.title}</div>
            <div className="mt-1 text-xs text-slate-400">{item.track}</div>
        </div>
    );
}

const getStatusMeta = (status: HistoryItem["status"]) => {
    switch (status) {
        case "COMPLETED":
            return {
                label: "완료",
                className:
                    "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400 dark:ring-emerald-400/20",
            };
        case "IN_PROGRESS":
            return {
                label: "진행중",
                className:
                    "bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20 dark:text-blue-400 dark:ring-blue-400/20",
            };
        case "READY":
        default:
            return {
                label: "준비",
                className:
                    "bg-slate-500/10 text-slate-600 ring-1 ring-slate-500/20 dark:text-slate-300 dark:ring-slate-400/20",
            };
    }
};

const getScoreMeta = (score?: number) => {
    if (score == null) {
        return {
            label: "-",
            className:
                "bg-slate-500/10 text-slate-500 ring-1 ring-slate-500/20 dark:text-slate-300 dark:ring-slate-400/20",
        };
    }

    if (score >= 85) {
        return {
            label: "우수",
            className:
                "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400 dark:ring-emerald-400/20",
        };
    }

    if (score >= 70) {
        return {
            label: "양호",
            className:
                "bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20 dark:text-blue-400 dark:ring-blue-400/20",
        };
    }

    return {
        label: "보완 필요",
        className:
            "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20 dark:text-amber-400 dark:ring-amber-400/20",
    };
};

function ChangeIndicator({ value }: { value: number }) {
    if (value > 0) {
        return (
            <div className="flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="h-4 w-4" />
                +{value}점
            </div>
        );
    }

    if (value < 0) {
        return (
            <div className="flex items-center gap-1 text-sm font-medium text-rose-600 dark:text-rose-400">
                <ArrowDownRight className="h-4 w-4" />
                {value}점
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            <Minus className="h-4 w-4" />
            변동 없음
        </div>
    );
}

function Pagination({
                        currentPage,
                        totalPages,
                        onPageChange,
                    }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}) {
    const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

    return (
        <div className="flex items-center justify-center gap-2 px-5 py-4">
            <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
            >
                <ChevronLeft className="h-4 w-4" />
            </button>

            {pages.map((page) => {
                const isActive = page === currentPage;

                return (
                    <button
                        key={page}
                        type="button"
                        onClick={() => onPageChange(page)}
                        className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition ${
                            isActive
                                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                                : "border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
                        }`}
                    >
                        {page}
                    </button>
                );
            })}

            <button
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
}

export default function Page(props: Partial<GrowthSectionProps>) {
    const { scoreHistory, historyItems } = {
        ...mockData,
        ...props,
    };

    const [selectedTrack, setSelectedTrack] = useState<TrackFilter>("ALL");
    const [currentPage, setCurrentPage] = useState(1);

    const filteredScoreHistory = useMemo(() => {
        if (selectedTrack === "ALL") return scoreHistory;
        return scoreHistory.filter((item) => item.track === selectedTrack);
    }, [scoreHistory, selectedTrack]);

    const filteredHistoryItems = useMemo(() => {
        if (selectedTrack === "ALL") return historyItems;
        return historyItems.filter((item) => item.track === selectedTrack);
    }, [historyItems, selectedTrack]);

    const completedItems = useMemo(
        () => filteredHistoryItems.filter((item) => item.status === "COMPLETED"),
        [filteredHistoryItems]
    );

    const averageScore = useMemo(() => {
        const scoredItems = completedItems.filter(
            (item): item is HistoryItem & { score: number } => typeof item.score === "number"
        );

        if (scoredItems.length === 0) return 0;

        const total = scoredItems.reduce((sum, item) => sum + item.score, 0);
        return Math.round(total / scoredItems.length);
    }, [completedItems]);

    const recentChange = useMemo(() => {
        const scoredItems = [...completedItems]
            .filter((item): item is HistoryItem & { score: number } => typeof item.score === "number")
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        if (scoredItems.length < 2) return 0;

        const last = scoredItems[scoredItems.length - 1].score;
        const prev = scoredItems[scoredItems.length - 2].score;

        return last - prev;
    }, [completedItems]);

    const completedCount = completedItems.length;
    const weakPoints = weakPointsByTrack[selectedTrack];

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedTrack]);

    const totalPages = Math.max(1, Math.ceil(filteredHistoryItems.length / ITEMS_PER_PAGE));

    const pagedHistoryItems = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredHistoryItems.slice(startIndex, endIndex);
    }, [currentPage, filteredHistoryItems]);

    return (
        <section className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                        답변 히스토리 + 성장 추적
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        최근 면접 결과와 점수 흐름, 약점 영역을 한 번에 확인할 수 있습니다.
                    </p>
                </div>

                <div className="w-full md:w-56">
                    <label
                        htmlFor="track-filter"
                        className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300"
                    >
                        트랙 선택
                    </label>
                    <select
                        id="track-filter"
                        value={selectedTrack}
                        onChange={(e) => setSelectedTrack(e.target.value as TrackFilter)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-800"
                    >
                        {TRACK_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500 dark:text-slate-400">평균 점수</span>
                        <Target className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="mt-3 flex items-end gap-2">
                        <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                            {averageScore}
                        </span>
                        <span className="pb-1 text-sm text-slate-500 dark:text-slate-400">/ 100</span>
                    </div>
                    <div className="mt-3">
                        <ChangeIndicator value={recentChange} />
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500 dark:text-slate-400">완료한 면접</span>
                        <MessageSquareText className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="mt-3 text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {completedCount}회
                    </div>
                    <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                        {selectedTrack === "ALL"
                            ? "전체 면접 결과를 기준으로 성장 추이를 계산합니다."
                            : `${TRACK_OPTIONS.find((option) => option.value === selectedTrack)?.label} 기준으로 성장 추이를 계산합니다.`}
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500 dark:text-slate-400">보완 우선 영역</span>
                        <TriangleAlert className="h-4 w-4 text-slate-400" />
                    </div>

                    <div className="mt-3 space-y-2">
                        {weakPoints.slice(0, 2).map((item) => (
                            <div key={item.category} className="flex items-center justify-between text-sm">
                                <span className="text-slate-700 dark:text-slate-300">{item.category}</span>
                                <span className="font-medium text-amber-600 dark:text-amber-400">
                                    {item.averageScore}점
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                            최근 점수 추이
                        </h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {selectedTrack === "ALL"
                                ? "전체 면접 점수 흐름을 빠르게 확인할 수 있습니다."
                                : `${TRACK_OPTIONS.find((option) => option.value === selectedTrack)?.label} 점수 흐름을 빠르게 확인할 수 있습니다.`}
                        </p>
                    </div>
                    <TrendingUp className="h-5 w-5 text-slate-400" />
                </div>

                <div className="mt-6 h-72">
                    {filteredScoreHistory.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={filteredScoreHistory}
                                margin={{ top: 10, right: 12, left: -20, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.25)" />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                                />
                                <Tooltip content={<CustomScoreTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#0f172a"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: "#0f172a" }}
                                    activeDot={{ r: 6, fill: "#0f172a" }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                            선택한 트랙의 점수 데이터가 없습니다.
                        </div>
                    )}
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                    <div>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                            답변 히스토리
                        </h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            최근 응시 이력과 결과를 확인하고 상세 페이지로 이동할 수 있습니다.
                        </p>
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                        총 {filteredHistoryItems.length}건
                    </span>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                    {pagedHistoryItems.length > 0 ? (
                        pagedHistoryItems.map((item) => {
                            const statusMeta = getStatusMeta(item.status);
                            const scoreMeta = getScoreMeta(item.score);

                            return (
                                <Link
                                    key={item.interviewId}
                                    href={`/interview/result/${item.interviewId}`}
                                    className="block px-5 py-4 transition hover:bg-slate-50 dark:hover:bg-slate-900/60"
                                >
                                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h4 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                    {item.title}
                                                </h4>
                                                <span className="rounded-full px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-300 dark:text-slate-300 dark:ring-slate-700">
                                                    {TRACK_OPTIONS.find((option) => option.value === item.track)?.label}
                                                </span>
                                                <span
                                                    className={`rounded-full px-2 py-1 text-xs font-medium ${statusMeta.className}`}
                                                >
                                                    {statusMeta.label}
                                                </span>
                                            </div>

                                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                                                <span>{item.createdAt}</span>
                                                <span>피드백 {item.feedbackCount}개</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                                    {item.score ?? "-"}
                                                    {item.score != null ? "점" : ""}
                                                </div>
                                                <div
                                                    className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-medium ${scoreMeta.className}`}
                                                >
                                                    {scoreMeta.label}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <div className="px-5 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                            선택한 트랙의 히스토리가 없습니다.
                        </div>
                    )}
                </div>

                {filteredHistoryItems.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>
        </section>
    );
}
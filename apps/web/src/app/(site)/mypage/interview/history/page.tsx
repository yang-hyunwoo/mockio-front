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
    BadgeCheck,
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
import { InterviewHistoryApi } from "@/lib/api/mypage/InterviewHistoryApi";
import {
    GrowthSectionProps,
    HistoryItem,
} from "@mockio/shared/src/api/mypage/InterviewHistoryResponse";
import { TRACKALL, TrackAll } from "@mockio/shared/src/api/mypage/MyPageEnum";
import { useAuthStore } from "@/store/authStore";

type ChartItem = {
    interviewId: number;
    title: string;
    trackCode: string;
    trackLabel: string;
    score: number;
    date: string;
    endedAt: string;
};

type WeakPointItem = {
    label: string;
    message: string;
    averageScore: number;
};

const emptyData: GrowthSectionProps = {
    scoreSection: {
        scoreHistory: [],
    },
    historySection: {
        historyItems: [],
    },
    weakPoints: {
        weakPointList: [],
    },
    number: 0,
    totalPages: 0,
    totalElements: 0,
};

function formatChartDate(value: string) {
    if (!value) return "-";
    if (value.includes(".")) return value;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${month}.${day}`;
}

function formatDisplayDate(value: string) {
    if (!value) return "-";
    if (value.includes(".") || value.includes("-")) return value;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("ko-KR");
}

function CustomScoreTooltip({
                                active,
                                payload,
                                label,
                            }: {
    active?: boolean;
    payload?: Array<{ value: number; payload: ChartItem }>;
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
            <div className="mt-1 text-xs text-slate-400">{item.trackLabel}</div>
        </div>
    );
}

const getStatusMeta = (item: HistoryItem) => {
    const statusCode = item.status?.code;
    const endReasonCode = item.endReason?.code;
    const isUserExit = endReasonCode === "USER_EXIT";

    switch (statusCode) {
        case "ENDED":
            if (isUserExit) {
                return {
                    label: "중도 종료",
                    badgeClass:
                        "bg-amber-500/12 text-amber-600 ring-1 ring-amber-500/20 dark:text-amber-400 dark:ring-amber-400/20",
                    buttonHref: `/interview/history/${item.interviewId}`,
                    icon: <TriangleAlert className="h-4 w-4" />,
                };
            }

            return {
                label: "완료",
                badgeClass:
                    "bg-emerald-500/12 text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400 dark:ring-emerald-400/20",
                buttonHref: `/interview/history/${item.interviewId}`,
                icon: <BadgeCheck className="h-4 w-4" />,
            };

        default:
            return {
                label: "알 수 없음",
                badgeClass:
                    "bg-slate-500/10 text-slate-500 ring-1 ring-slate-500/20",
                icon: null,
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

export default function Page() {
    const accessToken = useAuthStore((s) => s.accessToken);
    const isInitialized = useAuthStore((s) => s.isInitialized);
    const isAuth = !!accessToken;

    const [data, setData] = useState<GrowthSectionProps>(emptyData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTrack, setSelectedTrack] = useState<TrackAll>("ALL");
    const [page, setPage] = useState(0);

    useEffect(() => {
        if (!isInitialized) {
            return;
        }

        if (!isAuth) {
            setLoading(false);
            setError("로그인 후 이용할 수 있습니다.");
            setData(emptyData);
            return;
        }

        let cancelled = false;

        const fetchInterviewHistory = async () => {
            try {
                setLoading(true);
                setError(null);

                const track = selectedTrack === "ALL" ? undefined : selectedTrack;
                const result = await InterviewHistoryApi(page, track);

                if (cancelled) return;
                setData(result ?? emptyData);
            } catch (e) {
                if (cancelled) return;

                console.error(e);
                setError("면접 히스토리를 불러오지 못했습니다.");
                setData(emptyData);
            } finally {
                if (cancelled) return;
                setLoading(false);
            }
        };

        fetchInterviewHistory();

        return () => {
            cancelled = true;
        };
    }, [isInitialized, isAuth, page, selectedTrack]);

    const handleTrackChange = (value: TrackAll) => {
        setPage(0);
        setSelectedTrack(value);
    };

    const safeScoreItems = Array.isArray(data.scoreSection?.scoreHistory)
        ? data.scoreSection.scoreHistory
        : [];

    const safeHistoryItems = Array.isArray(data.historySection?.historyItems)
        ? data.historySection.historyItems
        : [];

    const weakPointList: WeakPointItem[] = Array.isArray(data.weakPoints?.weakPointList)
        ? data.weakPoints.weakPointList
        : [];

    const chartData = useMemo<ChartItem[]>(() => {
        return safeScoreItems.map((item) => ({
            interviewId: item.interviewId,
            title: item.title,
            trackCode: item.track.code,
            trackLabel: item.track.label,
            score: item.score,
            endedAt: item.endedAt,
            date: formatChartDate(item.endedAt),
        }));
    }, [safeScoreItems]);

    const completedItems = useMemo(
        () =>
            safeHistoryItems.filter(
                (item) =>
                    item.endReason?.code === "COMPLETED" &&
                    item.status?.code === "ENDED"
            ),
        [safeHistoryItems]
    );

    const averageScore = useMemo(() => {
        const scoredItems = completedItems.filter(
            (item): item is (typeof completedItems)[number] & { score: number } =>
                typeof item.score === "number"
        );

        if (scoredItems.length === 0) return 0;

        const total = scoredItems.reduce((sum, item) => sum + item.score, 0);
        return Math.round(total / scoredItems.length);
    }, [completedItems]);

    const recentChange = useMemo(() => {
        const scoredItems = [...completedItems]
            .filter(
                (item): item is (typeof completedItems)[number] & { score: number } =>
                    typeof item.score === "number"
            )
            .sort(
                (a, b) =>
                    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );

        if (scoredItems.length < 2) return 0;

        const last = scoredItems[scoredItems.length - 1].score;
        const prev = scoredItems[scoredItems.length - 2].score;

        return last - prev;
    }, [completedItems]);

    const completedCount = completedItems.length;
    const currentPage = data.number + 1;
    const totalPages = Math.max(1, data.totalPages || 1);

    if (!isInitialized || loading) {
        return (
            <section className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                    면접 히스토리를 불러오는 중입니다.
                </div>
            </section>
        );
    }

    if (!isAuth) {
        return (
            <section className="space-y-6">
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center text-sm text-amber-700 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
                    로그인 후 이용할 수 있습니다.
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="space-y-6">
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-sm text-rose-600 shadow-sm dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
                    {error}
                </div>
            </section>
        );
    }

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
                        면접 유형
                    </label>
                    <select
                        id="track-filter"
                        value={selectedTrack}
                        onChange={(e) =>
                            handleTrackChange(e.target.value as TrackAll)
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-800"
                    >
                        {TRACKALL.map((option) => (
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
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                            평균 점수
                        </span>
                        <Target className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="mt-3 flex items-end gap-2">
                        <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                            {averageScore}
                        </span>
                        <span className="pb-1 text-sm text-slate-500 dark:text-slate-400">
                            / 100
                        </span>
                    </div>
                    <div className="mt-3">
                        <ChangeIndicator value={recentChange} />
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                            완료한 면접
                        </span>
                        <MessageSquareText className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="mt-3 text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {completedCount}회
                    </div>
                    <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                        {selectedTrack === "ALL"
                            ? "전체 면접 결과를 기준으로 성장 추이를 계산합니다."
                            : `${
                                TRACKALL.find(
                                    (option) => option.value === selectedTrack
                                )?.label
                            } 기준으로 성장 추이를 계산합니다.`}
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                            답변 분석
                        </span>
                        <TriangleAlert className="h-4 w-4 text-slate-400" />
                    </div>

                    <div className="mt-3 space-y-3">
                        {weakPointList.length > 0 ? (
                            weakPointList.slice(0, 2).map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-xl border border-amber-200/60 bg-amber-50/60 p-3 dark:border-amber-900/40 dark:bg-amber-950/20"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                            {item.label}
                                        </span>
                                        <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                                            {item.averageScore}점
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm leading-5 text-slate-600 dark:text-slate-300">
                                        {item.message}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                                분석할 약점 데이터가 없습니다.
                            </div>
                        )}
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
                                : `${
                                    TRACKALL.find(
                                        (option) => option.value === selectedTrack
                                    )?.label
                                } 점수 흐름을 빠르게 확인할 수 있습니다.`}
                        </p>
                    </div>
                    <TrendingUp className="h-5 w-5 text-slate-400" />
                </div>

                <div className="mt-6 h-72">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={chartData}
                                margin={{ top: 10, right: 12, left: -20, bottom: 0 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="rgba(148, 163, 184, 0.25)"
                                />
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
                        총 {data.totalElements}건
                    </span>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                    {safeHistoryItems.length > 0 ? (
                        safeHistoryItems.map((item) => {
                            const statusMeta = getStatusMeta(item);
                            const scoreMeta = getScoreMeta(item.score);

                            return (
                                <Link
                                    key={item.interviewId}
                                    href={`/interview/history/${item.interviewId}`}
                                >
                                    <article className="px-5 py-4 transition hover:bg-slate-50 dark:hover:bg-slate-900/60">
                                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h4 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                        {item.title}
                                                    </h4>

                                                    <span className="rounded-full px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-300 dark:text-slate-300 dark:ring-slate-700">
                                                        {item.track.label}
                                                    </span>

                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.badgeClass}`}
                                                    >
                                                        {statusMeta.icon}
                                                        {statusMeta.label}
                                                    </span>
                                                </div>

                                                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                                                    <span>{formatDisplayDate(item.createdAt)}</span>
                                                    <span>문항 수 {item.questionCount}개</span>
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
                                    </article>
                                </Link>
                            );
                        })
                    ) : (
                        <div className="px-5 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                            선택한 트랙의 히스토리가 없습니다.
                        </div>
                    )}
                </div>

                {data.totalPages > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(nextPage) => {
                            if (nextPage < 1 || nextPage > totalPages) return;
                            setPage(nextPage - 1);
                        }}
                    />
                )}
            </div>
        </section>
    );
}

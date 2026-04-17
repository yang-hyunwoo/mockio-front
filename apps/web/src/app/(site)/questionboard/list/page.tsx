"use client";

import { useEffect, useMemo, useState } from "react";
import {ChevronLeft, ChevronRight, Eye} from "lucide-react";
import {
    questionBoardListApi,
    type PageDto,
    type QuestionBoardListItem,
} from "@/lib/api/questionboard/questionBoardListApi";
import { TRACKALL, TrackAll } from "@mockio/shared/src/api/mypage/MyPageEnum";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Pagination from "@/components/Common/Pagination";

type PaginationProps = {
    pageNumber: number;
    totalPages: number;
    onChange: (nextPage: number) => void;
    windowSize?: number;
};

type AppliedSearchParams = {
    keyword: string;
    track: TrackAll;
    scoreOnly: boolean;
};


export default function InterviewShareBoardPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const pageSize = 6;

    const initialKeyword = searchParams.get("keyword") ?? "";
    const initialTrack = (searchParams.get("track") as TrackAll) ?? "ALL";
    const initialScoreOnly = searchParams.get("scoreOnly") === "true";
    const initialPageNumber = Number(searchParams.get("page") ?? "0");

    const [keyword, setKeyword] = useState(initialKeyword);
    const [trackFilter, setTrackFilter] = useState<TrackAll>(initialTrack);
    const [scoreOnly, setScoreOnly] = useState(initialScoreOnly);
    const [pageNumber, setPageNumber] = useState(
        Number.isNaN(initialPageNumber) ? 0 : initialPageNumber
    );

    const [searchParamsState, setSearchParamsState] = useState<AppliedSearchParams>({
        keyword: initialKeyword,
        track: initialTrack,
        scoreOnly: initialScoreOnly,
    });

    const [data, setData] = useState<PageDto<QuestionBoardListItem>>({
        content: [],
        pageNumber: 0,
        pageSize,
        totalElements: 0,
        totalPages: 0,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getTrackLabel = (value: string) => {
        const found = TRACKALL.find((t) => t.value === value);
        return found ? found.label : value;
    };

    const buildListQueryString = (params: AppliedSearchParams, page: number) => {
        const qs = new URLSearchParams();

        if (params.keyword) qs.set("keyword", params.keyword);
        if (params.track && params.track !== "ALL") qs.set("track", params.track);
        if (params.scoreOnly) qs.set("scoreOnly", "true");
        if (page > 0) qs.set("page", String(page));

        return qs.toString();
    };

    const replaceListUrl = (params: AppliedSearchParams, page: number) => {
        const queryString = buildListQueryString(params, page);
        router.replace(queryString ? `${pathname}?${queryString}` : pathname);
    };

    const handleSearch = () => {
        const nextSearchParams = {
            keyword: keyword.trim(),
            track: trackFilter,
            scoreOnly,
        };

        setPageNumber(0);
        setSearchParamsState(nextSearchParams);
        replaceListUrl(nextSearchParams, 0);
    };

    const handleQuestionShare = () => {
        router.push("/questionboard/create");
    };

    const handleMoveDetail = (boardId: number) => {
        const queryString = buildListQueryString(searchParamsState, pageNumber);
        router.push(
            queryString
                ? `/questionboard/detail/${boardId}?${queryString}`
                : `/questionboard/detail/${boardId}`
        );
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const result = await questionBoardListApi({
                    value: searchParamsState.keyword || undefined,
                    track: searchParamsState.track,
                    scoreVisible: searchParamsState.scoreOnly,
                    page: pageNumber,
                    size: pageSize,
                });

                setData(result);
            } catch (e) {
                console.error(e);
                setError("게시글 목록을 불러오지 못했습니다.");
            } finally {
                setLoading(false);
            }
        };

        void fetchData();
    }, [searchParamsState, pageNumber]);

    const formatDate = (value: string) => {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleDateString("ko-KR");
    };

    const handlePageChange = (nextPage: number) => {
        setPageNumber(nextPage);
        replaceListUrl(searchParamsState, nextPage);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
                <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
                            INTERVIEW SHARE BOARD
                        </p>
                        <h1 className="text-4xl font-bold tracking-tight">면접 답변 공유 게시판</h1>
                        <p className="mt-3 text-base text-slate-600">
                            다른 사용자의 면접 질문과 답변, 그리고 공유된 피드백 정보를 확인할 수 있습니다.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleQuestionShare}
                        className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                    >
                        답변 공유하기
                    </button>
                </div>

                <section className="mb-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr_0.7fr_auto]">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">검색</label>
                            <input
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleSearch();
                                    }
                                }}
                                placeholder="제목, 질문, 답변, 태그, 작성자 검색"
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">트랙</label>
                            <select
                                value={trackFilter}
                                onChange={(e) => setTrackFilter(e.target.value as TrackAll)}
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                            >
                                {TRACKALL.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">옵션</label>
                            <button
                                type="button"
                                onClick={() => setScoreOnly((prev) => !prev)}
                                className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                                    scoreOnly
                                        ? "border border-blue-500 bg-blue-50 text-blue-700"
                                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                }`}
                            >
                                점수 공개 글만 보기
                            </button>
                        </div>

                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={handleSearch}
                                className="h-[46px] shrink-0 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                                검색
                            </button>
                        </div>
                    </div>
                </section>

                <div className="mb-5 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        총 <span className="font-semibold text-slate-800">{data.totalElements}</span>개의 게시글
                    </p>
                    <p className="text-sm text-slate-500">
                        {data.totalElements > 0
                            ? `${data.pageNumber + 1} / ${data.totalPages} 페이지`
                            : "0 / 0 페이지"}
                    </p>
                </div>

                {loading ? (
                    <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                        <p className="text-base font-medium text-slate-800">게시글을 불러오는 중입니다.</p>
                    </div>
                ) : error ? (
                    <div className="rounded-[28px] border border-red-200 bg-white px-6 py-16 text-center shadow-sm">
                        <p className="text-base font-medium text-red-600">{error}</p>
                    </div>
                ) : data.content.length === 0 ? (
                    <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                        <p className="text-base font-medium text-slate-800">조건에 맞는 게시글이 없습니다.</p>
                        <p className="mt-2 text-sm text-slate-500">검색어 또는 필터를 변경해 보세요.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-5">
                            {data.content.map((item) => (
                                <button
                                    key={`${item.boardId}-${item.boardItemId}`}
                                    type="button"
                                    onClick={() => handleMoveDetail(item.boardId)}
                                    className="w-full rounded-[28px] border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md"
                                >
                                    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                        <div>
                                            <div className="mb-3 flex flex-wrap items-center gap-2">
                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                                    {getTrackLabel(item.track)}
                                                </span>

                                                {item.scoreVisible && item.score !== null ? (
                                                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                                        점수 {item.score}점 공개
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                                                        점수 비공개
                                                    </span>
                                                )}

                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                        item.feedbackVisible
                                                            ? "bg-emerald-50 text-emerald-700"
                                                            : "bg-slate-100 text-slate-500"
                                                    }`}
                                                >
                                                    {item.feedbackVisible ? "AI 피드백 공개" : "AI 피드백 비공개"}
                                                </span>
                                            </div>

                                            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                                                {item.title}
                                            </h2>
                                        </div>

                                        <div className="shrink-0 text-sm text-slate-500">
                                            <p>{item.nickname}</p>
                                            <p className="mt-1">{formatDate(item.createdAt)}</p>
                                            <span className="inline-flex items-center gap-2">
                                                    <Eye className="h-4 w-4"/>
                                                         {item.readCount}
                                                </span>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 lg:grid-cols-2">
                                        <div className="rounded-2xl bg-slate-50 p-5">
                                            <p className="mb-2 text-sm font-semibold text-slate-500">질문</p>
                                            <p className="line-clamp-3 text-base font-semibold leading-7 text-slate-900">
                                                {item.question}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl bg-slate-50 p-5">
                                            <p className="mb-2 text-sm font-semibold text-slate-500">답변 미리보기</p>
                                            <p className="line-clamp-4 text-sm leading-7 text-slate-700">
                                                {item.answerPreview}
                                            </p>
                                        </div>
                                    </div>

                                    {item.tags.length > 0 && (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {item.tags.map((tag, index) => (
                                                <span
                                                    key={`${item.boardId}-${tag}-${index}`}
                                                    className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="mt-8">
                            <Pagination
                                pageNumber={data.pageNumber}
                                totalPages={data.totalPages}
                                onChange={handlePageChange}
                                windowSize={5}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
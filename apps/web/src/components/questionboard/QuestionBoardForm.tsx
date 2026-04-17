"use client";

import { useEffect, useMemo, useState } from "react";
import {
    useRouter,
    useSearchParams,
} from "next/navigation";
import {
    CreateSettingResponse,
    interviewQuestionAnswerApi,
    QuestionAnswerItem,
} from "@/lib/api/questionboard/InterviewQuestionAnswerApi";
import {
    interviewQuestionAnswerSaveApi,
} from "@/lib/api/questionboard/InterviewQuestionAnswerSaveApi";
import {
    interviewQuestionAnswerUpdateApi
} from "@/lib/api/questionboard/InterviewQuestionAnswerUpdateApi";
import { useAuthStore } from "@/store/authStore";
import {questionBoardDetailExistApi} from "@/lib/api/questionboard/questionBoardDetailExistApi";
import {ApiErrorResponse} from "@mockio/shared/src/api/ApiErrorResponse";
import {interviewQuestionAnswerDeleteApi} from "@/lib/api/questionboard/InterviewQuestionAnswerDeleteApi";

type Props = {
    mode: "create" | "edit";
    boardId?: number;
};

type OpenOption = true | false;


const isApiErrorResponse = (error: unknown): error is ApiErrorResponse => {
    return (
        typeof error === "object" &&
        error !== null &&
        "httpCode" in error &&
        "message" in error
    );
};

const parseNumberParam = (value: string | null) => {
    if (!value) return null;

    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
};

export default function QuestionBoardForm({ mode, boardId }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const requestedInterviewId = parseNumberParam(searchParams.get("interviewId"));
    const requestedQuestionId = parseNumberParam(searchParams.get("questionId"));

    const accessToken = useAuthStore((s) => s.accessToken);
    const isInitialized = useAuthStore((s) => s.isInitialized);

    const [setting, setSetting] = useState<CreateSettingResponse>({
        interviews: [],
        selectedInterviewId: null,
        selectedQuestionId: null,
        questionAnswers: [],
    });

    const [selectedInterviewId, setSelectedInterviewId] = useState<number | null>(null);
    const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);

    const [showInterviewList, setShowInterviewList] = useState(false);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [scoreVisible, setScoreVisible] = useState<OpenOption>(true);
    const [aiFeedbackVisible, setAiFeedbackVisible] = useState<OpenOption>(true);

    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");

    const [isLoading, setIsLoading] = useState(true);

    const selectedInterview = useMemo(() => {
        return (
            setting.interviews.find((interview) => interview.interviewId === selectedInterviewId) ?? null
        );
    }, [setting.interviews, selectedInterviewId]);

    const selectedQuestion = useMemo(() => {
        return (
            setting.questionAnswers.find((item) => item.questionId === selectedQuestionId) ?? null
        );
    }, [setting.questionAnswers, selectedQuestionId]);

    const getQuestionTypeStyle = (seq: number) => {
        if (seq % 10 === 0) {
            return {
                label: "기본 질문",
                className: "bg-blue-50 text-blue-700",
            };
        }
        if (seq % 10 === 5) {
            return {
                label: "추가 질문",
                className: "bg-emerald-50 text-emerald-700",
            };
        }
        return {
            label: "심화 질문",
            className: "bg-purple-50 text-purple-700",
        };
    };

    const applyQuestionToTitle = (
        questionAnswers: QuestionAnswerItem[],
        questionId: number | null
    ) => {
        if (!questionId) return;

        const foundQuestion =
            questionAnswers.find((item) => item.questionId === questionId) ?? null;

        if (foundQuestion?.question) {
            setTitle(`${foundQuestion.question.slice(0, 24)} 답변 공유합니다`);
        }
    };

    useEffect(() => {
        if (!isInitialized) return;

        if (!accessToken) {
            alert("로그인 후 사용 가능 합니다.");
            router.replace("/login");
            return;
        }

        const fetchInterviewSetting = async () => {
            try {
                setIsLoading(true);

                if (mode === "create") {
                    const result: CreateSettingResponse = await interviewQuestionAnswerApi(
                        requestedInterviewId ?? undefined
                    );

                    setSetting(result);

                    const nextInterviewId =
                        requestedInterviewId ?? result.selectedInterviewId;

                    const fallbackQuestionId =
                        result.selectedQuestionId ?? result.questionAnswers[0]?.questionId ?? null;

                    const nextQuestionId =
                        requestedQuestionId !== null &&
                        result.questionAnswers.some(
                            (item) => item.questionId === requestedQuestionId
                        )
                            ? requestedQuestionId
                            : fallbackQuestionId;

                    setSelectedInterviewId(nextInterviewId);
                    setSelectedQuestionId(nextQuestionId);

                    applyQuestionToTitle(result.questionAnswers, nextQuestionId);
                }

                if (mode === "edit") {
                    // 수정 API 붙일 때 구현
                    if (!boardId || Number.isNaN(boardId)) {
                        router.push("/questionboard/list");
                        return;
                    }
                    const interviewShareDetailResponse = await questionBoardDetailExistApi(boardId);

                    const result: CreateSettingResponse = await interviewQuestionAnswerApi(
                        interviewShareDetailResponse.selectedInterviewId
                    );
                    setSetting(result);

                    setSelectedInterviewId(interviewShareDetailResponse.selectedInterviewId);
                    setSelectedQuestionId(interviewShareDetailResponse.selectedQuestionId);
                    setTitle(interviewShareDetailResponse.title);
                    setContent(interviewShareDetailResponse.content ?? "");
                    setScoreVisible(interviewShareDetailResponse.scoreVisible);
                    setAiFeedbackVisible(interviewShareDetailResponse.aiFeedbackVisible);
                    setTags(
                        (interviewShareDetailResponse.tags ?? []).map((tag) =>
                            tag.startsWith("#") ? tag : `#${tag}`
                        )
                    );
                }
            } catch (error) {
                if (isApiErrorResponse(error)) {
                    if (error.httpCode === 403 || error.httpCode === 404) {
                        alert(error.message);
                        router.push("/questionboard/list");
                        return;
                    }
                }

                console.error(
                    mode === "create"
                        ? "면접 공유 등록 데이터 조회 실패"
                        : "면접 공유 수정 데이터 조회 실패",
                    error
                );
            } finally {
                setIsLoading(false);
            }
        };

        void fetchInterviewSetting();
    }, [
        isInitialized,
        accessToken,
        router,
        mode,
        boardId,
        requestedInterviewId,
        requestedQuestionId,
    ]);

    useEffect(() => {
        setTagInput("");
    }, [selectedQuestionId]);

    const handleSelectInterview = async (interviewId: number) => {
        try {
            setIsLoading(true);

            const result: CreateSettingResponse = await interviewQuestionAnswerApi(interviewId);

            setSetting(result);
            setSelectedInterviewId(result.selectedInterviewId);

            const fallbackQuestionId =
                result.selectedQuestionId ?? result.questionAnswers[0]?.questionId ?? null;

            setSelectedQuestionId(fallbackQuestionId);
            setShowInterviewList(false);

            applyQuestionToTitle(result.questionAnswers, fallbackQuestionId);
        } catch (error) {
            console.error("면접별 질문 목록 조회 실패", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectQuestion = (question: QuestionAnswerItem) => {
        setSelectedQuestionId(question.questionId);
        setTitle(`${question.question.slice(0, 24)} 답변 공유합니다`);
    };

    const normalizeTag = (value: string) => {
        const trimmed = value.trim().replace(/\s+/g, "");
        if (!trimmed) return "";
        return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
    };

    const handleAddTag = () => {
        const newTag = normalizeTag(tagInput);

        if (!newTag) return;
        if (tags.includes(newTag)) {
            setTagInput("");
            return;
        }

        setTags((prev) => [...prev, newTag]);
        setTagInput("");
    };

    const handleRemoveTag = (targetTag: string) => {
        setTags((prev) => prev.filter((tag) => tag !== targetTag));
    };

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            handleAddTag();
        }

        if (e.key === "Backspace" && !tagInput && tags.length > 0) {
            setTags((prev) => prev.slice(0, -1));
        }
    };

    const handleDelete = async () => {
        if (!boardId || Number.isNaN(boardId)) {
            router.push("/questionboard/list");
            return;
        }

        if(confirm("게시글을 삭제 하시겠습니까? \n 삭제시 복구가 불가능 합니다.")) {
            const payload = {
                boardId,
            }
            await interviewQuestionAnswerDeleteApi(payload);
            alert("게시글이 삭제되었습니다.");
            router.push("/questionboard/list");
        }

    }

    const handleSubmit = async () => {
        if (!selectedInterviewId || !selectedQuestionId) {
            alert("면접과 질문을 선택해 주세요.");
            return;
        }
        if(title.trim().length == 0){
            alert("게시판 제목을 입력해주세요.");
            return;
        }

        try {
            if (mode === "create") {
                const payload = {
                    interview: [
                        {
                            interviewId: selectedInterviewId,
                            questionId: selectedQuestionId,
                            scoreVisible,
                            aiFeedbackVisible,
                            tags: tags.map((tag) => tag.replace(/^#/, "")),
                        },
                    ],
                    title,
                    content,
                };
                const interviewQuestionAnserSaveResponse = await interviewQuestionAnswerSaveApi(payload);
                alert("게시글이 등록되었습니다.");
                router.push(`/questionboard/detail/${interviewQuestionAnserSaveResponse.id}`);
            } else {

                if (!boardId || Number.isNaN(boardId)) {
                    router.push("/questionboard/list");
                    return;
                }

                const payload = {
                    boardId,
                    title,
                    content,
                    scoreVisible,
                    aiFeedbackVisible,
                    tags: tags.map((tag) => tag.replace(/^#/, ""))
                }
                await interviewQuestionAnswerUpdateApi(payload);
                alert("게시글이 수정되었습니다.");
                router.push(`/questionboard/detail/${boardId}`);
            }


        } catch (error) {
            console.error(
                mode === "create" ? "게시글 등록 실패" : "게시글 수정 실패",
                error
            );
            alert(
                mode === "create"
                    ? "게시글 등록에 실패했습니다."
                    : "게시글 수정에 실패했습니다."
            );
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-900">
                <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
                    <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
                        <p className="text-base font-medium text-slate-600">
                            {mode === "create"
                                ? "면접 공유 데이터를 불러오는 중입니다."
                                : "게시글 수정 데이터를 불러오는 중입니다."}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (setting.interviews.length === 0 && mode === "create") {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-900">
                <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
                    <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
                        <p className="text-base font-medium text-slate-800">
                            공유할 수 있는 면접 내역이 없습니다.
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                            먼저 면접을 진행한 뒤 다시 시도해 주세요.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
                <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
                            INTERVIEW SHARE
                        </p>
                        <h1 className="text-4xl font-bold tracking-tight">
                            {mode === "create" ? "면접 답변 공유하기" : "면접 답변 수정하기"}
                        </h1>
                        <p className="mt-3 text-base text-slate-600">
                            내 면접 답변 중 공유할 질문을 선택하고, 공개 범위를 설정해 게시글로 등록할 수 있습니다.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                        <p className="text-sm text-slate-500">공유 단위</p>
                        <p className="mt-1 text-lg font-semibold">질문 1개 + 답변 1개</p>
                    </div>
                </div>

                <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
                    <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-6 py-5">
                            <h2 className="text-2xl font-semibold">1. 공유할 답변 선택</h2>
                                {mode === "edit" && (
                                    <p className="text-xs text-slate-500 mt-2">
                                        * 질문과 면접은 수정할 수 없습니다.
                                    </p>
                                )}
                        </div>

                        <div className="space-y-6 px-6 py-6">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    면접 선택
                                </label>

                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-lg font-semibold">
                                                {selectedInterview?.interviewTitle ?? "선택된 면접 없음"}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-500">
                                                생성일 {selectedInterview?.createdAt ?? "-"}
                                            </p>
                                        </div>
                                        {mode === "create" && (
                                            <button
                                                type="button"
                                                onClick={() => setShowInterviewList((prev) => !prev)}
                                                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white"
                                            >
                                                {showInterviewList ? "닫기" : "다른 면접 선택"}
                                            </button>
                                        )}
                                    </div>

                                    {showInterviewList && (
                                        <div className="mt-4 border-t border-slate-200 pt-4">
                                            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                                                {setting.interviews.map((interview) => {
                                                    const active =
                                                        interview.interviewId === selectedInterviewId;

                                                    return (
                                                        <button
                                                            key={interview.interviewId}
                                                            type="button"
                                                            onClick={() =>
                                                                void handleSelectInterview(interview.interviewId)
                                                            }
                                                            className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                                                                active
                                                                    ? "border-blue-500 bg-blue-50"
                                                                    : "border-slate-200 bg-white hover:bg-slate-50"
                                                            }`}
                                                        >
                                                            <p className="font-semibold">
                                                                {interview.interviewTitle}
                                                            </p>
                                                            <p className="mt-1 text-sm text-slate-500">
                                                                {interview.createdAt}
                                                            </p>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <div className="mb-3 flex items-center justify-between">
                                    <label className="block text-sm font-semibold text-slate-700">
                                        질문 선택
                                    </label>
                                    <span className="text-sm text-slate-500">
                                        총 {setting.questionAnswers.length}개
                                    </span>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                    <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
                                        {setting.questionAnswers.map((item) => {
                                            const active = item.questionId === selectedQuestionId;
                                            const type = getQuestionTypeStyle(item.seq);

                                            return (
                                                <button
                                                    key={item.questionId}
                                                    type="button"
                                                    onClick={() => mode === "create" && handleSelectQuestion(item)}
                                                    className={`w-full rounded-2xl border p-4 text-left transition ${
                                                        active
                                                            ? "border-blue-500 bg-blue-50 shadow-sm"
                                                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                                    }`}
                                                >
                                                    <div className="mb-3 flex flex-wrap items-center gap-2">
                                                        <span
                                                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${type.className}`}
                                                        >
                                                            {type.label}
                                                        </span>

                                                        {item.score != null && (
                                                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                                                {item.score}점
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="line-clamp-2 text-base font-semibold leading-7 text-slate-900">
                                                        {item.question}
                                                    </p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-6 py-5">
                            <h2 className="text-2xl font-semibold">2. 게시글 작성</h2>
                        </div>

                        <div className="space-y-6 px-6 py-6">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    게시글 제목
                                </label>
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-slate-400"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    게시글 내용
                                </label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="이 답변에 대한 설명이나 추가 코멘트를 작성해 주세요."
                                    className="w-full min-h-[160px] rounded-2xl border border-slate-200 px-4 py-3"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    공유 질문
                                </label>
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                    <div className="mb-3 flex flex-wrap items-center gap-2">
                                        {selectedQuestion?.score != null && (
                                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                                {selectedQuestion.score}점
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-lg font-semibold leading-8">
                                        {selectedQuestion?.question ?? "질문을 선택해 주세요."}
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-5 lg:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        내 답변
                                    </label>
                                    <div className="min-h-[220px] rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
                                        {selectedQuestion?.answer ?? ""}
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        AI 피드백 요약
                                    </label>
                                    <div className="min-h-[220px] rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
                                        {selectedQuestion?.aiFeedbackText ?? "AI 피드백이 없습니다."}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    태그
                                </label>

                                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
                                            >
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTag(tag)}
                                                    className="text-slate-400 transition hover:text-slate-700"
                                                    aria-label={`${tag} 삭제`}
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}

                                        <input
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={handleTagKeyDown}
                                            placeholder="태그 입력 후 Enter"
                                            className="min-w-[160px] flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-slate-400"
                                        />

                                        <button
                                            type="button"
                                            onClick={handleAddTag}
                                            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                                        >
                                            추가
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-5 lg:grid-cols-2">
                                <div>
                                    <p className="mb-3 text-sm font-semibold text-slate-700">
                                        점수 공개 여부
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setScoreVisible(true)}
                                            className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                                                scoreVisible === true
                                                    ? "border border-blue-500 bg-blue-50 text-blue-700"
                                                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                                            }`}
                                        >
                                            공개
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setScoreVisible(false)}
                                            className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                                                scoreVisible === false
                                                    ? "border border-blue-500 bg-blue-50 text-blue-700"
                                                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                                            }`}
                                        >
                                            비공개
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <p className="mb-3 text-sm font-semibold text-slate-700">
                                        AI 피드백 공개 여부
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setAiFeedbackVisible(true)}
                                            className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                                                aiFeedbackVisible === true
                                                    ? "border border-blue-500 bg-blue-50 text-blue-700"
                                                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                                            }`}
                                        >
                                            공개
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setAiFeedbackVisible(false)}
                                            className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                                                aiFeedbackVisible === false
                                                    ? "border border-blue-500 bg-blue-50 text-blue-700"
                                                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                                            }`}
                                        >
                                            비공개
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                                {mode === "edit" && (
                                    <button
                                        onClick={handleDelete}
                                        type="button"
                                        className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                                    >
                                        삭제
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                                >
                                    {mode === "create" ? "게시글 등록" : "게시글 수정"}
                                </button>


                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
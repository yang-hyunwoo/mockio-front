"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
    ArrowLeft,
    CalendarDays,
    Eye,
    MessageSquare,
    User,
} from "lucide-react";
import {
    InterviewShareDetailResponse,
    questionBoardDetailApi,
} from "@/lib/api/questionboard/questionBoardDetailApi";
import Pagination from "@/components/Common/Pagination";
import { commentCreateApi } from "@/lib/api/comment/CommentCreateApi";
import {
    CommentItem,
    commentListApi,
    CommentPageDto,
} from "@/lib/api/comment/CommentListApi";
import {commentDeleteApi} from "@/lib/api/comment/CommentDeleteApi";
import {commentUpdateApi} from "@/lib/api/comment/CommentUpdateApi";
import {commentReplyCreateApi} from "@/lib/api/comment/CommentReplyCreateApi";
import {useAuthStore} from "@/store/authStore";

const getQuestionType = (seq: number) => {
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

export default function InterviewShareDetailPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const boardId = Number(params.id);
    const accessToken = useAuthStore((s) => s.accessToken);
    const [detail, setDetail] = useState<InterviewShareDetailResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isNotFound, setIsNotFound] = useState(false);

    const [commentInput, setCommentInput] = useState("");
    const [replyInputs, setReplyInputs] = useState<Record<number, string>>({});
    const [openReplyFormId, setOpenReplyFormId] = useState<number | null>(null);

    const [commentPage, setCommentPage] = useState<CommentPageDto | null>(null);
    const [isCommentLoading, setIsCommentLoading] = useState(false);

    const [commentPageNumber, setCommentPageNumber] = useState(0);
    const commentPageSize = 3;

    const [editCommentId, setEditCommentId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState("");

    const fetchComments = useCallback(
        async (page: number) => {
            if (!boardId || Number.isNaN(boardId)) return;

            try {
                setIsCommentLoading(true);

                const result = await commentListApi(
                    "QUESTION_BOARD",
                    boardId,
                    page,
                    commentPageSize
                );
                setCommentPage(result);
            } catch (error) {
                console.error("댓글 조회 실패", error);
                setCommentPage({
                    content: [],
                    pageNumber: page,
                    pageSize: commentPageSize,
                    totalElements: 0,
                    totalPages: 0,
                });
            } finally {
                setIsCommentLoading(false);
            }
        },
        [boardId]
    );

    useEffect(() => {
        if (!boardId || Number.isNaN(boardId)) {
            setIsLoading(false);
            setIsNotFound(true);
            return;
        }

        const fetchDetail = async () => {
            try {
                setIsLoading(true);
                setIsNotFound(false);

                const result = await questionBoardDetailApi(boardId);
                setDetail(result);
            } catch (error) {
                console.error("면접 공유 게시글 상세 조회 실패", error);
                setIsNotFound(true);
            } finally {
                setIsLoading(false);
            }
        };

        void fetchDetail();
    }, [boardId]);

    useEffect(() => {
        void fetchComments(commentPageNumber);
    }, [fetchComments, commentPageNumber]);

    const handleBack = () => {
        const qs = new URLSearchParams();

        const keyword = searchParams.get("keyword");
        const track = searchParams.get("track");
        const scoreOnly = searchParams.get("scoreOnly");
        const page = searchParams.get("page");

        if (keyword) qs.set("keyword", keyword);
        if (track) qs.set("track", track);
        if (scoreOnly) qs.set("scoreOnly", scoreOnly);
        if (page) qs.set("page", page);

        const queryString = qs.toString();

        router.push(
            queryString
                ? `/questionboard/list?${queryString}`
                : "/questionboard/list"
        );
    };

    const handleEdit = () => {
        router.push(`/questionboard/edit/${detail?.id}`);
    };

    const mergedTags = useMemo(() => {
        if (!detail?.interview?.length) return [];

        return Array.from(
            new Set(detail.interview.flatMap((item) => item.tags ?? []))
        );
    }, [detail]);

    const totalCommentCount = commentPage?.totalElements ?? 0;

    const handleCommentPageChange = (nextPage: number) => {
        setCommentPageNumber(nextPage);

        setTimeout(() => {
            const commentSection = document.getElementById("comment-section");
            commentSection?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 0);
    };

    const handleAddComment = async () => {
        //
        if (!accessToken) {
            alert("로그인 후 사용 가능 합니다.");
            return;
        }

        const value = commentInput.trim();
        if (!value) return;

        try {
            const payload = {
                boardType: "QUESTION_BOARD",
                boardId,
                content: value,
            };

            await commentCreateApi(payload);

            setCommentInput("");
            setCommentPageNumber(0);
            await fetchComments(0);
        } catch (error) {
            console.error("댓글 등록 실패", error);
        }
    };

    const handleOpenReplyForm = (commentId: number) => {
        setEditCommentId(null);
        setEditContent("");
        setOpenReplyFormId((prev) => (prev === commentId ? null : commentId));
    };

    const handleReplyInputChange = (commentId: number, value: string) => {
        setReplyInputs((prev) => ({
            ...prev,
            [commentId]: value,
        }));
    };

    const handleAddReply = async (commentId: number) => {
        const value = (replyInputs[commentId] ?? "").trim();
        if (!value) return;

        try {
            const payload = {
                parentId: commentId,
                content: value,
            };

            await commentReplyCreateApi(payload);

            setReplyInputs((prev) => ({
                ...prev,
                [commentId]: "",
            }));
            setOpenReplyFormId(null);

            await fetchComments(commentPageNumber);
        } catch (error) {
            console.error("답글 등록 실패", error);
        }
    };

    const handleOpenEditComment = (commentId: number, content: string) => {
        setOpenReplyFormId(null);
        setEditCommentId(commentId);
        setEditContent(content);
    };

    const handleCancelEditComment = () => {
        setEditCommentId(null);
        setEditContent("");
    };

    const handleUpdateComment = async (depth: number , parentId?: number) => {
        const value = editContent.trim();
        if (!value || editCommentId == null) return;

        try {
            const payload = {
                boardType: "QUESTION_BOARD",
                id  : editCommentId,
                depth :depth,
                parentId : parentId,
                content: editContent
            }
            await commentUpdateApi(payload);

            setEditCommentId(null);
            setEditContent("");
            await fetchComments(commentPageNumber);
        } catch (error) {
            console.error("댓글 수정 실패", error);
        }
    };

    const handleDeleteComment = async (commentId: number,depth: number , parentId?: number) => {
        const confirmed = window.confirm("댓글을 삭제하시겠습니까?");
        if (!confirmed) return;

        const payload = {
            boardType: "QUESTION_BOARD",
            id: commentId,
            depth : depth,
            parentId : parentId
        }

        try {
            await commentDeleteApi(payload);

            if (
                commentPage &&
                commentPage.content.length === 1 &&
                commentPage.pageNumber > 0
            ) {
                const prevPage = commentPage.pageNumber - 1;
                setCommentPageNumber(prevPage);
                await fetchComments(prevPage);
                return;
            }

            await fetchComments(commentPageNumber);
        } catch (error) {
            console.error("댓글 삭제 실패", error);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-900">
                <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
                    <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
                        <p className="text-base font-semibold text-slate-800">
                            게시글 정보를 불러오는 중입니다.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (isNotFound || !detail) {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-900">
                <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
                    <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
                        <p className="text-base font-semibold text-slate-800">
                            게시글 정보를 찾을 수 없습니다.
                        </p>
                        <button
                            type="button"
                            onClick={handleBack}
                            className="mt-5 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                            목록으로 이동
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
                <div className="mb-6 flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        목록으로
                    </button>
                    {detail.mine && (
                        <button
                            type="button"
                            onClick={handleEdit}
                            className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                        >
                            수정
                        </button>
                    )}
                </div>

                <div className="space-y-8">
                    <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-6 py-6 lg:px-8">
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                {mergedTags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>

                            <h1 className="text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">
                                {detail.title}
                            </h1>

                            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
                                <span className="inline-flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    {detail.nickname}
                                </span>

                                <span className="inline-flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4" />
                                    {detail.createdAt}
                                </span>

                                <span className="inline-flex items-center gap-2">
                                    <Eye className="h-4 w-4" />
                                    조회 {detail.readCount}
                                </span>
                            </div>
                        </div>

                        <div className="px-6 py-8 lg:px-8">
                            <div className="mt-8">
                                <h2 className="mb-3 text-lg font-semibold text-slate-900">
                                    게시글 내용
                                </h2>
                                <div className="rounded-3xl border border-slate-200 bg-white p-6 text-[15px] leading-8 whitespace-pre-wrap text-slate-700">
                                    {detail.content || "작성된 내용이 없습니다."}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-6 py-5 lg:px-8">
                            <h2 className="text-2xl font-semibold">공유된 면접 답변</h2>
                            <p className="mt-2 text-sm text-slate-500">
                                선택한 질문과 답변, 공개 설정에 따라 점수 및 AI 피드백이 함께 표시됩니다.
                            </p>
                        </div>

                        <div className="space-y-6 px-6 py-6 lg:px-8">
                            {detail.interview.map((item) => {
                                const questionType = getQuestionType(item.seq);

                                return (
                                    <div
                                        key={item.itemId}
                                        className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                                    >
                                        <div className="mb-3 flex flex-wrap items-center gap-2">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${questionType.className}`}
                                            >
                                                {questionType.label}
                                            </span>

                                            {item.scoreVisible && item.score != null && (
                                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                                    {item.score}점
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-lg font-semibold leading-8 text-slate-900">
                                            {item.questionText}
                                        </p>

                                        <div className="mt-5 grid gap-5 lg:grid-cols-2">
                                            <div>
                                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                    내 답변
                                                </label>
                                                <div className="min-h-[260px] rounded-3xl border border-slate-200 bg-white p-5 text-sm leading-7 whitespace-pre-wrap text-slate-700">
                                                    {item.answerText || "등록된 답변이 없습니다."}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                    AI 피드백 요약
                                                </label>
                                                <div className="min-h-[260px] rounded-3xl border border-slate-200 bg-white p-5 text-sm leading-7 whitespace-pre-wrap text-slate-700">
                                                    {item.aiFeedbackVisible
                                                        ? item.aiFeedbackSummaryText || "AI 피드백이 없습니다."
                                                        : "작성자가 AI 피드백을 비공개로 설정했습니다."}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section
                        id="comment-section"
                        className="rounded-[28px] border border-slate-200 bg-white shadow-sm"
                    >
                        <div className="border-b border-slate-100 px-6 py-5 lg:px-8">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-slate-700" />
                                <h2 className="text-2xl font-semibold text-slate-900">댓글</h2>
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                    {totalCommentCount}
                                </span>
                            </div>
                            <p className="mt-2 text-sm text-slate-500">
                                게시글에 대한 의견이나 질문을 남겨보세요.
                            </p>
                        </div>

                        <div className="px-6 py-6 lg:px-8">
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    댓글 작성
                                </label>
                                <textarea
                                    value={commentInput}
                                    onChange={(e) => setCommentInput(e.target.value)}
                                    placeholder="댓글을 입력해 주세요."
                                    className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                                />
                                <div className="mt-3 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={handleAddComment}
                                        className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                                    >
                                        댓글 등록
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 space-y-4">
                                {isCommentLoading ? (
                                    <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-10 text-center">
                                        <p className="text-sm font-medium text-slate-700">
                                            댓글을 불러오는 중입니다.
                                        </p>
                                    </div>
                                ) : !commentPage || commentPage.content.length === 0 ? (
                                    <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-10 text-center">
                                        <p className="text-sm font-medium text-slate-700">
                                            아직 등록된 댓글이 없습니다.
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            첫 댓글을 남겨보세요.
                                        </p>
                                    </div>
                                ) : (
                                    commentPage.content.map((comment: CommentItem) => (
                                        <div
                                            key={comment.id}
                                            className="rounded-3xl border border-slate-200 bg-white p-5"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {comment.authorNickname}
                                                        {comment.writerChk && (
                                                            <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                                                                작성자
                                                            </span>
                                                        )}
                                                        {comment.mine && (
                                                            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                                                                내 댓글
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {comment.createdAt}
                                                    </p>
                                                </div>

                                                {!comment.deleted && (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenReplyForm(comment.id)}
                                                            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                                                        >
                                                            답글
                                                        </button>

                                                        {comment.mine && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleOpenEditComment(
                                                                            comment.id,
                                                                            comment.content
                                                                        )
                                                                    }
                                                                    className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                                                                >
                                                                    수정
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleDeleteComment(comment.id,comment.depth,comment.parentId)
                                                                    }
                                                                    className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                                                                >
                                                                    삭제
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {editCommentId === comment.id ? (
                                                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                        댓글 수정
                                                    </label>
                                                    <textarea
                                                        value={editContent}
                                                        onChange={(e) => setEditContent(e.target.value)}
                                                        className="min-h-[100px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                                                    />
                                                    <div className="mt-3 flex justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={handleCancelEditComment}
                                                            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                                        >
                                                            취소
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={()=> handleUpdateComment(comment.depth,comment.parentId)}
                                                            className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                                                        >
                                                            수정 완료
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                                                    {comment.deleted ? "삭제된 댓글입니다." : comment.content}
                                                </div>
                                            )}

                                            {openReplyFormId === comment.id && (
                                                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                        답글 작성
                                                    </label>
                                                    <textarea
                                                        value={replyInputs[comment.id] ?? ""}
                                                        onChange={(e) =>
                                                            handleReplyInputChange(comment.id, e.target.value)
                                                        }
                                                        placeholder="답글을 입력해 주세요."
                                                        className="min-h-[100px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                                                    />
                                                    <div className="mt-3 flex justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setOpenReplyFormId(null)}
                                                            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                                        >
                                                            취소
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAddReply(comment.id)}
                                                            className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                                                        >
                                                            답글 등록
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {!!comment.children?.length && (
                                                <div className="mt-4 space-y-3 border-l-2 border-slate-100 pl-4">
                                                    {comment.children.map((reply) => (
                                                        <div
                                                            key={reply.id}
                                                            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                                                        >
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div>
                                                                    <p className="text-sm font-semibold text-slate-900">
                                                                        {reply.authorNickname}
                                                                        {reply.writerChk && (
                                                                            <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                                                                                작성자
                                                                            </span>
                                                                        )}
                                                                        {reply.mine && (
                                                                            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                                                                                내 댓글
                                                                            </span>
                                                                        )}
                                                                    </p>
                                                                    <p className="mt-1 text-xs text-slate-500">
                                                                        {reply.createdAt}
                                                                    </p>
                                                                </div>

                                                                {!reply.deleted && reply.mine && (
                                                                    <div className="flex items-center gap-2">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                handleOpenEditComment(
                                                                                    reply.id,
                                                                                    reply.content
                                                                                )
                                                                            }
                                                                            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                                                                        >
                                                                            수정
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                handleDeleteComment(reply.id,reply.depth,reply.parentId)
                                                                            }
                                                                            className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                                                                        >
                                                                            삭제
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {editCommentId === reply.id ? (
                                                                <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
                                                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                                        답글 수정
                                                                    </label>
                                                                    <textarea
                                                                        value={editContent}
                                                                        onChange={(e) =>
                                                                            setEditContent(e.target.value)
                                                                        }
                                                                        className="min-h-[100px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                                                                    />
                                                                    <div className="mt-3 flex justify-end gap-2">
                                                                        <button
                                                                            type="button"
                                                                            onClick={handleCancelEditComment}
                                                                            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                                                        >
                                                                            취소
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={()=>handleUpdateComment(reply.depth,reply.parentId)}
                                                                            className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                                                                        >
                                                                            수정 완료
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                                                                    {reply.deleted
                                                                        ? "삭제된 댓글입니다."
                                                                        : reply.content}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            {commentPage && commentPage.totalPages > 1 && (
                                <div className="mt-8">
                                    <Pagination
                                        pageNumber={commentPage.pageNumber}
                                        totalPages={commentPage.totalPages}
                                        onChange={handleCommentPageChange}
                                        windowSize={5}
                                    />
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
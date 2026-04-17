import {getClientApiEndpoints} from "@mockio/shared/src/api";
import {api} from "@/lib/axios";

export type QuestionBoardListParams = {
    value?: string;
    track?: string;
    scoreVisible?: boolean;
    page?: number;
    size?: number;
};


export type QuestionBoardListItem = {
    boardId: number;
    boardItemId: number;
    title: string;
    nickname: string;
    track: string;
    readCount : number;
    question: string;
    answerPreview: string;
    score: number | null;
    scoreVisible: boolean;
    feedbackVisible: boolean;
    tags: string[];
    createdAt: string;
};

export type PageDto<T> = {
    content: T[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
};
export async function questionBoardListApi(
    params: QuestionBoardListParams
): Promise<PageDto<QuestionBoardListItem>> {
    const endpoints = getClientApiEndpoints();

    const searchParams = new URLSearchParams();

    if (params.value) searchParams.set("value", params.value);
    if (params.track && params.track !== "ALL") searchParams.set("track", params.track);
    if (typeof params.scoreVisible === "boolean") {
        searchParams.set("scoreVisible", String(params.scoreVisible));
    }
    searchParams.set("page", String(params.page ?? 0));
    searchParams.set("size", String(params.size ?? 6));

    const response = await api.get(`${endpoints.questionboardPublic}/list?${searchParams.toString()}`, {

    });
    return response.data.data;
}
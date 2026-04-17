import {api} from "@/lib/axios";
import {getClientApiEndpoints} from "@/lib/api";

export type CommentItem = {
    id: number;
    authorNickname: string;
    content: string;
    createdAt: string;
    deleted: boolean;
    writerChk : boolean;
    mine : boolean;
    parentId?: number;
    depth: number;
    children?: CommentItem[];
};

export type CommentPageDto = {
    content: CommentItem[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
};

export const commentListApi = async (
    boardType: string,
    boardId: number,
    page: number,
    size: number
): Promise<CommentPageDto> => {
    const endpoints = getClientApiEndpoints();
    const res = await api.get(
        `${endpoints.commentPublic}/${boardType}/${boardId}/list`,
        {
            params: {
                page,
                size,
            },
        }
    );

    return res.data.data;
};
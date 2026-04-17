import {api} from "@/lib/axios";
import {getClientApiEndpoints} from "@/lib/api";



type CommentCreateRequest = {
    boardType: string;
    boardId: number;
    content: string;
};


export const commentCreateApi = async (
    payload: CommentCreateRequest
): Promise<void> => {
    const endpoints = getClientApiEndpoints();

    await api.post(
        `${endpoints.comment}/create`,
        payload
    );
};

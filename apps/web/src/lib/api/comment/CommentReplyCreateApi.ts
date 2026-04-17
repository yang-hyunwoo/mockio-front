import {api} from "@/lib/axios";
import {getClientApiEndpoints} from "@/lib/api";



type CommentReplyCreateRequest = {
    parentId: number;
    content: string;
};


export const commentReplyCreateApi = async (
    payload: CommentReplyCreateRequest
): Promise<void> => {
    const endpoints = getClientApiEndpoints();

    await api.post(
        `${endpoints.comment}/reply/create`,
        payload
    );
};

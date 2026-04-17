import {api} from "@/lib/axios";
import {getClientApiEndpoints} from "@/lib/api";



type CommentUpdateRequest = {
    boardType: string;
    id: number;
    depth : number;
    parentId?: number;
    content : string;

};


export const commentUpdateApi = async (
    payload: CommentUpdateRequest
): Promise<void> => {
    const endpoints = getClientApiEndpoints();

    await api.patch(
        `${endpoints.comment}/update`,
        payload
    );
};

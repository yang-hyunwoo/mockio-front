import {api} from "@/lib/axios";
import {getClientApiEndpoints} from "@/lib/api";



type CommentDeleteRequest = {
    boardType: string;
    id: number;
    depth : number;
    parentId?: number;

};


export const commentDeleteApi = async (
    payload: CommentDeleteRequest
): Promise<void> => {
    const endpoints = getClientApiEndpoints();

    await api.patch(
        `${endpoints.comment}/delete`,
        payload
    );
};

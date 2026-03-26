import {api} from "@/lib/axios";
import {getClientApiEndpoints} from "@/lib/api";
import {MypagePasswordChangeRequest} from "@mockio/shared/src/api/password/MypagePasswordChangeRequest";

export const ChangePasswordApi = async (
    payload: MypagePasswordChangeRequest
): Promise<void> => {
    const endpoints = getClientApiEndpoints();

    try {
        await api.post(`${endpoints.user}/password-change`, payload);
    } catch (error: any) {
        throw error;
    }
}

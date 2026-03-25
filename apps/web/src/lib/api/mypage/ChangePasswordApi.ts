import { api } from "@/lib/axios"
import { apiEndpoints } from "@/lib/api"
import {MypagePasswordChangeRequest} from "@mockio/shared/src/api/password/MypagePasswordChangeRequest";

export const ChangePasswordApi = async (
    payload: MypagePasswordChangeRequest
): Promise<void> => {
    try {
        await api.post(`${apiEndpoints.user}/password-change`, payload);
    } catch (error: any) {
        throw error;
    }
}


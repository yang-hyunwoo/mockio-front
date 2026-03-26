import {api} from "@/lib/axios";
import {PasswordChangeRequest} from "@mockio/shared/src/api/password/PasswordChangeRequest";
import {getClientApiEndpoints} from "@mockio/shared/src/api";

export const PasswordResetConfirmApi = async (
    payload: PasswordChangeRequest
): Promise<void> => {
    const endpoints = getClientApiEndpoints();

    await api.post(
        `${endpoints.userPublic}/password/change`,
        payload
    )
}

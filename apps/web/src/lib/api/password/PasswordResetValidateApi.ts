import {api} from "@/lib/axios";
import {getClientApiEndpoints} from "@/lib/api";

export const PasswordResetValidateApi = async (
    request: { token: string }
): Promise<void> => {
    const endpoints = getClientApiEndpoints();

    await api.get(
        `${endpoints.userPublic}/password/reset/validate`,
        {
            params: request,
        }
    )
}

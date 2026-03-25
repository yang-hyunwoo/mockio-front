import { api } from "@/lib/axios"
import { apiEndpoints } from "@/lib/api"

export const PasswordResetValidateApi = async (
    request: { token: string }
): Promise<void> => {
    await api.get(
        `${apiEndpoints.userPublic}/password/reset/validate`,
        {
            params: request,
        }
    )
}
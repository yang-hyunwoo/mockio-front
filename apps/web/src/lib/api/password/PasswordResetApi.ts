import { api } from "@/lib/axios"
import { apiEndpoints } from "@/lib/api"

export const PasswordResetApi = async (
    request: { email: string }
): Promise<void> => {
    await api.post(
        `${apiEndpoints.userPublic}/password-find`,
        request
    )
}

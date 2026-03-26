import { api } from "@/lib/axios"
import { getClientApiEndpoints} from "@/lib/api"

const endpoints = getClientApiEndpoints();

export const PasswordResetApi = async (
    request: { email: string }
): Promise<void> => {
       await api.post(
        `${endpoints.userPublic}/password-find`,
        request
    )
}

import { api } from "@/lib/axios"
import { apiEndpoints } from "@/lib/api"
import {PasswordChangeRequest} from "@mockio/shared/src/api/password/PasswordChangeRequest";


export const PasswordResetConfirmApi = async (
    payload: PasswordChangeRequest
): Promise<void> => {
    await api.post(
        `${apiEndpoints.userPublic}/password/change`,
        payload
    )
}
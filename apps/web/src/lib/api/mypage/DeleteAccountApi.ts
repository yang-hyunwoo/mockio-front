import { api } from "@/lib/axios"
import { apiEndpoints } from "@/lib/api"

export const DeleteAccountApi = async (
    request: { password: string }
): Promise<boolean> => {
    try {
        await api.patch(`${apiEndpoints.user}/delete`,
            request)
        return true
    } catch (error) {
        console.error("알림 읽음 처리 실패", error)
        return false
    }
}
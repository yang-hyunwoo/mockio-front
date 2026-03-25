import { api } from "@/lib/axios"
import { apiEndpoints } from "@/lib/api"

export const NotificationReadAllApi = async (): Promise<boolean> => {
    try {
        await api.patch(`${apiEndpoints.notification}/main/read-all`)
        return true
    } catch (error) {
        console.error("알림 읽음 처리 실패", error)
        return false
    }
}

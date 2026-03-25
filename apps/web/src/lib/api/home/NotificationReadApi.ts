import { api } from "@/lib/axios"
import { apiEndpoints } from "@/lib/api"

export const NotificationReadApi = async (notificationId: number): Promise<boolean> => {
    try {
        await api.patch(`${apiEndpoints.notification}/main/${notificationId}/read`)
        return true
    } catch (error) {
        console.error("알림 읽음 처리 실패", error)
        return false
    }
}

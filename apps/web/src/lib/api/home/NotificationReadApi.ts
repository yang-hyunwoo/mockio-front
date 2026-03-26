import {api} from "@/lib/axios";
import {getClientApiEndpoints} from "@/lib/api";

export const NotificationReadApi = async (notificationId: number): Promise<boolean> => {
    const endpoints = getClientApiEndpoints();

    try {
        await api.patch(`${endpoints.notification}/main/${notificationId}/read`)
        return true
    } catch (error) {
        console.error("알림 읽음 처리 실패", error)
        return false
    }
}

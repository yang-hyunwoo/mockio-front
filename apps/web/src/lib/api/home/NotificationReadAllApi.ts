import {api} from "@/lib/axios";
import {getClientApiEndpoints} from "@/lib/api";

export const NotificationReadAllApi = async (): Promise<boolean> => {
    const endpoints = getClientApiEndpoints();

    try {
        await api.patch(`${endpoints.notification}/main/read-all`)
        return true
    } catch (error) {
        console.error("알림 읽음 처리 실패", error)
        return false
    }
}

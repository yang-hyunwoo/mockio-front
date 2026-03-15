import { api } from "@/lib/axios"
import { apiEndpoints } from "@/lib/api"
import { NotificationResponse } from "@mockio/shared/src/api/home/NotificationResponse"


export type NotificationReadResponseType = {
    notifications: NotificationResponse[]
    unreadCount: number
    hasNext: boolean,
}



export const NotificationApi = async (
): Promise<NotificationReadResponseType | null> => {
    try {
        const response = await api.get(
            `${apiEndpoints.notification}/main/list`
        )

        return response.data.data ?? null
    } catch (error) {
        console.error("면접 시작 실패", error)
        return null
    }
}
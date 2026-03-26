import {api} from "@/lib/axios";
import {getClientApiEndpoints} from "@/lib/api";
import {NotificationResponse} from "@mockio/shared/src/api/home/NotificationResponse";


export type NotificationReadResponseType = {
    notifications: NotificationResponse[]
    unreadCount: number
    hasNext: boolean,
}


export const NotificationApi = async (
): Promise<NotificationReadResponseType | null> => {
    const endpoints = getClientApiEndpoints();

    try {
        const response = await api.get(
            `${endpoints.notification}/main/list`
        )

        return response.data.data ?? null
    } catch (error) {
        return null
    }
}

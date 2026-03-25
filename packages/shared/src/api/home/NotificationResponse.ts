import {EnumResponse} from "../EnumResponse";

export type NotificationResponse = {
    id: number;
    type : EnumResponse
    title: string;
    content: string;
    link?: string | null;
    isRead: boolean;
    createdAt: string;
}

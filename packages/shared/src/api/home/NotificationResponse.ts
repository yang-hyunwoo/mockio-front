export type NotificationResponse = {
    id: number;
    type : {
        code : string,
        label : string
    },
    title: string;
    content: string;
    link?: string | null;
    isRead: boolean;
    createdAt: string;
}
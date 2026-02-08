import { apiEndpoints } from "@/lib/api";

export type NoticePayload = {
    title: string;
    body: string;
} | null;

export const getNotice = async (): Promise<NoticePayload> => {
    if (!apiEndpoints.notiPublic) return null;

    const res = await fetch(`${apiEndpoints.notiPublic}/notice/detail`, {
        cache: "no-store",
    });

    if (!res.ok) return null;

    const data = await res.json();
    const payload = data?.data ?? data?.result ?? data;

    return {
        title: payload?.title ?? payload?.noticeTitle ?? "공지사항",
        body: payload?.summary ?? payload?.body ?? payload?.noticeContent ?? "",
    };
};
import { apiEndpoints } from "@/lib/api";
import {MainNotice} from "@mockio/shared/src/api/home/MainNotice";

export const getNotice = async (): Promise<MainNotice> => {
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

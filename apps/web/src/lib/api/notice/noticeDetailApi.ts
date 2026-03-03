import { apiEndpoints } from "@/lib/api";
import {NoticeDetail} from "@mockio/shared/src/api/notice/NoticeDetail";

export const noticeDetailApi = async (
    id: string
): Promise<NoticeDetail | null> => {
    try {
        const res = await fetch(
            `${apiEndpoints.notiPublic}/notice/detail/${id}`,
            { cache: "no-store" }
        )

        if (!res.ok) return null

        const json = await res.json()
        const data = json?.data
        if (!data) return null

        return {
            id: data.id,
            title: data.title,
            content: data.content,
            createdAt: data.createdAt,
            noticeType: data.noticeType?.label ?? "",
            pinned: data.pinned ?? false,
            prevId: data.prevId ?? null,
            nextId: data.nextId ?? null,
        }
    } catch (e) {
        console.error(e)
        return null
    }
}

import { api } from "@/lib/axios";
import { apiEndpoints } from "@/lib/api";
import { Notice } from "@mockio/shared/src/api/notice/Notice";

export const noticePinListApi = async (): Promise<Notice[]> => {
    try {
        const res = await api.get(`${apiEndpoints.notiPublic}/notice/pinned/list`)
        const list = res.data?.data ?? []
        return list.map((item: any) => ({
            id: item.id,
            title: item.title,
            createdAt: item.createdAt,
            summary: item.summary ?? null,
            noticeType: item.noticeType?.label ?? "",
            pinned: true,
        }))
    } catch (e) {
        console.error(e)
        return []
    }
}

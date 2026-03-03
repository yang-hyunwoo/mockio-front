import { api } from "@/lib/axios";
import { apiEndpoints } from "@/lib/api";
import { Notice } from "@mockio/shared/src/api/notice/Notice";
import { PageResponse } from "@mockio/shared/src/api/PageResponse";

export const noticeListApi = async (
    page: number,
    size: number
): Promise<PageResponse<Notice> | null> => {
    try {
        const res = await api.get(
            `${apiEndpoints.notiPublic}/notice/list`,
            { params: { page, size } }
        )

        const pageData = res.data?.data
        if (!pageData) return null
        return {
            content: pageData.content.map((item: any) => ({
                id: item.id,
                title: item.title,
                summary: item.summary,
                createdAt: item.createdAt,
                noticeType: item.noticeType?.label ?? "",
                pinned: false,
            })),
            pageNumber: pageData.pageNumber,
            pageSize: pageData.pageSize,
            totalElements: pageData.totalElements,
            totalPages: pageData.totalPages,
        }
    } catch (e) {
        console.error(e)
        return null
    }
}

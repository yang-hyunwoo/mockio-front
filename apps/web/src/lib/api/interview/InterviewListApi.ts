import { api } from "@/lib/axios"
import { apiEndpoints } from "@/lib/api"
import { InterviewItem } from "@mockio/shared/src/api/interview/InterviewPage"
import { PageResponse } from "@mockio/shared/src/api/PageResponse"

export const InterviewListApi = async (
    page: number,
    size: number
): Promise<PageResponse<InterviewItem> | null> => {
    const res = await api.get<{ data: PageResponse<InterviewItem> }>(
        `${apiEndpoints.interview}/list`,
        { params: { page, size } }
    )

    const pageData = res.data?.data
    if (!pageData) return null

    return {
        content: pageData.content.map((item) => ({
            id: item.id,
            title: item.title,
            createdAt: item.createdAt,
            progress: item.progress,
            idempotencyKey: item.idempotencyKey,
            totalCount: item.totalCount,
            status: item.status,
            track: item.track,
            difficulty: item.difficulty,
            feedbackStyle: item.feedbackStyle,
        })),
        pageNumber: pageData.pageNumber,
        pageSize: pageData.pageSize,
        totalElements: pageData.totalElements,
        totalPages: pageData.totalPages,
    }
}
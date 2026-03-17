import { api } from "@/lib/axios"
import { apiEndpoints } from "@/lib/api"
import {InterviewResultResponse} from "@mockio/shared/src/api/interview/InterviewResultResponse";

interface ApiResponse<T> {
    data: T
}

export const InterviewResultApi = async (
    interviewId: number
): Promise<InterviewResultResponse | null> => {
    const response = await api.get<ApiResponse<InterviewResultResponse>>(
        `${apiEndpoints.interview}/history/${interviewId}`
    )

    return response.data.data ?? null
}
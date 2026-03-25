import { api } from "@/lib/axios"
import { apiEndpoints } from "@/lib/api"
import {InterviewAnswerDetailResponse} from "@mockio/shared/src/api/interview/InterviewAnswerDetailResponse";
import {ApiResponse} from "@mockio/shared/src/api/ApiResponse";

export async function InterviewAnswerReadApi(questionId: number): Promise<InterviewAnswerDetailResponse | null> {
    try {
        const response = await api.get<ApiResponse<InterviewAnswerDetailResponse>>(
            `${apiEndpoints.interview}/interviews/answer/${questionId}`
        )
        return response.data.data
    } catch (error) {
        console.error("InterviewAnswerReadApi error:", error)
        return null
    }
}

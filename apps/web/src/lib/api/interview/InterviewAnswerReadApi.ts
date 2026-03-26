import {api} from "@/lib/axios";
import {getClientApiEndpoints} from "@/lib/api";
import {InterviewAnswerDetailResponse} from "@mockio/shared/src/api/interview/InterviewAnswerDetailResponse";
import {ApiResponse} from "@mockio/shared/src/api/ApiResponse";


export async function InterviewAnswerReadApi(questionId: number): Promise<InterviewAnswerDetailResponse | null> {
    const endpoints = getClientApiEndpoints();

    try {
        const response = await api.get<ApiResponse<InterviewAnswerDetailResponse>>(
            `${endpoints.interview}/interviews/answer/${questionId}`
        )
        return response.data.data
    } catch (error) {
        console.error("InterviewAnswerReadApi error:", error)
        return null
    }
}

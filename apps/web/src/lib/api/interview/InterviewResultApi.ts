import {api} from "@/lib/axios";
import {getClientApiEndpoints} from "@/lib/api";
import {InterviewResultResponse} from "@mockio/shared/src/api/interview/InterviewResultResponse";
import {ApiResponse} from "@mockio/shared/src/api/ApiResponse";


export const InterviewResultApi = async (
    interviewId: number
): Promise<InterviewResultResponse | null> => {
    const endpoints = getClientApiEndpoints();

    const response = await api.get<ApiResponse<InterviewResultResponse>>(
        `${endpoints.interview}/history/${interviewId}`
    )

    return response.data.data ?? null
}

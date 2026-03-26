import {api} from "@/lib/axios";
import {getClientApiEndpoints} from "@/lib/api";
import {AxiosRequestConfig} from "axios";
import {InterviewAnswerRequest} from "@mockio/shared/src/api/request/interview/InterviewAnswerRequest";
import {InterviewQuestionReadResponse} from "@/lib/api/interview/InterviewQuestionApi";

type LoadingType = "top" | "center" | "none"

type LoadingAxiosRequestConfig = AxiosRequestConfig & {
    meta?: {
        loading?: LoadingType
    }
}

type ApiResponse<T> = {
    message: string
    data: T
}


export const InterviewAnswerApi = async (
    payload: InterviewAnswerRequest
): Promise<InterviewQuestionReadResponse | null> => {
    const endpoints = getClientApiEndpoints();

    try {
        const response = await api.post<ApiResponse<InterviewQuestionReadResponse>>(
            `${endpoints.interview}/interviews/answer`,
            payload,
            {
                meta: {
                    loading: "none",
                },
            } as LoadingAxiosRequestConfig
        )

        return response.data.data
    } catch (error) {
        console.error("답변 제출 실패", error)
        return null
    }
}

import {api} from "@/lib/axios";
import {getClientApiEndpoints} from "@/lib/api";
import {AxiosRequestConfig} from "axios";
import {InterviewQuestionViewModel} from "@mockio/shared/src/api/view/Interview/InterviewQuestionViewModel";
import {RetryInterviewRequest} from "@mockio/shared/src/api/request/interview/RetryInterviewRequest";

type LoadingType = "top" | "center" | "none"

type LoadingAxiosRequestConfig = AxiosRequestConfig & {
    meta?: {
        loading?: LoadingType
    }
}

export type InterviewQuestionReadResponse = {
    questions: InterviewQuestionViewModel[]
    interviewId: number
    completed: boolean,
    answerTimeSeconds: number
}


export const RetryInterviewApi = async (
    payload: RetryInterviewRequest
): Promise<InterviewQuestionReadResponse | null> => {
    try {
        const endpoints = getClientApiEndpoints();

        const response = await api.post(
            `${endpoints.interview}/interviews/retry-interview`,
            payload,
            {
                meta: {
                    loading: "center",
                },
            } as LoadingAxiosRequestConfig
        )

        return response.data.data ?? null
    } catch (error) {
        throw error
    }
}

import { api } from "@/lib/axios"
import { apiEndpoints } from "@/lib/api"
import { AxiosRequestConfig } from "axios"
import { InterviewQuestionViewModel } from "@mockio/shared/src/api/view/Interview/InterviewQuestionViewModel"

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

type StartInterviewRequest = {
    idempotencyKey: string
}

export const InterviewQuestionApi = async (
    payload: StartInterviewRequest
): Promise<InterviewQuestionReadResponse | null> => {
    try {
        const response = await api.post(
            `${apiEndpoints.interview}/interviews/start-interview`,
            payload,
            {
                meta: {
                    loading: "center",
                },
            } as LoadingAxiosRequestConfig
        )

        return response.data.data ?? null
    } catch (error) {
        console.error("면접 시작 실패", error)
        return null
    }
}
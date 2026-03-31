import {api} from "@/lib/axios";
import {getClientApiEndpoints} from "@/lib/api";
import {AxiosRequestConfig} from "axios";
import {InterviewQuestionViewModel} from "@mockio/shared/src/api/view/Interview/InterviewQuestionViewModel";
import {EnumResponse} from "@mockio/shared/src/api/EnumResponse";

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
    answerTimeSeconds: number,
    interviewMode : EnumResponse
}

type StartInterviewRequest = {
    idempotencyKey: string
}


export const InterviewQuestionApi = async (
    payload: StartInterviewRequest
): Promise<InterviewQuestionReadResponse | null> => {
    const endpoints = getClientApiEndpoints();

    try {
        const response = await api.post(
            `${endpoints.interview}/interviews/start-interview`,
            payload,
            {
                meta: {
                    loading: "center",
                },
            } as LoadingAxiosRequestConfig
        )

        return response.data.data ?? null
    } catch (error) {
        return null
    }
}

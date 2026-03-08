import { api } from "@/lib/axios"
import { apiEndpoints } from "@/lib/api"
import { AxiosRequestConfig } from "axios"
import {InterviewQuestionViewModel } from "@mockio/shared/src/api/view/Interview/InterviewQuestionViewModel";

type LoadingType = "top" | "center" | "none"

type LoadingAxiosRequestConfig = AxiosRequestConfig & {
    meta?: {
        loading?: LoadingType
    }
}

export type InterviewQuestionReadResponse = {
    questions: InterviewQuestionViewModel[]
}

export const InterviewQuestionApi = async (): Promise<InterviewQuestionReadResponse | null> => {
    try {
        const response = await api.post(
            `${apiEndpoints.interview}/interviews/start-interview`,
            null,
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
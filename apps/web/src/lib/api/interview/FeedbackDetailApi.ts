import { api } from "@/lib/axios"
import { getClientApiEndpoints} from "@/lib/api"
import {FeedbackResponse} from "@mockio/shared/src/api/interview/FeedbackDetail";
import {AxiosRequestConfig} from "axios";

type LoadingType = "top" | "center" | "none"

type LoadingAxiosRequestConfig = AxiosRequestConfig & {
    meta?: {
        loading?: LoadingType
    }
}


export async function FeedbackDetailApi(questionId: number): Promise<FeedbackResponse | null> {
    const endpoints = getClientApiEndpoints();

    try {
        const response = await api.get(
            `${endpoints.interview}/${questionId}/feedback`,
            {
                meta: {
                    loading: "none",
                },
            } as LoadingAxiosRequestConfig
        )
        return response.data.data
    } catch (error) {
        console.error("InterviewFeedbackReadApi error:", error)
        return null
    }
}

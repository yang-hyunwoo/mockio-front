import { api } from "@/lib/axios"
import { getClientApiEndpoints} from "@/lib/api"
import {AxiosRequestConfig} from "axios";

type LoadingType = "top" | "center" | "none"

type LoadingAxiosRequestConfig = AxiosRequestConfig & {
    meta?: {
        loading?: LoadingType
    }
}


export async function CompareSummaryInterviewApi(interviewId: number | undefined): Promise<null> {
    const endpoints = getClientApiEndpoints();

    try {
        const response = await api.get(
            `${endpoints.interview}/${interviewId}/compare/summary`,
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

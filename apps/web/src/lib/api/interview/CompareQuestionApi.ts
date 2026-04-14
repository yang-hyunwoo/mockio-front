import {getClientApiEndpoints} from "@mockio/shared/src/api";
import { api } from "@/lib/axios"
import {AxiosRequestConfig} from "axios";

type LoadingType = "top" | "center" | "none"

type LoadingAxiosRequestConfig = AxiosRequestConfig & {
    meta?: {
        loading?: LoadingType
    }
}

export interface CompareQuestionRequest {
    interviewId: number
    currentQuestionId: number
    prevQuestionId: number
}

export interface CompareQuestionResponse {
    id: number
    interviewId: number
    currentQuestionId: number
    prevQuestionId: number
    status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"
    headline?: string | null
    summary?: string | null
    strengths?: string[] | null
    improvements?: string[] | null
    improvementTags?: string[] | null
    errorMessage?: string | null
}

export async function CompareQuestionApi(
    payload: CompareQuestionRequest
): Promise<CompareQuestionResponse> {
    const endpoints = getClientApiEndpoints();

    const response = await api.post(`${endpoints.interview}/compare/question`,
        payload,
        {
            meta: {
                loading: "none",
            },
        } as LoadingAxiosRequestConfig
    )


    return response.data.data;
}

export async function GetCompareQuestionApi(
    compareQuestionId: number
): Promise<CompareQuestionResponse> {
    const endpoints = getClientApiEndpoints();
    const response = await api.get(`${endpoints.interview}/compare/question/${compareQuestionId}`,
        {
            meta: {
                loading: "none",
            },
        } as LoadingAxiosRequestConfig
    );



    return response.data.data;
}
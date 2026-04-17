import {api} from "@/lib/axios";
import {getClientApiEndpoints} from "@/lib/api";
import {AxiosRequestConfig} from "axios";

type LoadingType = "top" | "center" | "none"

type LoadingAxiosRequestConfig = AxiosRequestConfig & {
    meta?: {
        loading?: LoadingType
    }
}


type InterviewQuestionAnswerUpdateRequest = {
    boardId: number;
    title: string;
    content: string;
    scoreVisible: boolean;
    aiFeedbackVisible: boolean;
    tags: string[];

};


export const interviewQuestionAnswerUpdateApi = async (
    payload: InterviewQuestionAnswerUpdateRequest
): Promise<void> => {
    const endpoints = getClientApiEndpoints();

    await api.patch(
        `${endpoints.questionboard}/update`,
        payload
    );
};

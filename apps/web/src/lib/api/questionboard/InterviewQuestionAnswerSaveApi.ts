import {api} from "@/lib/axios";
import {getClientApiEndpoints} from "@/lib/api";
import {AxiosRequestConfig} from "axios";


type InterviewQuestionAnswerRequest = {
    interview: {
        interviewId: number;
        questionId: number;
        scoreVisible: boolean;
        aiFeedbackVisible: boolean;
        tags: string[];
    }[];
    title: string;
    content: string;
};


export const interviewQuestionAnswerSaveApi = async (
    payload: InterviewQuestionAnswerRequest
): Promise<void> => {
    const endpoints = getClientApiEndpoints();

    await api.post(
        `${endpoints.questionboard}/create`,
        payload
    );
};

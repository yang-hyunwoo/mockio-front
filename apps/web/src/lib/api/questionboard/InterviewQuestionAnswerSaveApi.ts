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

export type interviewQuestionAnserSaveResponse = {
    id : number;
}

export const interviewQuestionAnswerSaveApi = async (
    payload: InterviewQuestionAnswerRequest
): Promise<interviewQuestionAnserSaveResponse> => {
    const endpoints = getClientApiEndpoints();

    const result = await api.post(
        `${endpoints.questionboard}/create`,
        payload
    );

    return result.data.data;

};

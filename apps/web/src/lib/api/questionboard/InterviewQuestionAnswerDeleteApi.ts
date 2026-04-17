import {api} from "@/lib/axios";
import {getClientApiEndpoints} from "@/lib/api";

type LoadingType = "top" | "center" | "none"

type InterviewQuestionAnswerDeleteRequest = {
    boardId: number;

};


export const interviewQuestionAnswerDeleteApi = async (
    payload: InterviewQuestionAnswerDeleteRequest
): Promise<void> => {
    const endpoints = getClientApiEndpoints();

    await api.patch(
        `${endpoints.questionboard}/delete`,
        payload
    );
};

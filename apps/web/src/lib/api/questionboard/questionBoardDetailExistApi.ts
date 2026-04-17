import {getClientApiEndpoints} from "@mockio/shared/src/api";
import {api} from "@/store/axios";
import axios, { AxiosError } from "axios";
import {ApiErrorResponse} from "@mockio/shared/src/api/ApiErrorResponse";

export type InterviewShareDetailResponse = {
    selectedInterviewId: number;
    selectedQuestionId: number;
    title : string;
    content? : string;
    scoreVisible : boolean;
    aiFeedbackVisible : boolean;
    tags?: string[];
};




export const questionBoardDetailExistApi = async (
    questionBoardId: number
): Promise<InterviewShareDetailResponse> => {

    const endpoints = getClientApiEndpoints();

    try {
        const res = await api.get(
            `${endpoints.questionboard}/${questionBoardId}/detail`,
        );

        return res.data.data;
    } catch (e) {
        if (axios.isAxiosError(e)) {
            const errorData = e.response?.data as ApiErrorResponse | undefined;

            if (errorData) {
                throw errorData;
            }

            throw {
                httpCode: e.response?.status ?? 500,
                message: "요청 처리 중 오류가 발생했습니다.",
            } satisfies ApiErrorResponse;
        }

        console.error("Unknown error:", e);

        throw {
            httpCode: 500,
            message: "알 수 없는 오류가 발생했습니다.",
        } satisfies ApiErrorResponse;
    }
};
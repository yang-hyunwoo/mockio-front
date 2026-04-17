import {api} from "@/lib/axios";
import {getClientApiEndpoints} from "@/lib/api";

export type InterviewItem = {
    interviewId: number;
    interviewTitle: string;
    createdAt: string;
};

export type QuestionAnswerItem = {
    seq: number;
    questionId: number;
    question: string;
    answer: string;
    score: number | null;
    aiFeedbackText: string | null;
};

export type CreateSettingResponse = {
    interviews: InterviewItem[];
    selectedInterviewId: number | null;
    selectedQuestionId: number | null;
    questionAnswers: QuestionAnswerItem[];
};

export const interviewQuestionAnswerApi = async (
    interviewId?: number
): Promise<CreateSettingResponse> => {

    const endpoints = getClientApiEndpoints();

    try {
        const res = await api.get(
            `${endpoints.questionboard}/create/setting`,
            {
                params: { interviewId } // 있으면 쿼리로 붙음
            }
        );

        return res.data.data as CreateSettingResponse;

    } catch (e) {
        console.error(e);
        throw e;
    }
};
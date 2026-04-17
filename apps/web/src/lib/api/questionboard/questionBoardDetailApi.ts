import {api} from "@/lib/axios";
import {getClientApiEndpoints} from "@/lib/api";


export type InterviewShareDetailResponse = {
    id: number;
    title: string;
    content: string;
    createdAt: string;
    readCount: number;
    mine: boolean;
    nickname: string;
    interview: interviewItem[];

};
type interviewItem = {
        itemId: number;
        interviewTitle: string;
        questionId: number;
        seq: number;
        questionTypeLabel: "기본 질문" | "추가 질문" | "심화 질문";
        questionText: string;
        answerText: string;
        score: number | null;
        scoreVisible: boolean;
        aiFeedbackVisible: boolean;
        aiFeedbackSummaryText: string | null;
        tags : string[] | [];
}

export const questionBoardDetailApi = async (
    boardId: number
): Promise<InterviewShareDetailResponse> => {

    const endpoints = getClientApiEndpoints();

    try {
        const res = await api.get(
            `${endpoints.questionboardPublic}/${boardId}/detail`,
        );

        return res.data.data;
    } catch (e) {
        console.error(e);
        throw e;

    }
};
export type InterviewAnswerDetailResponse = {
    id: number
    questionId: number
    answerText: string
    idempotencyKey: string
    answerDurationSeconds: number
}

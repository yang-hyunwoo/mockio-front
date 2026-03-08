export interface  InterviewAnswerRequest  {
    interviewId: number
    questionId : number
    answerText: string
    answerDurationSeconds: number
    idempotencyKey: string
}

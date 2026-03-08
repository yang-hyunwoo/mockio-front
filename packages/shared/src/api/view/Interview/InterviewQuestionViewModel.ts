export interface  InterviewQuestionViewModel  {
    id: number
    interviewId : number
    title: string
    questionText: string
    tags?: string[],
    type: {
        code : string,
        label : string
    },
    seq : number
}
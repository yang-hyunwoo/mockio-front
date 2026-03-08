export interface  InterviewQuestion  {
    id: number
    interviewId : number
    title: string
    questionText: string
    tags?: string[]
    timeLimitSec?: number
    type : {
        code : string,
        label : string
    }
    seq : number
}

import {EnumResponse} from "../../EnumResponse";

export interface  InterviewQuestionViewModel  {
    id: number
    interviewId : number
    title: string
    questionText: string
    tags?: string[],
    type: EnumResponse,
    seq : number
}
import {EnumResponse} from "../EnumResponse";


export interface  InterviewQuestion  {
    id: number
    interviewId : number
    title: string
    questionText: string
    tags?: string[]
    timeLimitSec?: number
    type : EnumResponse
    seq : number
}

export interface EnumResponse {
    code: string
    label: string
}

export interface InterviewItem {
    id: number
    title: string
    createdAt: string
    progress: number
    idempotencyKey: string
    totalCount: number
    status: EnumResponse
    track: EnumResponse
    difficulty: EnumResponse
    feedbackStyle: EnumResponse
}

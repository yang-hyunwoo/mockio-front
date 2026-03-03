export interface Notice {
    id: number
    title: string
    summary: string | null
    createdAt: string
    noticeType: string
    pinned: boolean
}

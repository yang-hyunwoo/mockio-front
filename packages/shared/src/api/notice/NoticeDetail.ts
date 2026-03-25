export interface NoticeDetail {
    id: number
    title: string
    createdAt: string
    noticeType: string
    pinned: boolean
    content: string
    prevId?: number | null
    nextId?: number | null
}

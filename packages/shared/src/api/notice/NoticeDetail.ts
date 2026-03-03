export interface NoticeDetail {
    id: number
    title: string
    createdAt: string
    noticeType: string
    pinned: boolean
    content: string //  HTML (Cloudinary <img> 포함)
    prevId?: number | null
    nextId?: number | null
}
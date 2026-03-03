"use client"

import { Notice } from "@mockio/shared/src/api/notice/Notice"
import NoticeItem from "./NoticeItem"

interface Props {
    notices: Notice[]
}

export default function NoticeList({ notices }: Props) {
    return (
        <div className="space-y-4">
            {notices.map((notice) => (
                <NoticeItem key={notice.id} notice={notice} />
            ))}
        </div>
    )
}

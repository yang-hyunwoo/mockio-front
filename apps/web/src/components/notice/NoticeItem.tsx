"use client"

import Link from "next/link"
import { Notice } from "@mockio/shared/src/api/notice/Notice"
import { Pin } from "lucide-react"

interface Props {
    notice: Notice
}

export default function NoticeItem({ notice }: Props) {
    return (
        <Link
            href={`/notice/${notice.id}`}
            className="block p-4 rounded-xl border border-gray-200 dark:border-gray-700
                 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    {notice.pinned && (
                        <Pin className="w-4 h-4 text-red-500" />
                    )}
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                        [{notice.noticeType}] {notice.title}
                    </h3>
                </div>
                <span className="text-sm text-gray-500">
          {notice.createdAt}
        </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                {notice.summary}
            </p>
        </Link>
    )
}

"use client"

import { useEffect, useState } from "react"
import NoticeList from "@/components/notice/NoticeList"
import NoticePagination from "@/components/notice/NoticePagination"
import { Notice } from "@mockio/shared/src/api/notice/Notice"
import {noticeListApi} from "@/lib/api/notice/noticeListApi";
import {noticePinListApi} from "@/lib/api/notice/noticePinListApi";
import {PageResponse} from "@mockio/shared/src/api/PageResponse";

export default function NoticePage() {
    const [pinned, setPinned] = useState<Notice[]>([])
    const [pageData, setPageData] = useState<PageResponse<Notice> | null>(null)

    const [page, setPage] = useState(0)
    const size = 10

    // 1) pinned는 최초 1회만
    useEffect(() => {
        const fetchPinned = async () => {
            const result = await noticePinListApi()
            if (result) {
                setPinned(result);
            }
        }
        fetchPinned();

    }, [])

    // 2) normal은 page 변경마다
    useEffect(() => {
        const fetch = async () => {
            const result = await noticeListApi(page, size)
            if (result) {
                setPageData(result)
            }
        }
        fetch()
    }, [page])

    return (
        <main className="min-h-[calc(100vh-64px)]">
            <section className="mx-auto max-w-5xl px-4 pt-8 pb-14">
                <div className="mb-6">
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500/80 dark:text-slate-300/70">Notice</p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">공지사항</h1>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300/80">
                        서비스 업데이트 및 운영 안내를 확인하세요.
                    </p>
                </div>

                <div
                    className="rounded-3xl border border-slate-200/70 bg-white/60 shadow-[0_24px_48px_rgba(20,30,50,0.10)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                    <div className="p-4 sm:p-6">
                        {/* IMPORTANT 섹션 */}
                        {pinned.length > 0 && (
                            <div className="mb-6">
                                <div className="mb-3 flex items-center justify-between">
                                    <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">중요 공지</h2>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">상단 고정</span>
                                </div>
                                <NoticeList notices={pinned}/>
                                <div className="my-6 h-px bg-slate-200/70 dark:bg-white/10"/>
                            </div>
                        )}

                        {/* NORMAL 섹션 */}
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">전체 공지</h2>
                            {pageData && (
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {pageData.totalElements.toLocaleString()}건
                                </span>
                            )}
                        </div>

                        <NoticeList notices={pageData?.content ?? []}/>

                        {pageData && (
                            <div className="mt-6">
                                <NoticePagination
                                    pageNumber={pageData.pageNumber}
                                    totalPages={pageData.totalPages}
                                    onChange={setPage}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}

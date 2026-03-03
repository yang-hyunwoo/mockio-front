
import { noticeDetailApi } from "@/lib/api/notice/noticeDetailApi"
export default async function NoticeDetailPage({params,}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const notice = await noticeDetailApi(id)
    console.log(notice)
    if (!notice) {
        return (
            <div className="mx-auto max-w-5xl px-4 pt-10">
                존재하지 않는 공지입니다.
            </div>
        )
    }
    return (
        <main className="overflow-x-hidden">
            <section className="mx-auto max-w-5xl px-4 pt-8 pb-8">
                {/* 헤더 */}
                <div className="mb-6">
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500/80 dark:text-slate-300/70">
                        Notice
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                        {notice.title}
                    </h1>
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300/80">
                        <span>{notice.createdAt}</span>
                        <span className="text-slate-300 dark:text-white/20">·</span>
                        <span>{notice.noticeType}</span>
                        {notice.pinned && (
                            <>
                                <span className="text-slate-300 dark:text-white/20">·</span>
                                <span
                                    className="rounded-full border border-rose-200/60 bg-rose-50/70 px-2 py-0.5 text-xs text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200">
                  상단 고정
                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* 본문 패널 */}
                <article
                    className="rounded-3xl border border-slate-200/70 bg-white/60 shadow-[0_24px_48px_rgba(20,30,50,0.10)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                    <div className="p-5 sm:p-8">
                        {/* HTML Viewer */}
                        <div
                            className="notice-viewer prose dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{__html: notice.content}}
                        />
                    </div>
                </article>

                {/* 이전/다음 */}
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    <NavCard label="이전 글" id={notice.prevId}/>
                    <NavCard label="다음 글" id={notice.nextId}/>
                </div>
            </section>
        </main>
    )
};

function NavCard({ label, id }: { label: string; id?: number | null }) {
    if (!id) {
        return (
            <div className="rounded-2xl border border-slate-200/70 bg-white/50 p-4 text-sm text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
                {label}: 없음
            </div>
        )
    }

    return (
        <a
            href={`/notice/${id}`}
            className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 text-sm text-slate-700 transition hover:shadow
                 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200"
        >
            <span className="block text-xs text-slate-500 dark:text-slate-400">{label}</span>
            <span className="mt-1 block font-medium">#{id} 공지로 이동</span>
        </a>
    )
}
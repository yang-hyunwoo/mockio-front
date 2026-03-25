type InterviewConflictModalProps = {
    open: boolean
    onClose: () => void
    onContinue: () => void
    onRestart: () => void
}

export default function InterviewConflictModal({
                                                   open,
                                                   onClose,
                                                   onContinue,
                                                   onRestart,
                                               }: InterviewConflictModalProps) {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    진행 중인 면접이 있습니다
                </h2>

                <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                    이미 진행 중인 면접이 존재합니다.
                    <br />
                    이어서 진행하시겠습니까, 아니면 기존 면접을 종료한 뒤 새로 시작하시겠습니까?
                </p>

                <div className="mt-6 flex flex-col gap-3">
                    <button
                        onClick={onContinue}
                        className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        이어하기
                    </button>

                    <button
                        onClick={onRestart}
                        className="rounded-xl border border-red-300 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                        종료 후 면접 시작하기
                    </button>

                    <button
                        onClick={onClose}
                        className="rounded-xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                        취소
                    </button>
                </div>
            </div>
        </div>
    )
}

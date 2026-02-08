export default function PreviewSection() {
    return (
        <section
            id="preview"
            className="grid gap-8 rounded-3xl border border-[var(--border-glass)] bg-[var(--surface-glass)] p-8 shadow-[0_18px_40px_rgba(20,30,50,0.12)] md:grid-cols-3"
        >
            <div className="flex flex-col gap-3">
                <p className="text-sm uppercase tracking-[0.2em] text-[var(--brand-muted)]">Preview</p>
                <h2 className="text-2xl font-semibold text-[var(--text-primary)]">면접 진행 흐름</h2>
                <p className="text-sm text-[var(--brand-copy)]">
                    부담은 낮추고 답변의 선명도는 높이는 부드러운 가이드 흐름입니다.
                </p>
            </div>

            {[
                { title: "1. 워밍업 질문", desc: "부담 낮은 질문으로 리듬을 잡습니다." },
                { title: "2. 딥다이브", desc: "구조화된 꼬리 질문으로 답변을 다듬습니다." },
                { title: "3. 피드백 스냅샷", desc: "명확성, 구조, 자신감에 대한 핵심 정리.", col: "md:col-start-2" },
                { title: "4. 다음 액션", desc: "다음 세션을 위한 작은 목표를 제시합니다." },
            ].map((item) => (
                <div
                    key={item.title}
                    className={`flex flex-col gap-4 rounded-2xl border border-[var(--surface-soft-border)] bg-[var(--surface-glass-strong)] p-5 ${item.col ?? ""}`}
                >
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</p>
                    <p className="text-sm text-[var(--brand-copy)]">{item.desc}</p>
                </div>
            ))}
        </section>
    );
}
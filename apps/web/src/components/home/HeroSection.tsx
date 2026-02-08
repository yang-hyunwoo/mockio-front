export default function HeroSection() {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
                <h1 className="text-4xl sm:text-5xl font-semibold leading-[1.15] text-[var(--text-primary)]">
                    차분한 코칭과 명확한 구조로<br />
                    면접 답변을 정리하세요
                </h1>
                <p className="max-w-xl text-lg leading-8 text-[var(--brand-copy)]">
                    부담은 낮추고 답변을 기록하세요.<br />
                    다음 작은 성장을 만드는 피드백을 제공합니다.<br/>
                    미리보기는 가능하지만, 기록과 저장은 로그인 후 이용 가능 합니다.
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
                <a href="/preview"
                    className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--brand-primary)] px-6 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(53,90,122,0.25)] transition-colors hover:bg-[var(--brand-primary-hover)]"
                >
                    질문 미리보기
                </a>
                <button type="button"
                    className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--border-soft)] px-6 text-sm font-semibold text-[var(--brand-secondary)] transition-colors hover:border-[var(--brand-secondary)] hover:bg-[var(--surface-glass)]"
                >
                    진행 방식 보기
                </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                {[
                    { title: "직무 맞춤 세션", desc: "목표 직무와 레벨에 맞춘 질문을 제공합니다." },
                    { title: "부담 낮은 루틴", desc: "짧은 세션으로 일상 속에서 꾸준히 연습합니다." },
                    { title: "실행 가능한 피드백", desc: "명확성, 구조, 깊이를 바로 개선할 수 있게 안내합니다." },
                ].map((item) => (
                    <div
                        key={item.title}
                        className="rounded-2xl border border-[var(--border-glass)] bg-[var(--surface-glass)] p-5 text-sm shadow-[0_10px_24px_rgba(20,30,50,0.08)]"
                    >
                        <p className="text-base font-semibold text-[var(--text-primary)]">{item.title}</p>
                        <p className="mt-2 text-[var(--brand-copy)]">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
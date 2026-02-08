import Link from "next/link";

type PreviewQuestion = {
    phase: "워밍업" | "딥다이브" | "꼬리 질문" | "피드백";
    title: string;
    intent: string;
    tips?: string[];
};

const previewQuestions: PreviewQuestion[] = [
    {
        phase: "워밍업",
        title: "최근에 가장 몰입했던 작업(또는 프로젝트)은 무엇이었나요?",
        intent: "부담을 낮추고 대화 리듬을 만드는 질문입니다. 경험의 맥락과 동기를 자연스럽게 꺼내게 합니다.",
        tips: ["상황(S)→과제(T)→행동(A)→결과(R)로 짧게", "내 역할을 1문장으로 먼저 요약"],
    },
    {
        phase: "딥다이브",
        title: "그 작업에서 본인이 맡은 역할과 기여를 구체적으로 설명해 주세요.",
        intent: "‘참여했다’가 아니라 ‘어떻게 기여했는지’를 확인합니다. 구체성이 점수입니다.",
        tips: ["무엇을(결정/구현/조율) 했는지 동사로 시작", "수치/전후 비교(성능, 비용, 시간)를 넣기"],
    },
    {
        phase: "꼬리 질문",
        title: "의사결정에서 가장 어려웠던 선택은 무엇이었고, 기준은 무엇이었나요?",
        intent: "판단 기준과 트레이드오프를 봅니다. 깊이가 드러나는 구간입니다.",
        tips: ["대안 A/B를 먼저 말하고", "왜 그 선택이 최적이었는지 근거 2개 제시"],
    },
    {
        phase: "피드백",
        title: "Mockio는 답변의 ‘구조/명확성/깊이’를 짧게 요약해 드립니다.",
        intent: "정답을 강요하기보다, 다음 세션에서 바꿀 수 있는 ‘작은 액션’을 제시하는 방식입니다.",
    },
];

const phases = [
    { key: "워밍업", desc: "부담 낮은 질문으로 리듬을 잡습니다." },
    { key: "딥다이브", desc: "경험을 구조화해 깊이를 끌어냅니다." },
    { key: "꼬리 질문", desc: "트레이드오프와 판단 기준을 확인합니다." },
    { key: "피드백", desc: "다음 액션으로 이어지는 요약을 제공합니다." },
] as const;

export default function PreviewPage() {
    return (
        <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_10%_-10%,var(--tint-mint),transparent_60%),radial-gradient(900px_500px_at_90%_10%,var(--tint-sky),transparent_55%),linear-gradient(180deg,var(--tint-cream),var(--tint-ice))] text-[var(--text-primary)]">
            <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-10 lg:py-14">
                {/* Top bar */}
                <header className="flex items-center justify-between gap-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-secondary)] hover:opacity-90"
                    >
                        <span className="text-base">←</span>
                        홈으로
                    </Link>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/how-it-works"
                            className="inline-flex h-10 items-center rounded-full border border-[var(--border-soft)] px-4 text-sm font-medium text-[var(--brand-secondary)] transition-colors hover:border-[var(--brand-secondary)] hover:bg-[var(--surface-glass)]"
                        >
                            진행 방식 보기
                        </Link>
                        <a
                            href="#start"
                            className="inline-flex h-10 items-center rounded-full bg-[var(--brand-primary)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-primary-hover)]"
                        >
                            면접 시작
                        </a>
                    </div>
                </header>

                {/* Hero */}
                <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
                    <div className="flex flex-col gap-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-[var(--brand-muted)]">Preview</p>
                        <h1 className="text-4xl font-semibold leading-[1.15] text-[var(--text-primary)] sm:text-5xl">
                            실제 면접에 가까운 흐름을
                            <br />
                            미리 경험해보세요
                        </h1>
                        <p className="max-w-xl text-lg leading-8 text-[var(--brand-copy)]">
                            Mockio는 질문을 “나열”하지 않고, 답변을 “정리”하도록 돕습니다. 아래 예시는 한 세션의
                            흐름을 그대로 축약한 미리보기입니다.
                        </p>

                        <div className="flex flex-wrap items-center gap-4 pt-2">
                            <a
                                href="#samples"
                                className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--brand-primary)] px-6 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(53,90,122,0.25)] transition-colors hover:bg-[var(--brand-primary-hover)]"
                            >
                                질문 예시 보기
                            </a>
                            <Link
                                href="/"
                                className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--border-soft)] px-6 text-sm font-semibold text-[var(--brand-secondary)] transition-colors hover:border-[var(--brand-secondary)] hover:bg-[var(--surface-glass)]"
                            >
                                메인으로 돌아가기
                            </Link>
                        </div>

                        <p className="pt-2 text-sm text-[var(--brand-muted)]">
                            * 게스트 미리보기는 가능하지만, 기록/저장은 로그인 후 이용할 수 있습니다.
                        </p>
                    </div>

                    {/* Flow card */}
                    <div className="rounded-3xl border border-[var(--border-glass)] bg-[var(--surface-glass-strong)] p-6 shadow-[0_24px_48px_rgba(20,30,50,0.12)]">
                        <p className="text-sm uppercase tracking-[0.2em] text-[var(--brand-muted)]">Flow</p>
                        <h2 className="mt-3 text-xl font-semibold text-[var(--text-primary)]">한 세션은 이렇게 흘러갑니다</h2>

                        <div className="mt-4 grid gap-3">
                            {phases.map((p, idx) => (
                                <div
                                    key={p.key}
                                    className="flex items-start gap-3 rounded-2xl border border-[var(--surface-soft-border)] bg-[var(--surface-glass)] p-4"
                                >
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/60 text-xs font-bold text-[var(--brand-secondary)]">
                                        {idx + 1}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-[var(--text-primary)]">{p.key}</p>
                                        <p className="mt-1 text-sm text-[var(--brand-copy)]">{p.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div id="start" className="mt-6 rounded-2xl border border-[var(--surface-soft-border)] bg-[var(--surface-soft)] p-4">
                            <p className="text-sm text-[var(--brand-copy)]">
                                지금은 예시만 제공됩니다. 실제 세션에서는 답변 기록과 간단한 피드백을 함께 제공합니다.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-3">
                                <Link
                                    href="/"
                                    className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-primary)] px-5 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-primary-hover)]"
                                >
                                    면접 시작하기 (로그인)
                                </Link>
                                <Link
                                    href="/how-it-works"
                                    className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--border-soft)] px-5 text-sm font-semibold text-[var(--brand-secondary)] transition-colors hover:border-[var(--brand-secondary)] hover:bg-[var(--surface-glass)]"
                                >
                                    진행 방식 자세히
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Samples */}
                <section
                    id="samples"
                    className="rounded-3xl border border-[var(--border-glass)] bg-[var(--surface-glass)] p-8 shadow-[0_18px_40px_rgba(20,30,50,0.12)]"
                >
                    <div className="flex flex-col gap-2">
                        <p className="text-sm uppercase tracking-[0.2em] text-[var(--brand-muted)]">Samples</p>
                        <h2 className="text-2xl font-semibold text-[var(--text-primary)]">질문 예시</h2>
                        <p className="text-sm text-[var(--brand-copy)]">
                            각 질문마다 “의도”를 함께 제공합니다. 실제 세션에서는 답변에 맞춰 꼬리 질문이 이어집니다.
                        </p>
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-2">
                        {previewQuestions.map((q) => (
                            <article
                                key={`${q.phase}-${q.title}`}
                                className="rounded-2xl border border-[var(--surface-soft-border)] bg-[var(--surface-glass-strong)] p-6"
                            >
                                <div className="flex items-center justify-between gap-4">
                  <span className="rounded-full bg-white/60 px-3 py-1 text-xs font-semibold text-[var(--brand-secondary)]">
                    {q.phase}
                  </span>
                                    <span className="text-xs text-[var(--brand-muted)]">예시</span>
                                </div>

                                <h3 className="mt-4 text-base font-semibold text-[var(--text-primary)]">
                                    Q. {q.title}
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-[var(--brand-copy)]">
                                    <span className="font-semibold text-[var(--text-primary)]">의도</span> — {q.intent}
                                </p>

                                {q.tips?.length ? (
                                    <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-[var(--brand-muted)]">
                                        {q.tips.map((t) => (
                                            <li key={t}>{t}</li>
                                        ))}
                                    </ul>
                                ) : null}
                            </article>
                        ))}
                    </div>

                    {/* Cutoff / tease */}
                    <div className="mt-8 rounded-2xl border border-[var(--surface-soft-border)] bg-[var(--surface-soft)] p-6">
                        <p className="text-sm text-[var(--brand-copy)]">
                            여기까지는 미리보기입니다. 실제 세션에서는 답변에 맞춘 꼬리 질문과 피드백 요약이 이어집니다.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                            <Link
                                href="/"
                                className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-primary)] px-5 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-primary-hover)]"
                            >
                                면접 시작하기 (로그인)
                            </Link>
                            <Link
                                href="/how-it-works"
                                className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--border-soft)] px-5 text-sm font-semibold text-[var(--brand-secondary)] transition-colors hover:border-[var(--brand-secondary)] hover:bg-[var(--surface-glass)]"
                            >
                                진행 방식 자세히 보기
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Footer note */}
                <footer className="pb-4 text-center text-xs text-[var(--brand-muted)]">
                    Mockio Preview · 정적 예시 페이지
                </footer>
            </main>
        </div>
    );
}

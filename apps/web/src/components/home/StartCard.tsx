import KeycloakLogin from "@/components/keycloak-login";

export default function StartCard() {
    return (
        <div
            id="start"
            className="flex flex-col gap-6 rounded-3xl border border-[var(--border-glass)] bg-[var(--surface-glass-strong)] p-6 shadow-[0_24px_48px_rgba(20,30,50,0.12)]"
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-[var(--brand-muted)]">Session</p>
                    <p className="text-2xl font-semibold text-[var(--text-primary)]">바로 시작할까요?</p>
                </div>
                <div className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--brand-secondary)]">
                    5-10분
                </div>
            </div>

            <div className="rounded-2xl border border-[var(--surface-soft-border)] bg-[var(--surface-soft)] p-4 text-sm text-[var(--brand-copy)]">
                다음 연습 세트는 행동 질문과 직무 맞춤 꼬리 질문을 섞어 제공합니다. 기록과 노트 저장을 위해
                로그인하세요.
            </div>

            <KeycloakLogin primaryLabel="면접 시작 (로그인)" />

            <div className="grid gap-3 text-xs text-[var(--brand-muted)]">
                <div className="flex items-center justify-between rounded-full border border-[var(--surface-soft-border)] bg-[var(--surface-glass-strong)] px-4 py-2">
                    <span>연습 스트릭</span>
                    <span className="font-semibold text-[var(--brand-secondary)]">습관 만들기</span>
                </div>
                <div className="flex items-center justify-between rounded-full border border-[var(--surface-soft-border)] bg-[var(--surface-glass-strong)] px-4 py-2">
                    <span>피드백 스타일</span>
                    <span className="font-semibold text-[var(--brand-secondary)]">따뜻 + 직설</span>
                </div>
            </div>
        </div>
    );
}
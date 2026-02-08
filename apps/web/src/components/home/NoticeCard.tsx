type Notice = {
  title: string;
  body: string;
};

type NoticeCardProps = {
  notice?: Notice | null;
};

export function NoticeCard({ notice }: NoticeCardProps) {
  return (
    <div
      id="notice"
      className="rounded-3xl border border-[var(--border-glass)] bg-[var(--surface-glass-strong)] p-6 shadow-[0_18px_40px_rgba(20,30,50,0.12)]"
    >
      <p className="text-sm uppercase tracking-[0.2em] text-[var(--brand-muted)]">
        Notice
      </p>
      <h3 className="mt-3 text-xl font-semibold text-[var(--text-primary)]">
        {notice?.title ?? "공지사항"}
      </h3>
      <p className="mt-2 text-sm text-[var(--brand-copy)]">
        {notice?.body ??
          "이번 주 신규 질문 세트가 추가되었습니다. 게스트로 확인해보고 마음에 들면 시작해보세요."}
      </p>
    </div>
  );
}
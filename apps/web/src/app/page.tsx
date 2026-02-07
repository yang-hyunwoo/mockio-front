import Image from "next/image";

import KeycloakLogin from "@/components/keycloak-login";

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_10%_-10%,var(--tint-mint),transparent_60%),radial-gradient(900px_500px_at_90%_10%,var(--tint-sky),transparent_55%),linear-gradient(180deg,var(--tint-cream),var(--tint-ice))] text-[var(--text-primary)]">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-16 px-6 py-10 lg:py-14">
        <header className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div>
              <Image src="/branding/mockio-text-logo.png" alt="Mockio" width={120} height={24} />
            </div>
            <nav className="hidden items-center gap-5 text-sm font-medium text-[var(--brand-muted)] lg:flex">
              <a href="#notice" className="transition-colors hover:text-[var(--text-primary)]">
                공지사항
              </a>
              <a href="#profile" className="transition-colors hover:text-[var(--text-primary)]">
                내 정보
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="#preview"
              className="inline-flex h-10 items-center rounded-full border border-[var(--border-soft)] px-4 text-sm font-medium text-[var(--brand-secondary)] transition-colors hover:border-[var(--brand-secondary)] hover:bg-[var(--surface-glass)]"
            >
              게스트 미리보기
            </a>
            <a
              href="#start"
              className="inline-flex h-10 items-center rounded-full bg-[var(--brand-primary)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-primary-hover)]"
            >
              면접 시작
            </a>
          </div>
        </header>

        <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h1 className="text-4xl font-semibold leading-tight text-[var(--text-primary)] sm:text-5xl">
                차분한 코칭과 명확한 구조로 면접을 연습하세요.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-[var(--brand-copy)]">
                부담은 낮추고, 답변을 기록하고, 다음 작은 성장을 만드는 피드백을 받으세요. 게스트
                미리보기는 가능하지만 기록과 저장은 로그인 후 가능합니다.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#preview"
                className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--brand-primary)] px-6 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(53,90,122,0.25)] transition-colors hover:bg-[var(--brand-primary-hover)]"
              >
                질문 미리보기
              </a>
              <button
                type="button"
                className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--border-soft)] px-6 text-sm font-semibold text-[var(--brand-secondary)] transition-colors hover:border-[var(--brand-secondary)] hover:bg-[var(--surface-glass)]"
              >
                진행 방식 보기
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  title: "직무 맞춤 세션",
                  desc: "목표 직무와 레벨에 맞춘 질문을 제공합니다.",
                },
                {
                  title: "부담 낮은 루틴",
                  desc: "짧은 세션으로 일상 속에서 꾸준히 연습합니다.",
                },
                {
                  title: "실행 가능한 피드백",
                  desc: "명확성, 구조, 깊이를 바로 개선할 수 있게 안내합니다.",
                },
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
              다음 연습 세트는 행동 질문과 직무 맞춤 꼬리 질문을 섞어 제공합니다. 기록과 노트
              저장을 위해 로그인하세요.
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
        </section>

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
          <div className="flex flex-col gap-4 rounded-2xl border border-[var(--surface-soft-border)] bg-[var(--surface-glass-strong)] p-5">
            <p className="text-sm font-semibold text-[var(--text-primary)]">1. 워밍업 질문</p>
            <p className="text-sm text-[var(--brand-copy)]">부담 낮은 질문으로 리듬을 잡습니다.</p>
          </div>
          <div className="flex flex-col gap-4 rounded-2xl border border-[var(--surface-soft-border)] bg-[var(--surface-glass-strong)] p-5">
            <p className="text-sm font-semibold text-[var(--text-primary)]">2. 딥다이브</p>
            <p className="text-sm text-[var(--brand-copy)]">구조화된 꼬리 질문으로 답변을 다듬습니다.</p>
          </div>
          <div className="flex flex-col gap-4 rounded-2xl border border-[var(--surface-soft-border)] bg-[var(--surface-glass-strong)] p-5 md:col-start-2">
            <p className="text-sm font-semibold text-[var(--text-primary)]">3. 피드백 스냅샷</p>
            <p className="text-sm text-[var(--brand-copy)]">명확성, 구조, 자신감에 대한 핵심 정리.</p>
          </div>
          <div className="flex flex-col gap-4 rounded-2xl border border-[var(--surface-soft-border)] bg-[var(--surface-glass-strong)] p-5">
            <p className="text-sm font-semibold text-[var(--text-primary)]">4. 다음 액션</p>
            <p className="text-sm text-[var(--brand-copy)]">다음 세션을 위한 작은 목표를 제시합니다.</p>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div
            id="notice"
            className="rounded-3xl border border-[var(--border-glass)] bg-[var(--surface-glass-strong)] p-6 shadow-[0_18px_40px_rgba(20,30,50,0.12)]"
          >
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--brand-muted)]">Notice</p>
            <h3 className="mt-3 text-xl font-semibold text-[var(--text-primary)]">공지사항</h3>
            <p className="mt-2 text-sm text-[var(--brand-copy)]">
              이번 주 신규 질문 세트가 추가되었습니다. 게스트로 확인해보고 마음에 들면
              시작해보세요.
            </p>
          </div>
          <div
            id="profile"
            className="rounded-3xl border border-[var(--border-glass)] bg-[var(--surface-glass-strong)] p-6 shadow-[0_18px_40px_rgba(20,30,50,0.12)]"
          >
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--brand-muted)]">Profile</p>
            <h3 className="mt-3 text-xl font-semibold text-[var(--text-primary)]">내 정보</h3>
            <p className="mt-2 text-sm text-[var(--brand-copy)]">
              로그인 후 연습 기록, 피드백 리포트, 목표 설정을 확인할 수 있습니다.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

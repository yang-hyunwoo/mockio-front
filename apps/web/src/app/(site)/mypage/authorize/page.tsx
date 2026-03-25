"use client";

import MyPageAuthorizeSection from "@/components/mypage/MyPageAuthorizeSection";

export default function MyPageAuthorizePage() {
    return (
        <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-[28px] border border-black/5 bg-white/70 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/70">
                <div className="border-b border-black/5 px-6 py-8 dark:border-white/10 sm:px-8">
                    <p className="text-sm font-semibold tracking-[0.18em] text-(--brand-primary)">
                        SECURITY
                    </p>

                    <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                        보안 설정
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-(--brand-muted)">
                        계정 보안과 관련된 설정을 관리합니다. 비밀번호를 변경하거나
                        회원 탈퇴를 진행할 수 있습니다.
                    </p>
                </div>

                <div className="px-6 py-6 sm:px-8">
                    <MyPageAuthorizeSection />
                </div>
            </div>
        </section>
    );
}
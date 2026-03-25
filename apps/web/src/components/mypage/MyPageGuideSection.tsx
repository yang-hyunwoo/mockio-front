"use client";

import { Shield } from "lucide-react";

export default function MyPageGuideSection() {
    return (
        <div className="border-t border-black/5 px-6 py-6 dark:border-white/10 sm:px-8">
            <section className="rounded-[24px] border border-black/5 bg-white/70 p-5 dark:border-white/10 dark:bg-white/3">
                <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-(--brand-primary)" />
                    <h2 className="text-lg font-semibold text-foreground">안내</h2>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl bg-black/3 px-4 py-3 text-sm leading-6 text-(--brand-muted) dark:bg-white/4">
                        내 정보와 면접 설정은 각각 별도로 저장됩니다.
                    </div>
                    <div className="rounded-2xl bg-black/3 px-4 py-3 text-sm leading-6 text-(--brand-muted) dark:bg-white/4">
                        변경한 면접 설정은 다음 면접부터 기본값으로 반영됩니다.
                    </div>
                    <div className="rounded-2xl bg-black/3 px-4 py-3 text-sm leading-6 text-(--brand-muted) dark:bg-white/4">
                        답변 시간과 질문 개수는 연습 세션의 기본 진행 방식에 적용됩니다.
                    </div>
                </div>
            </section>
        </div>
    );
}

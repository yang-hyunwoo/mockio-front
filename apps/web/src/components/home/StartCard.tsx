"use client";

import Login from "@/components/Login";
import { useAuth } from "@/lib/api/home/useAuth";
import { useEffect, useState } from "react";
import { interviewPreferenceApi } from "@/lib/api/home/interviewPreference";
import { Preference } from "@mockio/shared/src/api/home/Preference";

type AuthState = "loading" | "authenticated" | "unauthenticated";

export default function StartCard() {
    const { authState, username } = useAuth();
    const [pref, setPref] = useState<Preference | null>(null);
    const [prefLoading, setPrefLoading] = useState(false);
    const [prefError, setPrefError] = useState<string | null>(null);
    const isAuthed = authState === "authenticated";

    useEffect(() => {
        if (!isAuthed) {
            setPref(null);
            return;
        }

        let cancelled = false;
        setPrefLoading(true);
        setPrefError(null);

        interviewPreferenceApi()
            .then((data) => {
                if (cancelled) return;
                if (!data) {
                    setPrefError("failed");
                    setPref(null);
                    return;
                }
                setPref(data);
            })
            .catch((e) => {
                if (cancelled) return;
                setPrefError(e?.message ?? "failed");
                setPref(null);
            })
            .finally(() => {
                if (cancelled) return;
                setPrefLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [isAuthed]);

    return (
        <div id="start"
             className="flex flex-col gap-6 rounded-3xl border border-(--border-glass) bg-(--surface-glass-strong) p-6 shadow-[0_24px_48px_rgba(20,30,50,0.12)]"
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-(--brand-muted)">
                        Session
                    </p>
                    <p className="text-2xl font-semibold text-foreground">
                        바로 시작할까요?
                    </p>
                </div>
                <div
                    className="rounded-full bg-(--accent-soft) px-3 py-1 text-xs font-semibold text-(--brand-secondary)">
                    5-10분
                </div>
            </div>

            {/* 로그인 여부에 따라 안내 문구 변경 */}
            <div
                className="rounded-2xl border border-(--surface-soft-border) bg-(--surface-soft) p-4 text-sm text-(--brand-copy)">
                {authState === "loading" ? (
                    <>로그인 상태 확인 중...</>
                ) : isAuthed ? (
                    <>
                        <span>안녕하세요!<br/></span>
                        <span className="font-semibold text-(--brand-secondary)">
                            {username ? `${username} 님` : "로그인 사용자"} <br/>
                        </span>
                        <span>바로 연습을 시작하실 수 있어요.</span>
                    </>
                ) : (
                    <>
                        다음 연습 세트는 행동 질문과 직무 맞춤 꼬리 질문을 섞어 제공합니다. 기록과 노트 저장을 위해
                        로그인하세요.
                    </>
                )}
            </div>
            {isAuthed && (
                <div className="grid gap-3 text-xs text-(--brand-muted)">
                    <div
                        className="flex items-center justify-between rounded-full border border-(--surface-soft-border) bg-(--surface-glass-strong) px-4 py-2">
                        <span>면접 유형 (난이도)</span>
                        <span className="font-semibold text-(--brand-secondary)">
                            {prefLoading ? "불러오는 중..." : prefError ? "불러오기 실패" : pref ? `${pref.trackLabel} (${pref.difficultyLabel})` : "-"}
                        </span>
                    </div>
                    <div
                        className="flex items-center justify-between rounded-full border border-(--surface-soft-border) bg-(--surface-glass-strong) px-4 py-2">
                        <span>피드백 스타일</span>
                        <span className="font-semibold text-(--brand-secondary)">
                              {prefLoading ? "불러오는 중..." : prefError ? "불러오기 실패" : pref?.feedbackStyleLabel ?? "-"}
                        </span>
                    </div>
                </div>
            )}

            <Login primaryLabel={isAuthed ? "면접 시작" : "면접 시작 (로그인)"}/>
        </div>
    );
}

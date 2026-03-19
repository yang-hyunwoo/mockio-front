"use client";

import { useEffect, useState } from "react";
import Login from "@/components/Login";
import { useAuth } from "@/lib/api/home/useAuth";
import { interviewPreferenceApi } from "@/lib/api/home/interviewPreference";
import { Preference } from "@mockio/shared/src/api/home/Preference";
import {logoutApi} from "@/lib/api/home/LogoutApi";

interface StartCardProps {
    isLogin: boolean;
}

export default function StartCard({ isLogin }: StartCardProps) {
    const { authState, username } = useAuth({ enabled: isLogin });

    const [pref, setPref] = useState<Preference | null>(null);
    const [prefLoading, setPrefLoading] = useState(false);
    const [prefError, setPrefError] = useState<string | null>(null);

    const isAuthed = authState === "authenticated";

    useEffect(() => {
        if (!isAuthed) {
            setPref(null);
            setPrefError(null);
            setPrefLoading(false);
            return;
        }

        let cancelled = false;

        setPrefLoading(true);
        setPrefError(null);

        interviewPreferenceApi()
            .then((data) => {
                if (cancelled) return;

                if (!data) {
                    setPref(null);
                    setPrefError("failed");
                    return;
                }

                setPref(data);
            })
            .catch((e) => {
                if (cancelled) return;

                setPref(null);
                setPrefError(e?.message ?? "failed");
            })
            .finally(() => {
                if (cancelled) return;
                setPrefLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [isAuthed]);

    const handleLogout = async () => {
        try {
            await logoutApi();
            window.location.href = "/";
        } catch (e) {
            console.error("로그아웃 실패", e);
        }
    };

    let interviewTypeText = "-";
    if (prefLoading) {
        interviewTypeText = "불러오는 중...";
    } else if (prefError) {
        interviewTypeText = "불러오기 실패";
    } else if (pref) {
        interviewTypeText = `${pref.trackLabel} (${pref.difficultyLabel})`;
    }

    let feedbackStyleText = "-";
    if (prefLoading) {
        feedbackStyleText = "불러오는 중...";
    } else if (prefError) {
        feedbackStyleText = "불러오기 실패";
    } else if (pref?.feedbackStyleLabel) {
        feedbackStyleText = pref.feedbackStyleLabel;
    }

    let sessionContent;

    if (authState === "loading") {
        sessionContent = <>로그인 상태 확인 중...</>;
    } else if (isAuthed) {
        sessionContent = (
            <>
                <div className="flex items-start justify-between">
                    <span>안녕하세요!</span>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="rounded-full border border-(--brand-secondary) px-3 py-1 text-xs font-semibold text-(--brand-secondary) transition hover:bg-(--brand-secondary) hover:text-white"
                    >
                        로그아웃
                    </button>
                </div>

                <span className="font-semibold text-(--brand-secondary)">
                    {username ? `${username} 님` : "로그인 사용자"}
                    <br />
                </span>

                <span>바로 연습을 시작하실 수 있어요.</span>
            </>
        );
    } else {
        sessionContent = (
            <>
                다음 연습 세트는 행동 질문과 직무 맞춤 꼬리 질문을 섞어 제공합니다.
                기록과 노트 저장을 위해 로그인하세요.
            </>
        );
    }

    return (
        <div
            id="start"
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

                <div className="rounded-full bg-(--accent-soft) px-3 py-1 text-xs font-semibold text-(--brand-secondary)">
                    5-10분
                </div>
            </div>

            <div className="rounded-2xl border border-(--surface-soft-border) bg-(--surface-soft) p-4 text-sm text-(--brand-copy)">
                {sessionContent}
            </div>

            {isAuthed && (
                <div className="grid gap-3 text-xs text-(--brand-muted)">
                    <div className="flex items-center justify-between rounded-full border border-(--surface-soft-border) bg-(--surface-glass-strong) px-4 py-2">
                        <span>면접 유형 (난이도)</span>
                        <span className="font-semibold text-(--brand-secondary)">
                            {interviewTypeText}
                        </span>
                    </div>

                    <div className="flex items-center justify-between rounded-full border border-(--surface-soft-border) bg-(--surface-glass-strong) px-4 py-2">
                        <span>피드백 스타일</span>
                        <span className="font-semibold text-(--brand-secondary)">
                            {feedbackStyleText}
                        </span>
                    </div>
                </div>
            )}

            <Login primaryLabel={isAuthed ? "면접 시작" : "면접 시작 (로그인)"} />
        </div>
    );
}
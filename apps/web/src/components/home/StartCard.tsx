"use client";

import { useEffect, useState } from "react";
import Login from "@/components/Login";
import { interviewPreferenceApi } from "@/lib/api/home/interviewPreference";
import { Preference } from "@mockio/shared/src/api/home/Preference";
import { logoutApi } from "@/lib/api/home/LogoutApi";
import { useAuthStore } from "@/store/authStore";
import {useRouter} from "next/navigation";

export default function StartCard() {
    const { user, accessToken, isInitialized, clearAuth } = useAuthStore();
    const router = useRouter()
    const nickname = user?.nickname;
    const isAuthed = !!accessToken;
    const [open, setOpen] = useState(false);
    const [pref, setPref] = useState<Preference | null>(null);
    const [prefLoading, setPrefLoading] = useState(false);
    const [prefError, setPrefError] = useState<string | null>(null);

    useEffect(() => {
        if (!isInitialized) return;

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
    }, [isInitialized, isAuthed]);

    const handleLogout = async () => {
        try {
            await logoutApi();
        } catch (e) {
            console.error("로그아웃 실패", e);
        } finally {
            sessionStorage.setItem("skipAuthInitOnce", "true");
            useAuthStore.getState().clearAuth();
            window.location.href = "/";
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

    if (!isInitialized) {
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
          {nickname ? `${nickname} 님` : "로그인 사용자"}
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

                {isAuthed && (
                    <div className="rounded-full bg-(--accent-soft) px-3 py-1 text-xs font-semibold text-(--brand-secondary)">
                        설정에 맞춰 유연하게 진행
                    </div>
                )}
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

            {isAuthed ? (
                <button
                    onClick={() => setOpen(true)}
                    className="w-full rounded-2xl bg-(--brand-secondary) px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                    면접 시작
                </button>
            ) : (
                <Login primaryLabel="로그인" />
            )}

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-md">

                        <h2 className="text-lg font-bold mb-4">AI 면접 안내</h2>

                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            면접 답변 및 음성 데이터는 AI 분석을 위해 외부 서비스에서 처리될 수 있습니다.
                        </p>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setOpen(false)}
                                className="px-4 py-2 text-sm bg-gray-300 rounded"
                            >
                                취소
                            </button>

                            <button
                                onClick={() => {
                                    setOpen(false);
                                    router.push("/interview");
                                }}
                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded"
                            >
                                동의하고 시작
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

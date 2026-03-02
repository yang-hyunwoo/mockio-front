"use client"

import InterviewCarousel from "@/components/home/InterviewCarousel";
import { useAuth } from "@/lib/api/home/useAuth";
import {Interview} from "@mockio/shared/src/api/home/Interview";
import {interviewListApi} from "@/lib/api/home/InterviewListApi";
import { useEffect, useState } from "react";

interface ProfileCardProps {
    isLogin: boolean
    interviews?: Interview[]
}

export function ProfileCard() {
    const { authState, username } = useAuth();

    const isAuthed = authState === "authenticated";

    const [interviews, setInterviews] = useState<Interview[]>([])

    useEffect(() => {
        let cancelled = false
        if (!isAuthed) return

        interviewListApi()
            .then((res) => {
                if (cancelled) return

                const payload = (res as any)?.data ?? res
                console.log("interviews:", payload)

                setInterviews(payload)
            })
            .catch((e) => {
                if (cancelled) return
                console.error(e)
                setInterviews([])
            })

        return () => {
            cancelled = true
        }
    }, [isAuthed])

    return (
        <div
            id="profile"
            className="rounded-3xl border border-[var(--border-glass)] bg-[var(--surface-glass-strong)] p-6 shadow-[0_18px_40px_rgba(20,30,50,0.12)]"
        >
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--brand-muted)]">
                Profile
            </p>

            <h3 className="mt-3 text-xl font-semibold text-[var(--text-primary)]">
                진행중인 면접
            </h3>

            {!isAuthed ? (
                <p className="mt-2 text-sm text-[var(--brand-copy)]">
                    로그인 후 연습 기록, 피드백 리포트, 목표 설정을 확인할 수 있습니다.
                </p>
            ) : (
                <InterviewCarousel
                    interviews={interviews}
                />
            )}
        </div>
    );
}
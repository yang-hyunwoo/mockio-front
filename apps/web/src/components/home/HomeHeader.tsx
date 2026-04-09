"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/Common/Button";
import NotificationDropdown from "@/components/home/NotificationDropdown";
import { useAuthStore } from "@/store/authStore";
import {useRouter} from "next/navigation";
import {Preference} from "@mockio/shared/src/api/home/Preference";
import {interviewPreferenceApi} from "@/lib/api/home/interviewPreference";

export default function HomeHeader() {
    const accessToken = useAuthStore((s) => s.accessToken);
    const isInitialized = useAuthStore((s) => s.isInitialized);
    const isLogin = !!accessToken;
    const router = useRouter()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileInterviewOpen, setMobileInterviewOpen] = useState(false);
    const [mobileMyInfoOpen, setMobileMyInfoOpen] = useState(false);
    const [open, setOpen] = useState(false);
    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
        setMobileInterviewOpen(false);
        setMobileMyInfoOpen(false);
    };
    const [pref, setPref] = useState<Preference | null>(null);

    useEffect(() => {
        if (!mobileMenuOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                closeMobileMenu();
            }
        };

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleEscape);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener("keydown", handleEscape);
        };
    }, [mobileMenuOpen]);


    useEffect(() => {
        if (!isInitialized) return;

        if (!isLogin) {
            setPref(null);
            return;
        }

        let cancelled = false;


        interviewPreferenceApi()
            .then((data) => {
                if (cancelled) return;

                if (!data) {
                    setPref(null);
                    return;
                }

                setPref(data);
            })
            .catch((e) => {
                if (cancelled) return;
                setPref(null);
            })
            .finally(() => {
                if (cancelled) return;
            });

        return () => {
            cancelled = true;
        };
    }, [isInitialized, isLogin,open]);


    const interviewKeyword = pref?.interviewKeyword ?? [];
    const hasKeyword = interviewKeyword.length > 0;

    return (
        <>
            <header className="flex items-center justify-between gap-3 md:gap-6">
                <div className="flex min-w-0 items-center gap-3 md:gap-6">
                    <Link href="/" className="inline-flex shrink-0 items-center">
                        <Image
                            src="/branding/mockio-text-logo.png"
                            alt="Mockio"
                            width={120}
                            height={24}
                            priority
                            className="h-auto w-[100px] sm:w-[120px]"
                        />
                    </Link>

                    <nav className="hidden items-center gap-4 text-sm font-medium lg:flex">
                        <Link
                            href="/notice"
                            className="text-(--brand-muted) transition-colors hover:text-foreground"
                        >
                            공지사항
                        </Link>

                        <Link
                            href="/faq"
                            className="text-(--brand-muted) transition-colors hover:text-foreground"
                        >
                            FAQ
                        </Link>

                        {isInitialized && isLogin && (
                            <>
                                <div className="relative group">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto px-0 font-medium text-(--brand-muted) hover:text-foreground"
                                        rightIcon={
                                            <span className="text-[10px] opacity-70 transition-transform group-hover:rotate-180">
                                                ▾
                                            </span>
                                        }
                                    >
                                        AI 면접
                                    </Button>

                                    <div className="absolute left-0 top-full z-50 hidden pt-3 group-hover:block">
                                        <div className="min-w-56 overflow-hidden rounded-2xl border border-white/30 bg-white/90 shadow-[0_18px_40px_rgba(20,30,50,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/90">
                                            <button
                                                onClick={() => setOpen(true)}
                                                className="block px-4 py-3 text-sm w-full text-left hover:bg-white/50"
                                            >
                                                면접 시작
                                                <p className="mt-1 text-xs text-gray-500">
                                                    새로운 AI 면접을 시작합니다
                                                </p>
                                            </button>
                                            <div className="h-px bg-black/5 dark:bg-white/10" />

                                            <Link
                                                href="/interview/history"
                                                className="block px-4 py-3 text-sm transition-colors hover:bg-white/50 dark:hover:bg-white/5"
                                            >
                                                면접 내역
                                                <p className="mt-1 block text-xs text-gray-500">
                                                    이전 면접 결과와 진행 내역을 확인합니다
                                                </p>
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative group">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto px-0 font-medium text-(--brand-muted) hover:text-foreground"
                                        rightIcon={
                                            <span className="text-[10px] opacity-70 transition-transform group-hover:rotate-180">
                                                ▾
                                            </span>
                                        }
                                    >
                                        내 정보
                                    </Button>

                                    <div className="absolute left-0 top-full z-50 hidden pt-3 group-hover:block">
                                        <div className="min-w-56 overflow-hidden rounded-2xl border border-white/30 bg-white/90 shadow-[0_18px_40px_rgba(20,30,50,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/90">
                                            <Link
                                                href="/mypage"
                                                className="block px-4 py-3 text-sm transition-colors hover:bg-white/50 dark:hover:bg-white/5"
                                            >
                                                내 정보
                                                <p className="mt-1 text-xs text-gray-500">
                                                    면접 정보 및 내 정보를 수정합니다
                                                </p>
                                            </Link>

                                            <div className="h-px bg-black/5 dark:bg-white/10" />

                                            <Link
                                                href="/mypage/interview/history"
                                                className="block px-4 py-3 text-sm transition-colors hover:bg-white/50 dark:hover:bg-white/5"
                                            >
                                                면접 기록
                                                <p className="mt-1 block text-xs text-gray-500">
                                                    면접 평가 내역을 확인합니다
                                                </p>
                                            </Link>
                                            <Link
                                                href="/mypage/authorize"
                                                className="block px-4 py-3 text-sm transition-colors hover:bg-white/50 dark:hover:bg-white/5"
                                            >
                                                보안
                                                <p className="mt-1 block text-xs text-gray-500">
                                                    비밀번호 변경 및 회원 탈퇴를 합니다.
                                                </p>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </nav>
                </div>

                <div className="hidden items-center gap-3 sm:gap-4 lg:flex">
                    {isInitialized && isLogin && (
                        <>
                            <NotificationDropdown />
                            <div className="h-px bg-black/5 dark:bg-white/10" />
                        </>
                    )}
                </div>

                <button
                    type="button"
                    aria-label="메뉴 열기"
                    aria-expanded={mobileMenuOpen}
                    onClick={() => setMobileMenuOpen(true)}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-(--border-soft) bg-white/70 text-foreground shadow-sm transition hover:bg-white dark:bg-zinc-900/70 dark:hover:bg-zinc-900 lg:hidden"
                >
                    <span className="text-lg leading-none">☰</span>
                </button>
            </header>

            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[100] lg:hidden">
                    <button
                        type="button"
                        aria-label="메뉴 닫기"
                        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
                        onClick={closeMobileMenu}
                    />

                    <aside className="absolute right-0 top-0 flex h-full w-full max-w-[340px] flex-col bg-white shadow-2xl dark:bg-zinc-950">
                        <div className="flex items-center justify-between border-b border-black/5 px-5 py-4 dark:border-white/10">
                            <Link
                                href="/"
                                className="inline-flex items-center"
                                onClick={closeMobileMenu}
                            >
                                <Image
                                    src="/branding/mockio-text-logo.png"
                                    alt="Mockio"
                                    width={110}
                                    height={22}
                                    className="h-auto w-[110px]"
                                />
                            </Link>

                            <button
                                type="button"
                                aria-label="메뉴 닫기"
                                onClick={closeMobileMenu}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--border-soft) text-foreground transition hover:bg-black/5 dark:hover:bg-white/5"
                            >
                                <span className="text-lg leading-none">✕</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-5 py-5">
                            <nav className="space-y-2">
                                <Link
                                    href="/notice"
                                    onClick={closeMobileMenu}
                                    className="block rounded-2xl px-4 py-3 text-sm font-medium text-foreground transition hover:bg-black/5 dark:hover:bg-white/5"
                                >
                                    공지사항
                                </Link>

                                <Link
                                    href="/faq"
                                    onClick={closeMobileMenu}
                                    className="block rounded-2xl px-4 py-3 text-sm font-medium text-foreground transition hover:bg-black/5 dark:hover:bg-white/5"
                                >
                                    FAQ
                                </Link>

                                {isInitialized && isLogin && (
                                    <>
                                        <div className="overflow-hidden rounded-2xl border border-black/5 dark:border-white/10">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setMobileInterviewOpen((prev) => !prev)
                                                }
                                                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground transition hover:bg-black/5 dark:hover:bg-white/5"
                                            >
                                                <span>AI 면접</span>
                                                <span
                                                    className={`text-xs transition-transform ${
                                                        mobileInterviewOpen
                                                            ? "rotate-180"
                                                            : ""
                                                    }`}
                                                >
                                                    ▾
                                                </span>
                                            </button>

                                            {mobileInterviewOpen && (
                                                <div className="border-t border-black/5 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.02]">
                                                    <button
                                                        onClick={() => {
                                                            closeMobileMenu();
                                                            setOpen(true);
                                                        }}
                                                        className="block px-4 py-3 text-sm w-full text-left hover:bg-white/50"
                                                    >
                                                        면접 시작
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            새로운 AI 면접을 시작합니다
                                                        </p>
                                                    </button>
                                                    <div className="h-px bg-black/5 dark:bg-white/10" />


                                                    <Link
                                                        href="/interview/history"
                                                        onClick={closeMobileMenu}
                                                        className="block px-4 py-3 text-sm text-foreground transition hover:bg-black/5 dark:hover:bg-white/5"
                                                    >
                                                        면접 내역
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            이전 면접 결과와 진행 내역을 확인합니다
                                                        </p>
                                                    </Link>
                                                </div>
                                            )}
                                        </div>

                                        <div className="overflow-hidden rounded-2xl border border-black/5 dark:border-white/10">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setMobileMyInfoOpen((prev) => !prev)
                                                }
                                                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground transition hover:bg-black/5 dark:hover:bg-white/5"
                                            >
                                                <span>내 정보</span>
                                                <span
                                                    className={`text-xs transition-transform ${
                                                        mobileMyInfoOpen
                                                            ? "rotate-180"
                                                            : ""
                                                    }`}
                                                >
                                                    ▾
                                                </span>
                                            </button>

                                            {mobileMyInfoOpen && (
                                                <div className="border-t border-black/5 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.02]">
                                                    <Link
                                                        href="/mypage"
                                                        onClick={closeMobileMenu}
                                                        className="block px-4 py-3 text-sm text-foreground transition hover:bg-black/5 dark:hover:bg-white/5"
                                                    >
                                                        내 정보
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            면접 정보 및 내 정보를 수정합니다
                                                        </p>
                                                    </Link>

                                                    <div className="h-px bg-black/5 dark:bg-white/10" />

                                                    <Link
                                                        href="/mypage/interview/history"
                                                        onClick={closeMobileMenu}
                                                        className="block px-4 py-3 text-sm text-foreground transition hover:bg-black/5 dark:hover:bg-white/5"
                                                    >
                                                        면접 기록
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            면접 평가 내역을 확인합니다
                                                        </p>
                                                    </Link>
                                                    <Link
                                                        href="/mypage/authorize"
                                                        onClick={closeMobileMenu}
                                                        className="block px-4 py-3 text-sm transition-colors hover:bg-white/50 dark:hover:bg-white/5"
                                                    >
                                                        보안
                                                        <p className="mt-1 block text-xs text-gray-500">
                                                            비밀번호 변경 및 회원 탈퇴를 합니다.
                                                        </p>
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </nav>
                        </div>

                        <div className="border-t border-black/5 px-5 py-4 dark:border-white/10">
                            {isInitialized && isLogin ? (
                                <div className="space-y-3">
                                    <div className="flex justify-start">
                                        <NotificationDropdown />
                                    </div>

                                    <button
                                        onClick={() => {
                                            closeMobileMenu();
                                            setOpen(true);
                                        }}
                                        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-(--brand-primary) px-4 text-sm font-semibold text-white transition-colors hover:bg-(--brand-primary-hover)"
                                    >
                                        면접 시작

                                    </button>

                                </div>
                            ) : (
                                <></>
                            )}
                        </div>
                    </aside>
                </div>
            )}

            {open && (
                <div onClick={() => setOpen(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-md">

                        <h2 className="text-lg font-bold mb-4">AI 면접 안내</h2>

                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            면접 답변 및 음성 데이터는 AI 분석을 위해 외부 서비스에서 처리될 수 있습니다.
                        </p>
                        {/* 키워드 안내 (없을 때만) */}
                        {!hasKeyword && (
                            <div className="mt-4 mb-5 rounded-xl bg-blue-50 p-3 text-sm text-blue-700">
                                면접 키워드를 설정하면 사용자의 기술 스택에 맞는 더 정확한 질문을 받을 수 있습니다.
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setOpen(false)}
                                className="mr-auto px-4 py-2 text-sm text-gray-400 hover:text-gray-600"
                            >
                                취소
                            </button>

                            {!hasKeyword && (
                                <button
                                    onClick={() => {
                                        setOpen(false);
                                        router.push("/mypage");
                                    }}
                                    className="px-4 py-2 text-sm font-semibold text-blue-600 border border-blue-600 rounded-xl"
                                >
                                    키워드 설정하기
                                </button>
                            )}

                            <button
                                onClick={() => {
                                    setOpen(false);
                                    router.push("/interview");
                                }}
                                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl"
                            >
                                {hasKeyword ? "동의하고 시작" : "그냥 시작하기"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>


    );
}

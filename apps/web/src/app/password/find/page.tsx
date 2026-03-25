"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react"
import {PasswordResetApi} from "@/lib/api/password/PasswordResetApi";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const trimmedEmail = email.trim()

        if (!trimmedEmail) {
            setError("이메일을 입력해 주세요.")
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(trimmedEmail)) {
            setError("올바른 이메일 형식을 입력해 주세요.")
            return
        }

        try {
            setLoading(true)
            setError("")

            await PasswordResetApi({ email: trimmedEmail })
            await new Promise((resolve) => setTimeout(resolve, 700))

            setSubmitted(true)
        } catch (err) {
            console.error("비밀번호 재설정 요청 실패", err)
            setError("재설정 요청에 실패했습니다. 잠시 후 다시 시도해 주세요.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(1000px_500px_at_0%_0%,rgba(99,102,241,0.12),transparent_55%),radial-gradient(800px_420px_at_100%_0%,rgba(14,165,233,0.12),transparent_50%),linear-gradient(180deg,var(--background),var(--background))] px-4 py-10 text-foreground sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-5xl">
                <Link
                    href="/login"
                    className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--brand-muted)] transition hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    로그인으로 돌아가기
                </Link>

                <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                    <section className="rounded-3xl border border-white/10 bg-[var(--surface-glass-strong)] p-8 shadow-[0_24px_48px_rgba(20,30,50,0.12)] backdrop-blur">
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-muted)]">
                            Password Reset
                        </p>
                        <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
                            비밀번호를
                            <br />
                            다시 설정해 보세요
                        </h1>
                        <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--brand-muted)] sm:text-base">
                            가입한 이메일을 입력하면 비밀번호 재설정 링크를 보내드립니다.
                            일반 회원가입 계정만 비밀번호 재설정이 가능하며, 소셜 로그인 계정은 해당
                            제공자의 로그인 방식을 이용해 주세요.
                        </p>

                        <div className="mt-8 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                    <Mail className="h-4 w-4" />
                                    이메일 확인
                                </div>
                                <p className="mt-2 text-sm leading-6 text-[var(--brand-muted)]">
                                    가입한 이메일 주소로 재설정 링크가 전송됩니다.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                    <ShieldCheck className="h-4 w-4" />
                                    1회용 링크
                                </div>
                                <p className="mt-2 text-sm leading-6 text-[var(--brand-muted)]">
                                    링크는 일정 시간 후 만료되며, 한 번 사용하면 다시 사용할 수 없습니다.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-3xl border border-white/10 bg-[var(--surface-glass-strong)] p-6 shadow-[0_24px_48px_rgba(20,30,50,0.12)] sm:p-8">
                        {!submitted ? (
                            <>
                                <div>
                                    <p className="text-sm font-semibold text-[var(--brand-muted)]">이메일 입력</p>
                                    <h2 className="mt-2 text-2xl font-semibold">재설정 링크 보내기</h2>
                                    <p className="mt-3 text-sm leading-6 text-[var(--brand-muted)]">
                                        이메일을 입력하면 비밀번호 재설정 링크를 발송합니다.
                                        보안을 위해 가입 여부와 관계없이 비슷한 안내 문구가 표시됩니다.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                                    <div>
                                        <label htmlFor="email" className="mb-2 block text-sm font-medium">
                                            이메일
                                        </label>
                                        <div className="flex h-12 items-center rounded-2xl border border-white/10 bg-white/5 px-4 focus-within:border-[var(--brand-primary)] focus-within:ring-2 focus-within:ring-[var(--brand-primary)]/20">
                                            <Mail className="mr-3 h-4 w-4 text-[var(--brand-muted)]" />
                                            <input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="name@example.com"
                                                className="h-full w-full bg-transparent text-sm outline-none placeholder:text-[var(--brand-muted)]"
                                                autoComplete="email"
                                            />
                                        </div>
                                        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[var(--brand-primary)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--brand-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {loading ? "전송 중..." : "재설정 링크 보내기"}
                                    </button>
                                </form>

                                <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm leading-6 text-amber-200">
                                    네이버/구글로 가입한 계정은 비밀번호 재설정을 지원하지 않습니다. 해당 소셜
                                    로그인 버튼으로 다시 로그인해 주세요.
                                </div>
                            </>
                        ) : (
                            <div className="flex h-full flex-col justify-center">
                                <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6">
                                    <div className="flex items-center gap-2 text-emerald-300">
                                        <ShieldCheck className="h-5 w-5" />
                                        <p className="text-sm font-semibold">요청이 접수되었습니다</p>
                                    </div>
                                    <h2 className="mt-3 text-2xl font-semibold">이메일을 확인해 주세요</h2>
                                    <p className="mt-3 text-sm leading-7 text-[var(--brand-muted)]">
                                        입력하신 이메일로 비밀번호 재설정 안내를 발송했습니다. 메일이 보이지 않으면
                                        스팸함도 함께 확인해 주세요.
                                    </p>
                                </div>

                                <div className="mt-6 space-y-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSubmitted(false)
                                            setEmail("")
                                            setError("")
                                        }}
                                        className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-medium transition hover:bg-white/10"
                                    >
                                        다른 이메일로 다시 시도
                                    </button>

                                    <Link
                                        href="/login"
                                        className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-white/10 px-4 text-sm font-medium text-[var(--brand-muted)] transition hover:border-white/20 hover:text-foreground"
                                    >
                                        로그인 화면으로 이동
                                    </Link>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    )
}

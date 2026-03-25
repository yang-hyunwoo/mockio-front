"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, CheckCircle2, KeyRound, ShieldAlert, ShieldCheck } from "lucide-react"
import {PasswordResetValidateApi} from "@/lib/api/password/PasswordResetValidateApi";
import {PasswordResetConfirmApi} from "@/lib/api/password/PasswordResetConfirmApi";

export default function ResetPasswordPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    const [isChecking, setIsChecking] = useState(true)
    const [isValidToken, setIsValidToken] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [tokenError, setTokenError] = useState("")

    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setTokenError("유효하지 않은 접근입니다. 이메일의 재설정 링크를 다시 확인해 주세요.")
                setIsChecking(false)
                return
            }

            try {
                setIsChecking(true)
                setTokenError("")

                 await PasswordResetValidateApi({ token })
                // setIsValidToken(response.valid)

                await new Promise((resolve) => setTimeout(resolve, 700))
                setIsValidToken(true)
            } catch (e) {
                console.error("비밀번호 재설정 토큰 검증 실패", e)
                setIsValidToken(false)
                setTokenError("링크가 만료되었거나 이미 사용되었습니다. 비밀번호 재설정을 다시 요청해 주세요.")
            } finally {
                setIsChecking(false)
            }
        }

        void validateToken()
    }, [token])

    const passwordRuleText = useMemo(
        () => "영문, 숫자, 특수문자를 포함한 8자 이상으로 설정해 주세요.",
        []
    )

    const validateForm = () => {
        const trimmedPassword = password.trim()
        const trimmedConfirmPassword = confirmPassword.trim()

        if (!trimmedPassword) {
            setError("새 비밀번호를 입력해 주세요.")
            return false
        }

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/
        if (!passwordRegex.test(trimmedPassword)) {
            setError(passwordRuleText)
            return false
        }

        if (!trimmedConfirmPassword) {
            setError("비밀번호 확인을 입력해 주세요.")
            return false
        }

        if (trimmedPassword !== trimmedConfirmPassword) {
            setError("비밀번호와 비밀번호 확인이 일치하지 않습니다.")
            return false
        }

        setError("")
        return true
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!token || !isValidToken) {
            setError("유효하지 않은 요청입니다. 다시 시도해 주세요.")
            return
        }

        if (!validateForm()) return

        try {
            setIsSubmitting(true)
            setError("")

            const payload = {
                token : token,
                password : password,
                confirmPassword : confirmPassword
            }
            await PasswordResetConfirmApi(payload)
            await new Promise((resolve) => setTimeout(resolve, 900))

            setIsSuccess(true)
        } catch (e) {
            console.error("비밀번호 재설정 실패", e)
            setError("비밀번호 변경에 실패했습니다. 링크를 다시 요청한 뒤 재시도해 주세요.")
        } finally {
            setIsSubmitting(false)
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
                            Reset Password
                        </p>
                        <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
                            새로운 비밀번호를
                            <br />
                            설정해 주세요
                        </h1>
                        <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--brand-muted)] sm:text-base">
                            이메일로 받은 재설정 링크를 통해 비밀번호를 변경할 수 있습니다. 링크는 일정
                            시간이 지나면 만료되며, 한 번 사용한 링크는 다시 사용할 수 없습니다.
                        </p>

                        <div className="mt-8 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                    <ShieldCheck className="h-4 w-4" />
                                    안전한 재설정
                                </div>
                                <p className="mt-2 text-sm leading-6 text-[var(--brand-muted)]">
                                    재설정 링크는 1회용으로 사용되며, 만료 시간이 지나면 다시 요청해야 합니다.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                    <KeyRound className="h-4 w-4" />
                                    비밀번호 규칙
                                </div>
                                <p className="mt-2 text-sm leading-6 text-[var(--brand-muted)]">{passwordRuleText}</p>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-3xl border border-white/10 bg-[var(--surface-glass-strong)] p-6 shadow-[0_24px_48px_rgba(20,30,50,0.12)] sm:p-8">
                        {isChecking ? (
                            <div className="flex min-h-[420px] flex-col justify-center">
                                <div className="rounded-3xl border border-sky-500/20 bg-sky-500/10 p-6">
                                    <p className="text-sm font-semibold text-sky-300">링크 확인 중</p>
                                    <h2 className="mt-2 text-2xl font-semibold">재설정 링크를 검증하고 있습니다</h2>
                                    <p className="mt-3 text-sm leading-7 text-[var(--brand-muted)]">
                                        잠시만 기다려 주세요. 링크가 유효하면 바로 비밀번호를 변경할 수 있습니다.
                                    </p>
                                </div>
                            </div>
                        ) : isSuccess ? (
                            <div className="flex min-h-[420px] flex-col justify-center">
                                <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6">
                                    <div className="flex items-center gap-2 text-emerald-300">
                                        <CheckCircle2 className="h-5 w-5" />
                                        <p className="text-sm font-semibold">비밀번호 변경 완료</p>
                                    </div>
                                    <h2 className="mt-3 text-2xl font-semibold">새 비밀번호로 로그인해 주세요</h2>
                                    <p className="mt-3 text-sm leading-7 text-[var(--brand-muted)]">
                                        비밀번호가 정상적으로 변경되었습니다. 보안을 위해 기존 로그인 세션이 종료될
                                        수 있으며, 다시 로그인해 주세요.
                                    </p>
                                </div>

                                <div className="mt-6 space-y-3">
                                    <button
                                        type="button"
                                        onClick={() => router.push("/login")}
                                        className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-[var(--brand-primary)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--brand-primary-hover)]"
                                    >
                                        로그인 화면으로 이동
                                    </button>
                                </div>
                            </div>
                        ) : !isValidToken ? (
                            <div className="flex min-h-[420px] flex-col justify-center">
                                <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-6">
                                    <div className="flex items-center gap-2 text-amber-300">
                                        <ShieldAlert className="h-5 w-5" />
                                        <p className="text-sm font-semibold">유효하지 않은 링크</p>
                                    </div>
                                    <h2 className="mt-3 text-2xl font-semibold">다시 요청해 주세요</h2>
                                    <p className="mt-3 text-sm leading-7 text-[var(--brand-muted)]">
                                        {tokenError || "링크가 만료되었거나 이미 사용되었습니다. 비밀번호 재설정을 다시 요청해 주세요."}
                                    </p>
                                </div>

                                <div className="mt-6 space-y-3">
                                    <Link
                                        href="/password/find"
                                        className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-[var(--brand-primary)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--brand-primary-hover)]"
                                    >
                                        비밀번호 재설정 다시 요청
                                    </Link>

                                    <Link
                                        href="/login"
                                        className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-white/10 px-4 text-sm font-medium text-[var(--brand-muted)] transition hover:border-white/20 hover:text-foreground"
                                    >
                                        로그인 화면으로 이동
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <p className="text-sm font-semibold text-[var(--brand-muted)]">새 비밀번호 입력</p>
                                    <h2 className="mt-2 text-2xl font-semibold">비밀번호 재설정</h2>
                                    <p className="mt-3 text-sm leading-6 text-[var(--brand-muted)]">
                                        새로운 비밀번호를 입력해 주세요. 이전에 사용한 비밀번호와 다른 값으로 설정하는
                                        것을 권장합니다.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                                    <div>
                                        <label htmlFor="password" className="mb-2 block text-sm font-medium">
                                            새 비밀번호
                                        </label>
                                        <div className="flex h-12 items-center rounded-2xl border border-white/10 bg-white/5 px-4 focus-within:border-[var(--brand-primary)] focus-within:ring-2 focus-within:ring-[var(--brand-primary)]/20">
                                            <KeyRound className="mr-3 h-4 w-4 text-[var(--brand-muted)]" />
                                            <input
                                                id="password"
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="새 비밀번호를 입력해 주세요"
                                                className="h-full w-full bg-transparent text-sm outline-none placeholder:text-[var(--brand-muted)]"
                                                autoComplete="new-password"
                                            />
                                        </div>
                                        <p className="mt-2 text-xs text-[var(--brand-muted)]">{passwordRuleText}</p>
                                    </div>

                                    <div>
                                        <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium">
                                            새 비밀번호 확인
                                        </label>
                                        <div className="flex h-12 items-center rounded-2xl border border-white/10 bg-white/5 px-4 focus-within:border-[var(--brand-primary)] focus-within:ring-2 focus-within:ring-[var(--brand-primary)]/20">
                                            <ShieldCheck className="mr-3 h-4 w-4 text-[var(--brand-muted)]" />
                                            <input
                                                id="confirmPassword"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="비밀번호를 한 번 더 입력해 주세요"
                                                className="h-full w-full bg-transparent text-sm outline-none placeholder:text-[var(--brand-muted)]"
                                                autoComplete="new-password"
                                            />
                                        </div>
                                    </div>

                                    {error && <p className="text-sm text-red-400">{error}</p>}

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[var(--brand-primary)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--brand-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {isSubmitting ? "변경 중..." : "비밀번호 변경"}
                                    </button>
                                </form>
                            </>
                        )}
                    </section>
                </div>
            </div>
        </div>
    )
}

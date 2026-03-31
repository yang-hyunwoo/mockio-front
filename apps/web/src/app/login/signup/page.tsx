"use client"

import { FormEvent, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import Script from "next/script"
import { useTheme } from "next-themes"
import { SignupApi } from "@/lib/api/login/SignupApi"

declare global {
    interface Window {
        grecaptcha?: {
            render: (
                container: HTMLElement,
                parameters: {
                    sitekey: string
                    callback?: (token: string) => void
                    "expired-callback"?: () => void
                    "error-callback"?: () => void
                    theme?: "light" | "dark"
                }
            ) => number
            reset: (widgetId?: number) => void
            ready: (cb: () => void) => void
        }
    }
}

export default function SignupPage() {
    const { resolvedTheme } = useTheme()

    const [mounted, setMounted] = useState(false)

    const [email, setEmail] = useState("")
    const [nickname, setNickname] = useState("")
    const [password, setPassword] = useState("")
    const [passwordConfirm, setPasswordConfirm] = useState("")
    const [agreeTerms, setAgreeTerms] = useState(false)

    const [emailError, setEmailError] = useState("")
    const [nicknameError, setNicknameError] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [passwordConfirmError, setPasswordConfirmError] = useState("")
    const [submitError, setSubmitError] = useState("")
    const [recaptchaError, setRecaptchaError] = useState("")

    const [emailSuccess, setEmailSuccess] = useState("")
    const [nicknameSuccess, setNicknameSuccess] = useState("")

    const [scriptLoaded, setScriptLoaded] = useState(false)
    const [recaptchaToken, setRecaptchaToken] = useState("")

    const recaptchaRef = useRef<HTMLDivElement | null>(null)
    const widgetIdRef = useRef<number | null>(null)

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const passwordRuleRegex =
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{8,}$/

    const passwordChecks = useMemo(
        () => ({
            length: password.length >= 8,
            english: /[A-Za-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password),
        }),
        [password]
    )

    const isPasswordValid =
        passwordChecks.length &&
        passwordChecks.english &&
        passwordChecks.number &&
        passwordChecks.special

    const isPasswordMismatch =
        passwordConfirm.length > 0 && password !== passwordConfirm

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!mounted) return
        if (!scriptLoaded) return
        if (!recaptchaRef.current) return
        if (!window.grecaptcha) return

        recaptchaRef.current.innerHTML = ""
        widgetIdRef.current = null
        setRecaptchaToken("")

        window.grecaptcha.ready(() => {
            if (!recaptchaRef.current || !window.grecaptcha) return

            widgetIdRef.current = window.grecaptcha.render(recaptchaRef.current, {
                sitekey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "",
                theme: resolvedTheme === "dark" ? "dark" : "light",
                callback: (token: string) => {
                    setRecaptchaToken(token)
                    setRecaptchaError("")
                    setSubmitError("")
                },
                "expired-callback": () => {
                    setRecaptchaToken("")
                    setRecaptchaError("reCAPTCHA 인증이 만료되었습니다. 다시 인증해주세요.")
                },
                "error-callback": () => {
                    setRecaptchaToken("")
                    setRecaptchaError("reCAPTCHA 인증 중 오류가 발생했습니다. 다시 시도해주세요.")
                },
            })
        })
    }, [mounted, scriptLoaded, resolvedTheme])

    const resetRecaptcha = () => {
        if (widgetIdRef.current !== null && window.grecaptcha) {
            window.grecaptcha.reset(widgetIdRef.current)
        }
        setRecaptchaToken("")
    }

    const validateEmailFormat = (value: string) => {
        if (!value.trim()) return "이메일을 입력해주세요."
        if (!emailRegex.test(value)) return "올바른 이메일 형식이 아닙니다."
        return ""
    }

    const validateNickname = (value: string) => {
        if (!value.trim()) return "닉네임을 입력해주세요."
        if (value.trim().length < 2) return "닉네임은 2자 이상 입력해주세요."
        if (value.trim().length > 30) return "닉네임은 30자 이하로 입력해주세요."
        return ""
    }

    const validatePassword = (value: string) => {
        if (!value) return "비밀번호를 입력해주세요."
        if (!passwordRuleRegex.test(value)) {
            return "영문, 숫자, 특수문자를 포함한 8자 이상으로 입력해주세요."
        }
        return ""
    }

    const handleEmailBlur = async () => {
        setEmailSuccess("")
        const formatError = validateEmailFormat(email)
        setEmailError(formatError)
        if (formatError) return
    }

    const handleNicknameBlur = async () => {
        setNicknameSuccess("")
        const validationError = validateNickname(nickname)
        setNicknameError(validationError)
        if (validationError) return
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        setEmailError("")
        setNicknameError("")
        setPasswordError("")
        setPasswordConfirmError("")
        setSubmitError("")
        setEmailSuccess("")
        setNicknameSuccess("")
        setRecaptchaError("")

        const emailValidationError = validateEmailFormat(email)
        const nicknameValidationError = validateNickname(nickname)
        const passwordValidationError = validatePassword(password)

        if (emailValidationError) {
            setEmailError(emailValidationError)
            return
        }

        if (nicknameValidationError) {
            setNicknameError(nicknameValidationError)
            return
        }

        if (passwordValidationError) {
            setPasswordError(passwordValidationError)
            return
        }

        if (isPasswordMismatch) {
            setPasswordConfirmError("비밀번호가 일치하지 않습니다.")
            return
        }

        if (!agreeTerms) {
            setSubmitError("이용약관 및 개인정보 처리방침에 동의해주세요.")
            return
        }

        if (!recaptchaToken) {
            setRecaptchaError("reCAPTCHA 인증을 완료해주세요.")
            return
        }

        try {
            await SignupApi({
                email,
                nickname,
                password,
                recaptchaToken,
            })
            alert("회원가입이 완료되었습니다.")
            window.location.href = "/login/signup/success"
        } catch (error: any) {
            const errorData = error?.response?.data

            if (errorData?.errCode === "DUPLICATE_EMAIL") {
                setEmailError(errorData?.message || "이미 사용 중인 이메일입니다.")
                resetRecaptcha()
                return
            }

            if (errorData?.errCode === "DUPLICATE_NICKNAME") {
                setNicknameError(errorData?.message || "이미 사용 중인 닉네임입니다.")
                resetRecaptcha()
                return
            }

            if (errorData?.errCode === "RECAPTCHA_INVALID") {
                setRecaptchaError(errorData?.message || "reCAPTCHA 검증에 실패했습니다.")
                resetRecaptcha()
                return
            }

            setSubmitError(errorData?.message || "회원가입에 실패했습니다.")
            resetRecaptcha()
        }
    }

    return (
        <>
            <Script
                src="https://www.google.com/recaptcha/api.js?render=explicit"
                strategy="afterInteractive"
                onLoad={() => setScriptLoaded(true)}
            />

            <div className="flex min-h-screen items-center justify-center bg-[var(--bg-page)] px-4 py-10">
                <div className="w-full max-w-[460px]">
                    <div className="mb-10 flex flex-col items-center">
                        <div className="relative mb-2 h-[180px] w-[180px]">
                            <Image
                                src="/branding/mockio-logo.png"
                                alt="mockio logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] px-6 py-7 shadow-[0_12px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
                        <div className="mb-6">
                            <h1 className="text-[26px] font-bold tracking-[-0.02em] text-[var(--text-primary)]">
                                회원가입
                            </h1>
                            <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                이메일과 닉네임을 입력하고 계정을 생성하세요.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">
                                    이메일
                                </label>
                                <input
                                    type="email"
                                    placeholder="example@mockio.com"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value)
                                        setEmailError("")
                                        setEmailSuccess("")
                                        setSubmitError("")
                                    }}
                                    onBlur={handleEmailBlur}
                                    className={`h-12 w-full rounded-xl bg-[var(--bg-input)] px-4 text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none transition focus:ring-2 ${
                                        emailError
                                            ? "border border-red-400 focus:border-red-400 focus:ring-red-200/60"
                                            : emailSuccess
                                                ? "border border-emerald-400 focus:border-emerald-400 focus:ring-emerald-200/60"
                                                : "border border-[var(--border-color)] focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)]/20"
                                    }`}
                                />
                                <p className="mt-2 text-xs font-medium text-red-500">
                                    {emailError}
                                </p>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">
                                    닉네임
                                </label>
                                <input
                                    type="text"
                                    placeholder="닉네임을 입력하세요"
                                    value={nickname}
                                    onChange={(e) => {
                                        setNickname(e.target.value)
                                        setNicknameError("")
                                        setNicknameSuccess("")
                                        setSubmitError("")
                                    }}
                                    onBlur={handleNicknameBlur}
                                    className={`h-12 w-full rounded-xl bg-[var(--bg-input)] px-4 text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none transition focus:ring-2 ${
                                        nicknameError
                                            ? "border border-red-400 focus:border-red-400 focus:ring-red-200/60"
                                            : nicknameSuccess
                                                ? "border border-emerald-400 focus:border-emerald-400 focus:ring-emerald-200/60"
                                                : "border border-[var(--border-color)] focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)]/20"
                                    }`}
                                />
                                <p className="mt-2 text-xs font-medium text-red-500">
                                    {nicknameError}
                                </p>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">
                                    비밀번호
                                </label>
                                <input
                                    type="password"
                                    placeholder="비밀번호를 입력하세요"
                                    value={password}
                                    onChange={(e) => {
                                        const next = e.target.value
                                        setPassword(next)
                                        setPasswordError("")
                                        setSubmitError("")

                                        if (passwordConfirm.length > 0 && next !== passwordConfirm) {
                                            setPasswordConfirmError("비밀번호가 일치하지 않습니다.")
                                        } else {
                                            setPasswordConfirmError("")
                                        }
                                    }}
                                    className={`h-12 w-full rounded-xl bg-[var(--bg-input)] px-4 text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none transition focus:ring-2 ${
                                        passwordError
                                            ? "border border-red-400 focus:border-red-400 focus:ring-red-200/60"
                                            : isPasswordValid && password.length > 0
                                                ? "border border-emerald-400 focus:border-emerald-400 focus:ring-emerald-200/60"
                                                : "border border-[var(--border-color)] focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)]/20"
                                    }`}
                                />

                                {passwordError && (
                                    <p className="mt-2 text-xs font-medium text-red-500">
                                        {passwordError}
                                    </p>
                                )}

                                <div className="mt-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] px-4 py-3">
                                    <p className="mb-2 text-xs font-semibold text-[var(--text-primary)]">
                                        비밀번호 조건
                                    </p>

                                    <div className="space-y-1 text-xs">
                                        <p className={passwordChecks.length ? "text-emerald-500" : "text-[var(--text-secondary)]"}>
                                            {passwordChecks.length ? "✓" : "•"} 8자 이상
                                        </p>
                                        <p className={passwordChecks.english ? "text-emerald-500" : "text-[var(--text-secondary)]"}>
                                            {passwordChecks.english ? "✓" : "•"} 영문 포함
                                        </p>
                                        <p className={passwordChecks.number ? "text-emerald-500" : "text-[var(--text-secondary)]"}>
                                            {passwordChecks.number ? "✓" : "•"} 숫자 포함
                                        </p>
                                        <p className={passwordChecks.special ? "text-emerald-500" : "text-[var(--text-secondary)]"}>
                                            {passwordChecks.special ? "✓" : "•"} 특수문자 포함
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">
                                    비밀번호 확인
                                </label>
                                <input
                                    type="password"
                                    placeholder="비밀번호를 다시 입력하세요"
                                    value={passwordConfirm}
                                    onChange={(e) => {
                                        const next = e.target.value
                                        setPasswordConfirm(next)
                                        setSubmitError("")

                                        if (next.length > 0 && next !== password) {
                                            setPasswordConfirmError("비밀번호가 일치하지 않습니다.")
                                        } else {
                                            setPasswordConfirmError("")
                                        }
                                    }}
                                    className={`h-12 w-full rounded-xl bg-[var(--bg-input)] px-4 text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none transition focus:ring-2 ${
                                        passwordConfirmError
                                            ? "border border-red-400 focus:border-red-400 focus:ring-red-200/60"
                                            : passwordConfirm.length > 0 && password === passwordConfirm
                                                ? "border border-emerald-400 focus:border-emerald-400 focus:ring-emerald-200/60"
                                                : "border border-[var(--border-color)] focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)]/20"
                                    }`}
                                />

                                {passwordConfirmError && (
                                    <p className="mt-2 text-xs font-medium text-red-500">
                                        {passwordConfirmError}
                                    </p>
                                )}

                                {!passwordConfirmError &&
                                    passwordConfirm.length > 0 &&
                                    password === passwordConfirm && (
                                        <p className="mt-2 text-xs font-medium text-emerald-500">
                                            비밀번호가 일치합니다.
                                        </p>
                                    )}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">
                                    자동 가입 방지
                                </label>
                                <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] px-2 py-4 sm:px-4">
                                    <div className="flex justify-center overflow-hidden">
                                        <div className="signup-recaptcha" ref={recaptchaRef} />
                                    </div>
                                </div>
                                {recaptchaError && (
                                    <p className="mt-2 text-xs font-medium text-red-500">
                                        {recaptchaError}
                                    </p>
                                )}
                            </div>

                            <label className="flex items-start gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] px-4 py-3 text-sm text-[var(--text-secondary)]">
                                <input
                                    type="checkbox"
                                    checked={agreeTerms}
                                    onChange={(e) => {
                                        setAgreeTerms(e.target.checked)
                                        setSubmitError("")
                                    }}
                                    className="mt-0.5 h-4 w-4 accent-[var(--brand-primary)]"
                                />
                                <span>
                                    <span className="font-medium text-[var(--text-primary)]">
                                        AI 분석을 위해 외부 서비스로 데이터가 전달될 수 있음에 동의합니다.
                                    </span>

                                </span>
                            </label>

                            {submitError && (
                                <p className="text-sm font-medium text-red-500">{submitError}</p>
                            )}

                            <button
                                type="submit"
                                className="mt-2 h-[54px] w-full rounded-xl bg-[var(--brand-primary)] text-[17px] font-semibold text-white transition hover:bg-[var(--brand-primary-hover)] active:scale-[0.98]"
                            >
                                회원가입
                            </button>
                        </form>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[var(--text-secondary)]">
                        <span>이미 계정이 있으신가요?</span>
                        <Link
                            href="/login"
                            className="font-semibold text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)]"
                        >
                            로그인
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}
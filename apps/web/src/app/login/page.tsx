"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { LoginApi } from "@/lib/api/login/LoginApi"
import { useAuthStore } from "@/store/authStore"

export default function LoginPage() {
    const [loginId, setLoginId] = useState("")
    const [password, setPassword] = useState("")
    const [keepLogin, setKeepLogin] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (isSubmitting) return

        setIsSubmitting(true)
        setErrorMessage("")

        try {
            const result = await LoginApi({
                email: loginId,
                password,
            })

            if (result?.accessToken) {
                useAuthStore.getState().setAccessToken(result.accessToken)
                window.location.href = "/"
            }
        } catch (error: any) {
            setErrorMessage(
                error?.response?.data?.message || "로그인에 실패했습니다."
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleGoogleLogin = () => {
        // window.location.href = `http://localhost:9080/api/auth/v1/oauth2/authorization/google`
        window.location.href = `https://mockio.cloud/api/auth/v1/oauth2/authorization/google`
    }

    return (
        <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center px-4">
            <div className="w-full max-w-[420px]">

                {/* 로고 */}
                <div className="mb-10 flex flex-col items-center">
                    <div className="relative w-[200px] h-[200px]">
                        <Image
                            src="/branding/mockio-logo.png"
                            alt="mockio logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>

                {/* 카드 */}
                <div className="
                    rounded-2xl
                    border border-[var(--border-color)]
                    bg-[var(--bg-card)]
                    px-6 py-7
                    shadow-[0_12px_30px_rgba(0,0,0,0.08)]
                    dark:shadow-[0_12px_30px_rgba(0,0,0,0.4)]
                ">

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* 이메일 */}
                        <input
                            type="email"
                            placeholder="이메일"
                            value={loginId}
                            onChange={(e) => setLoginId(e.target.value)}
                            className="
                                h-12 w-full rounded-xl
                                border border-[var(--border-color)]
                                bg-[var(--bg-input)]
                                px-4 text-[15px]
                                text-[var(--text-primary)]
                                placeholder:text-[var(--text-secondary)]
                                outline-none transition
                                focus:border-[var(--brand-primary)]
                                focus:ring-2 focus:ring-[var(--brand-primary)]/20
                            "
                        />

                        {/* 비밀번호 */}
                        <input
                            type="password"
                            placeholder="비밀번호"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="
                                h-12 w-full rounded-xl
                                border border-[var(--border-color)]
                                bg-[var(--bg-input)]
                                px-4 text-[15px]
                                text-[var(--text-primary)]
                                placeholder:text-[var(--text-secondary)]
                                outline-none transition
                                focus:border-[var(--brand-primary)]
                                focus:ring-2 focus:ring-[var(--brand-primary)]/20
                            "
                        />

                        {/* 체크박스 */}
                        <label className="flex items-center gap-2 text-[14px] text-[var(--text-secondary)]">
                            <input
                                type="checkbox"
                                checked={keepLogin}
                                onChange={(e) => setKeepLogin(e.target.checked)}
                                className="h-4 w-4 accent-[var(--brand-primary)]"
                            />
                            로그인 상태 유지
                        </label>

                        {/* 로그인 버튼 */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="
                                h-[54px] w-full rounded-xl
                                bg-[var(--brand-primary)]
                                text-[17px] font-semibold text-white
                                transition hover:bg-[var(--brand-primary-hover)]
                                active:scale-[0.98]
                                disabled:opacity-60
                            "
                        >
                            {isSubmitting ? "로그인 중..." : "로그인"}
                        </button>

                        {/* 에러 */}
                        {errorMessage && (
                            <p className="text-center text-sm text-red-500">
                                {errorMessage}
                            </p>
                        )}
                    </form>

                    {/* 구분선 */}
                    <div className="my-6 border-t border-[var(--border-color)]" />

                    {/* Google 로그인 */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="
                            flex h-[54px] w-full items-center justify-center
                            rounded-full
                            border border-[var(--border-color)]
                            bg-[var(--bg-card)]
                            text-[var(--text-primary)]
                            shadow-sm transition
                            hover:bg-[var(--bg-input)]
                        "
                    >
                        <div className="flex w-10 justify-start">
                            <svg width="20" height="20" viewBox="0 0 48 48">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.73 1.22 9.23 3.6l6.88-6.88C35.8 2.7 30.3 0 24 0 14.82 0 6.74 5.48 2.69 13.44l8.01 6.22C12.77 13.02 17.93 9.5 24 9.5z"/>
                                <path fill="#4285F4" d="M46.5 24.5c0-1.6-.14-3.13-.4-4.6H24v9h12.7c-.55 2.9-2.2 5.36-4.7 7.02l7.3 5.67C43.98 37.02 46.5 31.3 46.5 24.5z"/>
                                <path fill="#FBBC05" d="M10.7 28.66A14.5 14.5 0 0 1 9.5 24c0-1.63.28-3.2.78-4.66l-8.01-6.22A24 24 0 0 0 0 24c0 3.88.93 7.54 2.69 10.78l8.01-6.12z"/>
                                <path fill="#34A853" d="M24 48c6.3 0 11.6-2.08 15.47-5.64l-7.3-5.67c-2.02 1.36-4.6 2.16-8.17 2.16-6.07 0-11.23-3.52-13.3-8.56l-8.01 6.12C6.74 42.52 14.82 48 24 48z"/>
                            </svg>
                        </div>
                        Google로 시작하기
                    </button>
                </div>

                {/* 하단 링크 */}
                <div className="mt-6 flex justify-center gap-3 text-[13px] text-[var(--text-secondary)]">
                    <Link href="/password/find" className="hover:underline">
                        비밀번호 찾기
                    </Link>
                    <span>|</span>
                    <Link href="/login/signup" className="hover:underline">
                        회원가입
                    </Link>
                </div>
            </div>
        </div>
    )
}
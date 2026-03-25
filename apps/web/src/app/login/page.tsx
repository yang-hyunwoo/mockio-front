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

        const payload = {
            email: loginId,
            password: password,
        }

        try {
            const result = await LoginApi(payload)

            if (result?.accessToken) {
                useAuthStore.getState().setAccessToken(result.accessToken)
                window.location.href = "/"
            }
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                "로그인에 실패했습니다."

            setErrorMessage(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleGoogleLogin = () => {
        window.location.href = `http://localhost:9080/api/auth/v1/oauth2/authorization/google`;
    }

    const handleNaverLogin = () => {
        window.location.href = `http://localhost:9080/api/auth/v1/oauth2/authorization/naver`;
    }

    return (
        <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center px-4">
            <div className="w-full max-w-[420px]">
                <div className="mb-12 flex flex-col items-center">
                    <div className="relative w-[220px] h-[220px]">
                        <Image
                            src="/branding/mockio-logo.png"
                            alt="mockio logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>

                <div className="rounded-2xl border border-[#d9d9d9] bg-white px-6 py-7 shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="email"
                            placeholder="이메일"
                            value={loginId}
                            onChange={(e) => setLoginId(e.target.value)}
                            className="h-12 w-full rounded-xl border border-[#d9d9d9] px-4 text-[15px] outline-none transition focus:border-[#3f7a97] focus:ring-2 focus:ring-[#3f7a97]/20"
                        />

                        <input
                            type="password"
                            placeholder="비밀번호"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-12 w-full rounded-xl border border-[#d9d9d9] px-4 text-[15px] outline-none transition focus:border-[#3f7a97] focus:ring-2 focus:ring-[#3f7a97]/20"
                        />

                        <label className="flex items-center gap-2 text-[14px] text-[#444]">
                            <input
                                type="checkbox"
                                checked={keepLogin}
                                onChange={(e) => setKeepLogin(e.target.checked)}
                                className="h-4 w-4 accent-[#3f7a97]"
                            />
                            로그인 상태 유지
                        </label>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-[54px] w-full rounded-xl bg-[#3f7a97] text-[17px] font-semibold text-white transition hover:bg-[#356a84] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? "로그인 중..." : "로그인"}
                        </button>

                        {errorMessage && (
                            <p className="mt-2 text-center text-sm text-red-500">
                                {errorMessage}
                            </p>
                        )}
                    </form>

                    <div className="my-6 border-t border-[#e5e7eb]" />

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="flex h-[54px] w-full items-center justify-center rounded-full border border-[#d8d8d8] bg-white px-5 text-[15px] font-semibold text-[#111] shadow-sm transition hover:bg-[#f8f8f8]"
                    >
                        <div className="flex w-full items-center">
                            <div className="flex w-10 justify-start text-[26px] font-bold text-[#4285F4]">
                                G
                            </div>
                            <div className="flex-1 text-center pr-10">
                                Google로 시작하기
                            </div>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={handleNaverLogin}
                        className="mt-3 flex h-[54px] w-full items-center justify-center rounded-full bg-[#03c75a] px-5 text-[15px] font-semibold text-white transition hover:bg-[#02b350]"
                    >
                        <div className="flex w-full items-center">
                            <div className="flex w-10 justify-start text-[22px] font-black">
                                N
                            </div>
                            <div className="flex-1 text-center pr-10">
                                Naver로 시작하기
                            </div>
                        </div>
                    </button>
                </div>

                <div className="mt-6 flex justify-center gap-3 text-[13px] text-[#8c8c9a]">
                    <Link href="/password/find" className="hover:text-[#666]">
                        비밀번호 찾기
                    </Link>
                    <span>|</span>
                    <Link href="/login/signup" className="hover:text-[#666]">
                        회원가입
                    </Link>
                </div>
            </div>
        </div>
    )
}
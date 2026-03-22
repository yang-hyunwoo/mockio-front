"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import Image from "next/image"

export default function LoginPage() {
    const [loginId, setLoginId] = useState("")
    const [password, setPassword] = useState("")
    const [keepLogin, setKeepLogin] = useState(false)

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        console.log({
            loginId,
            password,
            keepLogin,
        })

        // TODO:
        // 로그인 API 연결
    }

    const handleGoogleLogin = () => {
        console.log("google login")
    }

    const handleNaverLogin = () => {
        console.log("naver login")
    }

    return (
        <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center px-4">
            <div className="w-full max-w-[420px]">

                {/* ===== 로고 영역 ===== */}
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

                {/* ===== 로그인 카드 ===== */}
                <div className="rounded-2xl border border-[#d9d9d9] bg-white px-6 py-7 shadow-[0_12px_30px_rgba(0,0,0,0.08)]">

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* 아이디 */}
                        <input
                            type="text"
                            placeholder="아이디"
                            value={loginId}
                            onChange={(e) => setLoginId(e.target.value)}
                            className="h-12 w-full rounded-xl border border-[#d9d9d9] px-4 text-[15px] outline-none transition focus:border-[#3f7a97] focus:ring-2 focus:ring-[#3f7a97]/20"
                        />

                        {/* 비밀번호 */}
                        <input
                            type="password"
                            placeholder="비밀번호"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-12 w-full rounded-xl border border-[#d9d9d9] px-4 text-[15px] outline-none transition focus:border-[#3f7a97] focus:ring-2 focus:ring-[#3f7a97]/20"
                        />

                        {/* 로그인 유지 */}
                        <label className="flex items-center gap-2 text-[14px] text-[#444]">
                            <input
                                type="checkbox"
                                checked={keepLogin}
                                onChange={(e) => setKeepLogin(e.target.checked)}
                                className="h-4 w-4 accent-[#3f7a97]"
                            />
                            로그인 상태 유지
                        </label>

                        {/* 로그인 버튼 */}
                        <button
                            type="submit"
                            className="h-[54px] w-full rounded-xl bg-[#3f7a97] text-[17px] font-semibold text-white transition hover:bg-[#356a84] active:scale-[0.98]"
                        >
                            로그인
                        </button>
                    </form>

                    {/* 구분선 */}
                    <div className="my-6 border-t border-[#e5e7eb]" />

                    {/* ===== 소셜 로그인 ===== */}

                    {/* 구글 */}
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

                    {/* 네이버 */}
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

                {/* ===== 하단 링크 ===== */}
                <div className="mt-6 flex justify-center gap-3 text-[13px] text-[#8c8c9a]">
                    <Link href="/find-password" className="hover:text-[#666]">
                        비밀번호 찾기
                    </Link>
                    <span>|</span>
                    <Link href="/find-id" className="hover:text-[#666]">
                        아이디 찾기
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
"use client"

import { useRouter } from "next/navigation"

export default function SignupSuccessClient() {
    const router = useRouter()

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center shadow-lg">

                {/* 아이콘 */}
                <div className="mb-6 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                        <svg
                            className="h-8 w-8 text-green-600 dark:text-green-400"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                </div>

                {/* 제목 */}
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    회원가입 완료
                </h1>

                {/* 설명 */}
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    가입이 정상적으로 완료되었습니다.
                </p>

                {/* 수동 이동 버튼 */}
                <button
                    onClick={() => router.replace("/login")}
                    className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
                >
                    지금 로그인하러 가기
                </button>
            </div>
        </div>
    )
}

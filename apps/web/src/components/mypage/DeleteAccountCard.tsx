"use client";

import { useMemo, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import {DeleteAccountApi} from "@/lib/api/mypage/DeleteAccountApi";

export default function DeleteAccountCard() {
    const [password, setPassword] = useState("");
    const [agree, setAgree] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const clearAuth = useAuthStore((s) => s.clearAuth);
    const isSubmitDisabled = useMemo(() => {
        return saving || !password.trim() || !agree;
    }, [saving, password, agree]);

    const handleDeleteAccount = async () => {
        if (isSubmitDisabled) return;

        const confirmed = window.confirm(
            "정말 회원 탈퇴를 진행하시겠습니까?\n탈퇴 후 계정 복구가 어려울 수 있습니다."
        );

        if (!confirmed) return;

        try {
            setSaving(true);
            setMessage(null);
            setErrorMessage(null);

            await DeleteAccountApi({
                password,
            });

            clearAuth();
            window.location.href = "/";
        } catch (error) {
            console.error("회원 탈퇴 실패", error);
            setErrorMessage("회원 탈퇴에 실패했습니다. 비밀번호를 확인해 주세요.");
        } finally {
            setSaving(false);
        }
    };
    return (
        <div className="rounded-3xl border border-red-200/70 bg-red-50/70 p-6 shadow-sm dark:border-red-500/20 dark:bg-red-500/[0.06]">
            <div className="mb-6">
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                    회원 탈퇴
                </h2>
                <p className="mt-2 text-sm leading-6 text-(--brand-muted)">
                    탈퇴를 진행하면 계정과 관련된 정보에 다시 접근할 수 없습니다.
                    신중하게 진행해 주세요.
                </p>
            </div>

            <div className="mb-5 rounded-2xl border border-red-200 bg-white/70 px-4 py-4 text-sm leading-6 text-red-700 dark:border-red-500/20 dark:bg-zinc-950/40 dark:text-red-300">
                <p>아래 내용을 확인해 주세요.</p>
                <ul className="mt-2 space-y-1">
                    <li>• 계정 삭제 후 복구가 제한될 수 있습니다.</li>
                    <li>• 보유 중인 일부 이력 데이터가 함께 삭제될 수 있습니다.</li>
                    <li>• 진행 전 반드시 필요한 정보를 백업해 주세요.</li>
                </ul>
            </div>

            <div className="space-y-5">
                <div className="space-y-2">
                    <label
                        htmlFor="deletePassword"
                        className="text-sm font-medium text-foreground"
                    >
                        비밀번호 확인
                    </label>
                    <input
                        id="deletePassword"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="회원 탈퇴를 위해 비밀번호를 입력해 주세요"
                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-400/20 dark:border-white/10 dark:bg-zinc-900"
                    />
                </div>

                <label className="flex items-start gap-3 rounded-2xl border border-black/5 bg-white/80 px-4 py-4 text-sm dark:border-white/10 dark:bg-zinc-950/50">
                    <input
                        type="checkbox"
                        checked={agree}
                        onChange={(e) => setAgree(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-gray-300"
                    />
                    <span className="leading-6 text-(--brand-muted)">
                        안내 사항을 모두 확인했으며, 회원 탈퇴에 동의합니다.
                    </span>
                </label>

                {message && (
                    <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                        {message}
                    </p>
                )}

                {errorMessage && (
                    <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                        {errorMessage}
                    </p>
                )}

                <button
                    type="button"
                    disabled={isSubmitDisabled}
                    onClick={handleDeleteAccount}
                    className="inline-flex min-w-[140px] items-center justify-center rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {saving ? "처리 중..." : "회원 탈퇴"}
                </button>
            </div>
        </div>
    );
}
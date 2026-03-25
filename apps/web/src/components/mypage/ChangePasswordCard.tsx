"use client";

import { FormEvent, useMemo, useState } from "react";
import { ChangePasswordApi } from "@/lib/api/mypage/ChangePasswordApi";

export default function ChangePasswordCard() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const passwordRuleRegex =
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{8,}$/;

    const validationMessage = useMemo(() => {
        if (!newPassword) return null;

        if (newPassword.length < 8) {
            return "새 비밀번호는 8자 이상이어야 합니다.";
        }

        if (!passwordRuleRegex.test(newPassword)) {
            return "새 비밀번호는 영문, 숫자, 특수문자를 모두 포함해야 합니다.";
        }

        if (newPassword === currentPassword) {
            return "현재 비밀번호와 다른 비밀번호를 입력해 주세요.";
        }

        if (confirmPassword && newPassword !== confirmPassword) {
            return "새 비밀번호와 비밀번호 확인이 일치하지 않습니다.";
        }

        return null;
    }, [currentPassword, newPassword, confirmPassword]);

    const displayErrorMessage = validationMessage ?? errorMessage;

    const isSubmitDisabled =
        saving ||
        !currentPassword.trim() ||
        !newPassword.trim() ||
        !confirmPassword.trim() ||
        !!validationMessage;

    const handleCurrentPasswordChange = (value: string) => {
        setCurrentPassword(value);
        setMessage(null);
        setErrorMessage(null);
    };

    const handleNewPasswordChange = (value: string) => {
        setNewPassword(value);
        setMessage(null);
        setErrorMessage(null);
    };

    const handleConfirmPasswordChange = (value: string) => {
        setConfirmPassword(value);
        setMessage(null);
        setErrorMessage(null);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (isSubmitDisabled) return;

        try {
            setSaving(true);
            setMessage(null);
            setErrorMessage(null);

            const payload = {
                password: currentPassword,
                newPassword,
                confirmPassword,
            };

            await ChangePasswordApi(payload);

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setMessage("비밀번호가 성공적으로 변경되었습니다.");
        } catch (error: any) {
            console.error("비밀번호 변경 실패", error);

            const serverMessage =
                error?.response?.data?.errCodeMsg ||
                error?.response?.data?.message ||
                "비밀번호 변경에 실패했습니다.";

            setErrorMessage(serverMessage);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
            <div className="mb-6">
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                    비밀번호 변경
                </h2>
                <p className="mt-2 text-sm leading-6 text-(--brand-muted)">
                    현재 비밀번호를 확인한 뒤 새로운 비밀번호로 변경합니다.
                </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                    <label
                        htmlFor="currentPassword"
                        className="text-sm font-medium text-foreground"
                    >
                        현재 비밀번호
                    </label>
                    <input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => handleCurrentPasswordChange(e.target.value)}
                        placeholder="현재 비밀번호를 입력해 주세요"
                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-(--brand-primary) focus:ring-2 focus:ring-(--brand-primary)/20 dark:border-white/10 dark:bg-zinc-900"
                    />
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="newPassword"
                        className="text-sm font-medium text-foreground"
                    >
                        새 비밀번호
                    </label>
                    <input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => handleNewPasswordChange(e.target.value)}
                        placeholder="새 비밀번호를 입력해 주세요"
                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-(--brand-primary) focus:ring-2 focus:ring-(--brand-primary)/20 dark:border-white/10 dark:bg-zinc-900"
                    />
                    <p className="text-xs leading-5 text-(--brand-muted)">
                        영문, 숫자, 특수문자를 포함한 8자 이상으로 입력해 주세요.
                    </p>
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="confirmPassword"
                        className="text-sm font-medium text-foreground"
                    >
                        새 비밀번호 확인
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                        placeholder="새 비밀번호를 한 번 더 입력해 주세요"
                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-(--brand-primary) focus:ring-2 focus:ring-(--brand-primary)/20 dark:border-white/10 dark:bg-zinc-900"
                    />
                </div>

                {displayErrorMessage && (
                    <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                        {displayErrorMessage}
                    </p>
                )}

                {message && (
                    <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                        {message}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={isSubmitDisabled}
                    className="inline-flex min-w-[140px] items-center justify-center rounded-2xl bg-(--brand-primary) px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {saving ? "변경 중..." : "비밀번호 변경"}
                </button>
            </form>
        </div>
    );
}
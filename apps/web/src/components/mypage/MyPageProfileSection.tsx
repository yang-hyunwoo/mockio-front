"use client";

import { ChangeEvent } from "react";
import { Mail, Save, Upload, User } from "lucide-react";
import type { ProfileForm } from "@/app/(site)/mypage/page";

interface MyPageProfileSectionProps {
    profile: ProfileForm;
    profileSaving: boolean;
    profileMessage: string | null;
    profileImagePreview: string;
    onProfileChange: (key: keyof ProfileForm, value: string) => void;
    onProfileImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onProfileSave: () => void;
}

export default function MyPageProfileSection({
                                                 profile,
                                                 profileSaving,
                                                 profileMessage,
                                                 profileImagePreview,
                                                 onProfileChange,
                                                 onProfileImageChange,
                                                 onProfileSave,
                                             }: MyPageProfileSectionProps) {
    const profileInitial = profile.nickname.trim().charAt(0).toUpperCase() || "M";

    return (
        <section className="rounded-[28px] border border-black/5 bg-white/80 p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/3">
            <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-(--brand-primary)" />
                <h2 className="text-xl font-semibold text-foreground">내 정보</h2>
            </div>

            <p className="mt-2 text-sm leading-6 text-(--brand-muted)">
                프로필 이미지와 기본 정보를 수정할 수 있습니다.
            </p>

            <div className="mt-6 rounded-[24px] border border-black/5 bg-black/3 p-5 dark:border-white/10 dark:bg-white/4">
                <div className="flex flex-col items-center gap-4">
                    <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-white dark:border-white/10 dark:bg-black/20">
                        {profileImagePreview ? (
                            <img
                                src={profileImagePreview}
                                alt="프로필 이미지"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="text-3xl font-semibold text-(--brand-muted)">
                                {profileInitial}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <label
                            htmlFor="profile-image"
                            className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-foreground transition hover:bg-black/5 dark:border-white/10 dark:bg-black/20 dark:hover:bg-white/5"
                        >
                            <Upload className="h-4 w-4" />
                            이미지 선택
                        </label>

                        <input
                            id="profile-image"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={onProfileImageChange}
                            disabled={profileSaving}
                        />

                        <p className="text-xs text-(--brand-muted)">
                            JPG, PNG 형식의 이미지를 업로드할 수 있습니다.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-6 space-y-5">
                <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                        <User className="h-4 w-4 text-(--brand-muted)" />
                        닉네임
                    </label>
                    <input
                        maxLength={30}
                        type="text"
                        value={profile.nickname}
                        onChange={(e) => onProfileChange("nickname", e.target.value)}
                        placeholder="닉네임을 입력해주세요"
                        disabled={profileSaving}
                        className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm text-foreground outline-none transition placeholder:text-(--brand-muted) focus:border-(--brand-primary) dark:border-white/10 dark:bg-black/20"
                    />
                </div>

                <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Mail className="h-4 w-4 text-(--brand-muted)" />
                        이메일
                    </label>
                    <input
                        type="email"
                        value={profile.email}
                        readOnly
                        placeholder="이메일을 입력해주세요"
                        className="h-12 w-full cursor-not-allowed rounded-2xl border border-black/10 bg-black/5 px-4 text-sm text-(--brand-muted) outline-none placeholder:text-(--brand-muted) dark:border-white/10 dark:bg-white/5"
                    />
                    <p className="mt-2 text-xs text-(--brand-muted)">
                        이메일은 변경할 수 없습니다.
                    </p>
                </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-(--brand-muted)">
                    {profileMessage ?? "변경 후 저장 버튼을 눌러주세요."}
                </p>

                <button
                    type="button"
                    onClick={onProfileSave}
                    disabled={profileSaving}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-(--brand-primary) px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Save className="h-4 w-4" />
                    {profileSaving ? "저장 중..." : "내 정보 저장"}
                </button>
            </div>
        </section>
    );
}

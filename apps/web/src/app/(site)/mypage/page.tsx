"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { MyPageApi } from "@/lib/api/mypage/MyPageApi";
import {
    Track,
    Difficulty,
    FeedbackStyle,
    AnswerTimeSeconds,
    QuestionCount,
} from "@mockio/shared/src/api/mypage/MyPageEnum";
import { MyPageResponse } from "@mockio/shared/src/api/mypage/MyPageResponse";
import MyPageProfileSection from "@/components/mypage/MyPageProfileSection";
import MyPagePreferenceSection from "@/components/mypage/MyPagePreferenceSection";
import MyPageGuideSection from "@/components/mypage/MyPageGuideSection";
import { UpdateInterviewPreferenceApi } from "@/lib/api/mypage/UpdateInterviewPreferenceApi";
import { UpdateProfilePreferenceApi } from "@/lib/api/mypage/UpdateProfilePreferenceApi";
import { useAuthStore } from "@/store/authStore";

export interface ProfileForm {
    nickname: string;
    email: string;
    profileImageUrl: string;
    profileImageId: number;
}

export interface InterviewPreferenceForm {
    track: Track;
    difficulty: Difficulty;
    feedbackStyle: FeedbackStyle;
    answerTimeSeconds: AnswerTimeSeconds;
    questionCount: QuestionCount;
}

const EMPTY_PROFILE: ProfileForm = {
    nickname: "",
    email: "",
    profileImageUrl: "",
    profileImageId: 0,
};

const mapMyPageResponseToProfile = (data: MyPageResponse): ProfileForm => ({
    nickname: data.userProfileResponse.nickname ?? "",
    email: data.userProfileResponse.email ?? "",
    profileImageUrl: data.userProfileResponse.profileImageUrl ?? "",
    profileImageId: data.userProfileResponse.profileImageId ?? 0,
});

const mapMyPageResponseToPreference = (
    data: MyPageResponse
): InterviewPreferenceForm => ({
    track: data.interviewSettingResponse.track.code as Track,
    difficulty: data.interviewSettingResponse.difficulty.code as Difficulty,
    feedbackStyle: data.interviewSettingResponse.feedbackStyle.code as FeedbackStyle,
    answerTimeSeconds:
        data.interviewSettingResponse.answerTimeSeconds as AnswerTimeSeconds,
    questionCount:
        data.interviewSettingResponse.questionCount as QuestionCount,
});

export default function MyPage() {
    const accessToken = useAuthStore((s) => s.accessToken);
    const isInitialized = useAuthStore((s) => s.isInitialized);
    const user = useAuthStore((s) => s.user);
    const setUser = useAuthStore((s) => s.setUser);

    const isAuth = !!accessToken;

    const [profile, setProfile] = useState<ProfileForm | null>(null);
    const [preference, setPreference] = useState<InterviewPreferenceForm | null>(null);

    const [loading, setLoading] = useState(true);
    const [profileSaving, setProfileSaving] = useState(false);
    const [preferenceSaving, setPreferenceSaving] = useState(false);

    const [profileMessage, setProfileMessage] = useState<string | null>(null);
    const [preferenceMessage, setPreferenceMessage] = useState<string | null>(null);

    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
    const [profileImagePreview, setProfileImagePreview] = useState("");

    const didFetchRef = useRef(false);

    useEffect(() => {

        if (!isInitialized) {
            console.log("return: not initialized");
            return;
        }

        if (!isAuth) {
            console.log("return: not auth");
            setLoading(false);
            setProfile(null);
            setPreference(null);
            return;
        }

        let cancelled = false;

        const fetchMyPageData = async () => {
            console.log("fetchMyPageData start");

            try {
                setLoading(true);

                const response = await MyPageApi();
                console.log("MyPageApi response", response);

                if (cancelled) return;

                if (!response) {
                    setProfile(null);
                    setPreference(null);
                    return;
                }

                const mappedProfile = mapMyPageResponseToProfile(response);
                const mappedPreference = mapMyPageResponseToPreference(response);

                setProfile({
                    ...mappedProfile,
                    nickname: user?.nickname ?? mappedProfile.nickname,
                    email: user?.email ?? mappedProfile.email,
                });
                setPreference(mappedPreference);
                setProfileImagePreview(mappedProfile.profileImageUrl ?? "");
            } catch (error) {
                if (cancelled) return;

                console.error("마이페이지 정보 조회 실패", error);
                setProfile(null);
                setPreference(null);
            } finally {
                if (cancelled) return;
                setLoading(false);
            }
        };

        fetchMyPageData();

        return () => {
            cancelled = true;
        };
    }, [isInitialized, isAuth]);


    useEffect(() => {
        return () => {
            if (profileImagePreview.startsWith("blob:")) {
                URL.revokeObjectURL(profileImagePreview);
            }
        };
    }, [profileImagePreview]);

    const handleProfileChange = (key: keyof ProfileForm, value: string) => {
        setProfile((prev) => {
            if (!prev) return prev;

            return {
                ...prev,
                [key]: value,
            };
        });
    };

    const handlePreferenceChange = <T extends keyof InterviewPreferenceForm>(
        key: T,
        value: InterviewPreferenceForm[T]
    ) => {
        setPreference((prev) => {
            if (!prev) return prev;

            return {
                ...prev,
                [key]: value,
            };
        });
    };

    const handleProfileImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;

        if (!file) {
            return;
        }

        if (profileImagePreview.startsWith("blob:")) {
            URL.revokeObjectURL(profileImagePreview);
        }

        const previewUrl = URL.createObjectURL(file);

        setProfileImageFile(file);
        setProfileImagePreview(previewUrl);
        setProfileMessage(null);
    };

    const handleProfileSave = async () => {
        if (!profile) return;

        try {
            setProfileSaving(true);
            setProfileMessage(null);

            const formData = new FormData();
            formData.append("nickname", profile.nickname);

            if (profileImageFile) {
                formData.append("profileImage", profileImageFile);
            }

            await UpdateProfilePreferenceApi(formData);

            setProfile((prev) =>
                prev
                    ? {
                        ...prev,
                        nickname: profile.nickname,
                        email: profile.email,
                        profileImageUrl: profileImagePreview || prev.profileImageUrl,
                    }
                    : prev
            );

            setUser(
                user
                    ? {
                        ...user,
                        nickname: profile.nickname,
                        email: profile.email,
                    }
                    : {
                        id: null,
                        nickname: profile.nickname,
                        email: profile.email,
                    }
            );

            setProfileImageFile(null);
            setProfileMessage("내 정보가 저장되었습니다.");
        } catch (error) {
            console.error("내 정보 저장 실패", error);
            setProfileMessage("내 정보 저장에 실패했습니다.");
        } finally {
            setProfileSaving(false);
        }
    };

    const handlePreferenceSave = async () => {
        if (!preference) return;

        try {
            setPreferenceSaving(true);
            setPreferenceMessage(null);

            await UpdateInterviewPreferenceApi(preference);

            setPreferenceMessage("면접 설정이 저장되었습니다.");
        } catch (error) {
            console.error("면접 설정 저장 실패", error);
            setPreferenceMessage("면접 설정 저장에 실패했습니다.");
        } finally {
            setPreferenceSaving(false);
        }
    };

    if (!isInitialized || loading) {
        return (
            <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="overflow-hidden rounded-[28px] border border-black/5 bg-white/70 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/70">
                    <div className="px-6 py-10 sm:px-8">
                        <p className="text-sm font-semibold tracking-[0.18em] text-(--brand-primary)">
                            MY PAGE
                        </p>
                        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                            내 정보 및 면접 설정
                        </h1>
                        <p className="mt-4 text-sm text-(--brand-muted)">
                            마이페이지 정보를 불러오는 중입니다.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    if (!isAuth) {
        return (
            <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="overflow-hidden rounded-[28px] border border-black/5 bg-white/70 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/70">
                    <div className="px-6 py-10 sm:px-8">
                        <p className="text-sm font-semibold tracking-[0.18em] text-(--brand-primary)">
                            MY PAGE
                        </p>
                        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                            내 정보 및 면접 설정
                        </h1>
                        <p className="mt-4 text-sm text-red-500">
                            로그인 후 이용할 수 있습니다.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    if (!profile || !preference) {
        return (
            <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="overflow-hidden rounded-[28px] border border-black/5 bg-white/70 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/70">
                    <div className="px-6 py-10 sm:px-8">
                        <p className="text-sm font-semibold tracking-[0.18em] text-(--brand-primary)">
                            MY PAGE
                        </p>
                        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                            내 정보 및 면접 설정
                        </h1>
                        <p className="mt-4 text-sm text-red-500">
                            마이페이지 정보를 불러오지 못했습니다.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-[28px] border border-black/5 bg-white/70 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/70">
                <div className="border-b border-black/5 px-6 py-8 dark:border-white/10 sm:px-8">
                    <p className="text-sm font-semibold tracking-[0.18em] text-(--brand-primary)">
                        MY PAGE
                    </p>

                    <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                        내 정보 및 면접 설정
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-(--brand-muted)">
                        프로필 정보와 면접 환경 설정을 한 곳에서 관리할 수 있습니다.
                    </p>
                </div>

                <div className="grid gap-6 px-6 py-6 sm:px-8 xl:grid-cols-[1fr_1fr]">
                    <MyPageProfileSection
                        profile={profile}
                        profileSaving={profileSaving}
                        profileMessage={profileMessage}
                        profileImagePreview={profileImagePreview}
                        onProfileChange={handleProfileChange}
                        onProfileImageChange={handleProfileImageChange}
                        onProfileSave={handleProfileSave}
                    />

                    <MyPagePreferenceSection
                        preference={preference}
                        preferenceSaving={preferenceSaving}
                        preferenceMessage={preferenceMessage}
                        onPreferenceChange={handlePreferenceChange}
                        onPreferenceSave={handlePreferenceSave}
                    />
                </div>

                <MyPageGuideSection />
            </div>
        </section>
    );
}

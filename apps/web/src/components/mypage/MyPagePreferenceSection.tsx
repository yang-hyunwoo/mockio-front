"use client";

import {
    ANSWER_TIME_OPTIONS,
    FEEDBACK_STYLE_OPTIONS,
    DIFFICULTY_OPTIONS,
    QUESTION_COUNT_OPTIONS,
    TRACK, ANSWERS_STYLE_OPTIONS,
} from "@mockio/shared/src/api/mypage/MyPageEnum";
import { Brain, Settings2 } from "lucide-react";
import type { InterviewPreferenceForm } from "@/app/(site)/mypage/page";

interface MyPagePreferenceSectionProps {
    preference: InterviewPreferenceForm;
    preferenceSaving: boolean;
    preferenceMessage: string | null;
    onPreferenceSave: () => void;
    onPreferenceChange: <T extends keyof InterviewPreferenceForm>(
        key: T,
        value: InterviewPreferenceForm[T]
    ) => void;
}

const getOptionButtonClass = (selected: boolean) =>
    selected
        ? "rounded-2xl bg-(--brand-primary) px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(15,23,42,0.12)] transition"
        : "rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-black/5 dark:border-white/10 dark:bg-black/20 dark:hover:bg-white/5";

export default function MyPagePreferenceSection({
                                                    preference,
                                                    preferenceSaving,
                                                    preferenceMessage,
                                                    onPreferenceSave,
                                                    onPreferenceChange,
                                                }: MyPagePreferenceSectionProps) {
    return (
        <section className="rounded-[28px] border border-black/5 bg-white/80 p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/3">
            <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-(--brand-primary)" />
                <h2 className="text-xl font-semibold text-foreground">면접 설정</h2>
            </div>

            <p className="mt-2 text-sm leading-6 text-(--brand-muted)">
                직무, 난이도, 피드백 스타일, 답변 시간, 질문 개수를 설정할 수 있습니다.
            </p>

            <div className="mt-6 space-y-6">
                <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                        직무 트랙
                    </label>
                    <select
                        value={preference.track}
                        onChange={(e) =>
                            onPreferenceChange("track", e.target.value as InterviewPreferenceForm["track"])
                        }
                        disabled={preferenceSaving}
                        className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm text-foreground outline-none transition focus:border-(--brand-primary) dark:border-white/10 dark:bg-black/20"
                    >
                        {TRACK.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                        난이도
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {DIFFICULTY_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() =>
                                    onPreferenceChange("difficulty", option.value)
                                }
                                disabled={preferenceSaving}
                                className={getOptionButtonClass(
                                    preference.difficulty === option.value
                                )}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                        피드백 스타일
                    </label>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {FEEDBACK_STYLE_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() =>
                                    onPreferenceChange("feedbackStyle", option.value)
                                }
                                disabled={preferenceSaving}
                                className={getOptionButtonClass(
                                    preference.feedbackStyle === option.value
                                )}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                        답변 시간
                    </label>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {ANSWER_TIME_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() =>
                                    onPreferenceChange("answerTimeSeconds", option.value)
                                }
                                disabled={preferenceSaving}
                                className={getOptionButtonClass(
                                    preference.answerTimeSeconds === option.value
                                )}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                    <p className="mt-2 text-xs text-(--brand-muted)">
                        한 질문당 답변 가능한 시간을 빠르게 선택할 수 있습니다.
                    </p>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                        면접 질문 개수
                    </label>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {QUESTION_COUNT_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() =>
                                    onPreferenceChange("questionCount", option.value)
                                }
                                disabled={preferenceSaving}
                                className={getOptionButtonClass(
                                    preference.questionCount === option.value
                                )}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                    <p className="mt-2 text-xs text-(--brand-muted)">
                        한 번의 면접에서 진행할 기본 질문 개수를 선택할 수 있습니다.
                    </p>
                </div>
                <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                        답변 타입
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {ANSWERS_STYLE_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() =>
                                    onPreferenceChange("interviewMode", option.value)
                                }
                                disabled={preferenceSaving}
                                className={getOptionButtonClass(
                                    preference.interviewMode === option.value
                                )}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>



            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-(--brand-muted)">
                    {preferenceMessage ?? "설정은 다음 면접 시작 시 기본값으로 적용됩니다."}
                </p>

                <button
                    type="button"
                    onClick={onPreferenceSave}
                    disabled={preferenceSaving}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-(--brand-primary) px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Settings2 className="h-4 w-4" />
                    {preferenceSaving ? "저장 중..." : "면접 설정 저장"}
                </button>
            </div>
        </section>
    );
}

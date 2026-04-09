"use client";

import { useState, type KeyboardEvent } from "react";
import {
    ANSWER_TIME_OPTIONS,
    FEEDBACK_STYLE_OPTIONS,
    DIFFICULTY_OPTIONS,
    QUESTION_COUNT_OPTIONS,
    TRACK,
    ANSWERS_STYLE_OPTIONS,
} from "@mockio/shared/src/api/mypage/MyPageEnum";
import { Brain, Settings2, X } from "lucide-react";
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

const normalizeStack = (value: string) =>
    value.trim().toLowerCase().replace(/^#+/, "");

export default function MyPagePreferenceSection({
                                                    preference,
                                                    preferenceSaving,
                                                    preferenceMessage,
                                                    onPreferenceSave,
                                                    onPreferenceChange,
                                                }: MyPagePreferenceSectionProps) {
    const [stackInput, setStackInput] = useState("");

    const interviewKeyword = preference.interviewKeyword ?? [];

    const MAX_STACKS = 10;
    const MAX_KEYWORD_LENGTH = 50;

    const addStack = (rawValue: string) => {
        const normalized = normalizeStack(rawValue);

        if (!normalized) {
            setStackInput("");
            return;
        }

        if (normalized.length > MAX_KEYWORD_LENGTH) {
            setStackInput("");
            return;
        }

        if (interviewKeyword.length >= MAX_STACKS) {
            setStackInput("");
            return;
        }

        // 중복 방지
        if (interviewKeyword.includes(normalized)) {
            setStackInput("");
            return;
        }

        onPreferenceChange("interviewKeyword", [...interviewKeyword, normalized]);
        setStackInput("");
    };

    const removeStack = (target: string) => {
        onPreferenceChange(
            "interviewKeyword",
            interviewKeyword.filter((stack) => stack !== target)
        );
    };

    const handleStackKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (["Enter", ",", " "].includes(e.key)) {
            e.preventDefault();
            addStack(stackInput);
            return;
        }

        if (e.key === "Backspace" && !stackInput && interviewKeyword.length > 0) {
            removeStack(interviewKeyword[interviewKeyword.length - 1]);
        }
    };

    return (
        <section className="rounded-[28px] border border-black/5 bg-white/80 p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/3">
            <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-(--brand-primary)" />
                <h2 className="text-xl font-semibold text-foreground">면접 설정</h2>
            </div>

            <p className="mt-2 text-sm leading-6 text-(--brand-muted)">
                직무, 기술 스택, 난이도, 피드백 스타일, 답변 시간, 질문 개수를 설정할 수 있습니다.
            </p>

            <div className="mt-6 space-y-6">
                <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                        직무 트랙
                    </label>
                    <select
                        value={preference.track}
                        onChange={(e) => {
                            const nextTrack = e.target.value as InterviewPreferenceForm["track"];

                            onPreferenceChange("track", nextTrack);
                            onPreferenceChange("interviewKeyword", []);
                            setStackInput("");
                        }}
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
                        면접 키워드
                    </label>

                    <div className="rounded-2xl border border-black/10 bg-white px-3 py-3 dark:border-white/10 dark:bg-black/20">
                        <div className="flex flex-wrap items-center gap-2">
                            {interviewKeyword.map((stack) => (
                                <span
                                    key={stack}
                                    className="inline-flex items-center gap-1 rounded-full bg-(--brand-primary)/10 px-3 py-1 text-sm font-medium text-(--brand-primary)"
                                >
                                    #{stack}
                                    <button
                                        type="button"
                                        onClick={() => removeStack(stack)}
                                        disabled={preferenceSaving}
                                        className="rounded-full p-0.5 transition hover:bg-black/5 dark:hover:bg-white/10"
                                        aria-label={`${stack} 삭제`}
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </span>
                            ))}

                            <input
                                type="text"
                                value={stackInput}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value.length > MAX_KEYWORD_LENGTH) return;
                                    setStackInput(value);
                                }}
                                onKeyDown={handleStackKeyDown}
                                onBlur={() => {
                                    if (stackInput.trim()) {
                                        addStack(stackInput);
                                    }
                                }}
                                disabled={preferenceSaving}
                                placeholder="예: 키워드를 입력 해주세요."
                                className="min-w-[160px] flex-1 border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-(--brand-muted)"
                            />
                        </div>
                    </div>

                    <p className="mt-2 text-xs text-(--brand-muted)">
                        Enter, 스페이스, 쉼표로 스택을 추가할 수 있습니다.
                    </p>
                    <p className="mt-1 text-xs text-(--brand-muted)">
                        입력한 키워드를 기반으로 해당 기술에 맞는 면접 질문이 생성됩니다.
                    </p>
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
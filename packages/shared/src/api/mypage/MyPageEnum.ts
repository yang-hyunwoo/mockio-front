export type Track = "BACKEND_ENGINEER" |
    "FRONTEND_ENGINEER" |
    "SERVER_ENGINEER" |
    "DATA_ENGINEER" |
    "DESIGN" |
    "PRODUCT" |
    "BUSINESS" |
    "MARKETING" |
    "SALES" |
    "HR" |
    "GENERAL"
    ;

export type TrackAll = "ALL" |
    "BACKEND_ENGINEER" |
    "FRONTEND_ENGINEER" |
    "SERVER_ENGINEER" |
    "DATA_ENGINEER" |
    "DESIGN" |
    "PRODUCT" |
    "BUSINESS" |
    "MARKETING" |
    "SALES" |
    "HR" |
    "GENERAL"
    ;

export type FeedbackStyle = "STRICT" |
    "COACHING" |
    "FRIENDLY"
    ;

export type Difficulty = "EASY" |
    "MEDIUM" |
    "HARD";

export type QuestionCount = 3 |
    5 |
    7 |
    10;

export type AnswerTimeSeconds = 60 |
    120 |
    180 |
    240;

export type interviewMode = "TEXT" |
    "VOICE" ;

export const FEEDBACK_STYLE_OPTIONS: { value: FeedbackStyle; label: string }[] = [
    { value: "FRIENDLY", label: "부드럽게" },
    { value: "COACHING", label: "균형 있게" },
    { value: "STRICT", label: "직설적으로" },
];

export const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
    { value: "EASY", label: "쉬움" },
    { value: "MEDIUM", label: "보통" },
    { value: "HARD", label: "어려움" },
];

export const ANSWERS_STYLE_OPTIONS: {value: interviewMode; label: string  }[] = [
    {value: "TEXT", label:"텍스트"},
    {value:"VOICE", label:"보이스"}
]

export const QUESTION_COUNT_OPTIONS: { value: QuestionCount; label: string }[] = [
    { value: 3, label: "3개" },
    { value: 5, label: "5개" },
    { value: 7, label: "7개" },
    { value: 10, label: "10개" },
];

export const ANSWER_TIME_OPTIONS: { value: AnswerTimeSeconds; label: string }[] = [
    { value: 60, label: "60초" },
    { value: 120, label: "120초" },
    { value: 180, label: "180초" },
    { value: 240, label: "240초" },
];

export const TRACK: { value: Track; label: string }[] = [
    { value: "BACKEND_ENGINEER", label: "백엔드" },
    { value: "FRONTEND_ENGINEER", label: "프론트엔드" },
    { value: "SERVER_ENGINEER", label: "서버" },
    { value: "DATA_ENGINEER", label: "데이터 분석가" },
    { value: "DESIGN", label: "그래픽" },
    { value: "PRODUCT", label: "PM" },
    { value: "BUSINESS", label: "전략" },
    { value: "MARKETING", label: "마케팅" },
    { value: "SALES", label: "영업" },
    { value: "HR", label: "HR" },
    { value: "GENERAL", label: "범용" },
];

export const TRACKALL: { value: TrackAll; label: string }[] = [
    { value: "ALL", label: "전체" },
    { value: "BACKEND_ENGINEER", label: "백엔드 엔지니어" },
    { value: "FRONTEND_ENGINEER", label: "프론트엔드 엔지니어" },
    { value: "SERVER_ENGINEER", label: "서버 엔지니어" },
    { value: "DATA_ENGINEER", label: "데이터 분석가" },
    { value: "DESIGN", label: "그래픽" },
    { value: "PRODUCT", label: "PM" },
    { value: "BUSINESS", label: "전략" },
    { value: "MARKETING", label: "마케팅" },
    { value: "SALES", label: "영업" },
    { value: "HR", label: "HR" },
    { value: "GENERAL", label: "범용" },
];



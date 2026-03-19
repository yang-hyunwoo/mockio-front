import {EnumResponse} from "../EnumResponse";

export interface MyPageProfileDetailResponse {
    nickname: string
    email: string
    profileImageId: number | null
    profileImageUrl: string | null
}

export interface UserInterviewSettingReadResponse {
    id: number
    track: EnumResponse
    difficulty: EnumResponse
    feedbackStyle: EnumResponse
    interviewMode: EnumResponse
    answerTimeSeconds: number
    questionCount: number
}

export interface MyPageResponse {
    userProfileResponse: MyPageProfileDetailResponse
    interviewSettingResponse: UserInterviewSettingReadResponse
}
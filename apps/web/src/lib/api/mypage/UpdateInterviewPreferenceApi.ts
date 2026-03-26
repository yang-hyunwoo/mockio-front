import {api} from "@/lib/axios";
import type {InterviewPreferenceForm} from "@/app/(site)/mypage/page";
import {getClientApiEndpoints} from "@mockio/shared/src/api";

export const UpdateInterviewPreferenceApi = async (
    preference: InterviewPreferenceForm
): Promise<boolean> => {
    const endpoints = getClientApiEndpoints();

    await api.patch(
        `${endpoints.interview}/mypage/update-preference`,
        preference
    );

    return true;
};

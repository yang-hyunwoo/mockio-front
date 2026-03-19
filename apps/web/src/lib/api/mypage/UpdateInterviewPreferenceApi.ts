import { api } from "@/lib/axios"
import {apiEndpoints} from "@mockio/shared/src";
import type { InterviewPreferenceForm } from "@/app/(site)/mypage/page";

export const UpdateInterviewPreferenceApi = async (
    preference: InterviewPreferenceForm
): Promise<boolean> => {

    await api.patch(
        `${apiEndpoints.interview}/mypage/update-preference`,
        preference
    );

    return true;
};
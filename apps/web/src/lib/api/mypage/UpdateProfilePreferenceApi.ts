import { api } from "@/lib/axios"
import {apiEndpoints} from "@mockio/shared/src";
import type { ProfileForm } from "@/app/(site)/mypage/page";

export const UpdateProfilePreferenceApi = async (
    preference: FormData
): Promise<boolean> => {

    await api.patch(
        `${apiEndpoints.user}/mypage/profile`,
        preference
    );

    return true;
};
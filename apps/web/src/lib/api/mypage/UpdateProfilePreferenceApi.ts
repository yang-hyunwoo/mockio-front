import {api} from "@/lib/axios";
import {getClientApiEndpoints} from "@mockio/shared/src/api";

export const UpdateProfilePreferenceApi = async (
    preference: FormData
): Promise<boolean> => {
    const endpoints = getClientApiEndpoints();

    await api.patch(
        `${endpoints.user}/mypage/profile`,
        preference
    );

    return true;
};

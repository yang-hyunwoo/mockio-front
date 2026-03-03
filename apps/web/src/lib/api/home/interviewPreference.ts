import { api } from "@/lib/axios";
import { Preference } from "@mockio/shared/src/api/home/Preference";
import { apiEndpoints } from "@/lib/api";

export const interviewPreferenceApi = async (): Promise<Preference | null> => {
    try {
        const res = await api.get(
            `${apiEndpoints.interview}/me/get-preference`,
        );
        const data = res.data?.data;

        return {
            trackLabel: data?.track?.label ?? "",
            feedbackStyleLabel: data?.feedbackStyle?.label ?? "",
            difficultyLabel: data?.difficulty?.label ?? "",
        };
    } catch (e) {
        return null;
    }
};

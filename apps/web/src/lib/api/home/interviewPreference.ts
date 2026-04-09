import {api} from "@/lib/axios";
import {Preference} from "@mockio/shared/src/api/home/Preference";
import {getClientApiEndpoints} from "@/lib/api";

export const interviewPreferenceApi = async (): Promise<Preference | null> => {
    const endpoints = getClientApiEndpoints();

    try {
        const res = await api.get(
            `${endpoints.interview}/me/get-preference`,
        );
        const data = res.data?.data;

        return {
            trackLabel: data?.track?.label ?? "",
            feedbackStyleLabel: data?.feedbackStyle?.label ?? "",
            difficultyLabel: data?.difficulty?.label ?? "",
            interviewKeyword : data?.interviewKeyword ?? [],
        };
    } catch (e) {
        return null;
    }
};

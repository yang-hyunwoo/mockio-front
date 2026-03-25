import { GrowthSectionProps } from "@mockio/shared/src/api/mypage/InterviewHistoryResponse";
import { apiEndpoints } from "@mockio/shared/src";
import { api } from "@/lib/axios"
import { ApiResponse } from "@mockio/shared/src/api/ApiResponse";
import {TrackAll} from "@mockio/shared/src/api/mypage/MyPageEnum";

export const InterviewHistoryApi = async (
    page = 0,
    track?: TrackAll
): Promise<GrowthSectionProps | null> => {

    const params: any = { page };

    if (track && track !== "ALL") {
        params.track = track;
    }

    const response = await api.get<ApiResponse<GrowthSectionProps>>(
        `${apiEndpoints.interview}/history/score-list`,
        {
            params,
        }
    );

    return response.data.data ?? null;
};

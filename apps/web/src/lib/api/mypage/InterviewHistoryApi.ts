import { GrowthSectionProps } from "@mockio/shared/src/api/mypage/InterviewHistoryResponse";
import { api, apiEndpoints } from "@mockio/shared/src";
import { ApiResponse } from "@mockio/shared/src/api/ApiResponse";
import {TrackAll} from "@mockio/shared/src/api/mypage/MyPageEnum";

export const InterviewHistoryApi = async (
    page = 0,
    track?: TrackAll
): Promise<GrowthSectionProps | null> => {

    const params: any = { page };

    // 👉 ALL이 아닐 때만 추가
    if (track && track !== "ALL") {
        params.track = track;
    }

    const response = await api.get<ApiResponse<GrowthSectionProps>>(
        `${apiEndpoints.interview}/history/score-list`,
        {
            params,
        }
    );

    console.log(response.data.data);
    return response.data.data ?? null;
};
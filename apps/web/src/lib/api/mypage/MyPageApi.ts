import {api} from "@/lib/axios";
import {MyPageResponse} from "@mockio/shared/src/api/mypage/MyPageResponse";
import {ApiResponse} from "@mockio/shared/src/api/ApiResponse";
import {getClientApiEndpoints} from "@mockio/shared/src/api";

export const MyPageApi = async (): Promise<MyPageResponse | null> => {
    const endpoints = getClientApiEndpoints();

    const response = await api.get<ApiResponse<MyPageResponse>>(
        `${endpoints.user}/mypage/setting`
    )

    return response.data.data ?? null
}

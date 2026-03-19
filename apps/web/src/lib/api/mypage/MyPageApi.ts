import { api } from "@/lib/axios"
import { MyPageResponse } from "@mockio/shared/src/api/mypage/MyPageResponse"
import {ApiResponse} from "@mockio/shared/src/api/ApiResponse";
import {apiEndpoints} from "@mockio/shared/src";


export const MyPageApi = async (): Promise<MyPageResponse | null> => {
    const response = await api.get<ApiResponse<MyPageResponse>>(
        `${apiEndpoints.user}/mypage/setting`
    )

    return response.data.data ?? null
}
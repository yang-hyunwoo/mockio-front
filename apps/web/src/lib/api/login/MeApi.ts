import { api } from "@/lib/axios"
import { apiEndpoints } from "@/lib/api"
import {ApiResponse} from "@mockio/shared/src/api/ApiResponse";
import {LoginResponse} from "@mockio/shared/src/api/login/LoginResponse";


export const MeApi = async (
): Promise<LoginResponse | null> => {
    const response = await api.get<ApiResponse<LoginResponse>>(
        `${apiEndpoints.auth}/me`,
    )

    return response.data.data
}
import {api} from "@/lib/axios";
import {getClientApiEndpoints} from "@/lib/api";
import {ApiResponse} from "@mockio/shared/src/api/ApiResponse";
import {LoginRequest} from "@mockio/shared/src/api/login/LoginRequest";
import {LoginResponse} from "@mockio/shared/src/api/login/LoginResponse";

export const LoginApi = async (
    payload: LoginRequest
): Promise<LoginResponse | null> => {
    const endpoints = getClientApiEndpoints();

    const response = await api.post<ApiResponse<LoginResponse>>(
        `${endpoints.auth}/login`,
        payload,
    )

    return response.data.data
}

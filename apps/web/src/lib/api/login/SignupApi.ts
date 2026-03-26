import {api} from "@/lib/axios";
import {getClientApiEndpoints} from "@/lib/api";
import {SignupRequest} from "@mockio/shared/src/api/login/SignupRequest";
import {ApiResponse} from "@mockio/shared/src/api/ApiResponse";
import {SignupResponse} from "@mockio/shared/src/api/login/SignupResponse";

export const SignupApi = async (
    payload: SignupRequest
): Promise<SignupResponse | null> => {
        const endpoints = getClientApiEndpoints();

        const response = await api.post<ApiResponse<SignupResponse>>(
            `${endpoints.userPublic}/signup`,
            payload,
        )
        return response.data.data
}

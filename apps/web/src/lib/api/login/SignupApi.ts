import { api } from "@/lib/axios"
import { apiEndpoints } from "@/lib/api"
import {SignupRequest} from "@mockio/shared/src/api/login/SignupRequest";
import {ApiResponse} from "@mockio/shared/src/api/ApiResponse";
import {SignupResponse} from "@mockio/shared/src/api/login/SignupResponse";


export const SignupApi = async (
    payload: SignupRequest
): Promise<SignupResponse | null> => {
        const response = await api.post<ApiResponse<SignupResponse>>(
            `${apiEndpoints.userPublic}/signup`,
            payload,
        )
        return response.data.data
}
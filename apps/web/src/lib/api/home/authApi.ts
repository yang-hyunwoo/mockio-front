import axios from "axios";
import { api } from "@/lib/axios";
import { apiEndpoints } from "@/lib/api";
import { SessionValidateResponse } from "@mockio/shared/src/api/home/SessionValidateResponse";

export async function validateSession(): Promise<SessionValidateResponse | null> {
    try {
        const res = await api.get<SessionValidateResponse>(
            `${apiEndpoints.authPublic}/session/validate`
        );
        return res.data;
    } catch (e) {
        if (axios.isAxiosError(e) && e.response?.status === 401) {
            return null;
        }
        throw e;
    }
}
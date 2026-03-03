import { api } from "@/lib/axios";
import { SessionValidateResponse } from "@mockio/shared/src/api/home/SessionValidateResponse";
import { apiEndpoints } from "@/lib/api";

export async function validateSession() {
    const res = await api.get<SessionValidateResponse>(`${apiEndpoints.authPublic}/session/validate`);
    return res.data;
}

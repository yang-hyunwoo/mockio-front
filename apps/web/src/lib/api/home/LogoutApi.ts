import { api } from "@/lib/axios";
import { apiEndpoints } from "@/lib/api";
export const logoutApi = async () => {
    await api.post(`${apiEndpoints.authPublic}/logout`);
};
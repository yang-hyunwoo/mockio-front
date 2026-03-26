import {api} from "@/lib/axios";
import {getClientApiEndpoints} from "@/lib/api";


export const logoutApi = async () => {
    const endpoints = getClientApiEndpoints();

    await api.post(`${endpoints.auth}/logout`);
};

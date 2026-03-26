import {FaqItem} from "@mockio/shared/src/api/faq/FaqItem";
import { api } from "@/lib/axios"
import {getClientApiEndpoints} from "@mockio/shared/src/api";

export interface FaqListResponse {
    items: FaqItem[];
}

const endpoints = getClientApiEndpoints();

export const FaqListApi = async (): Promise<FaqListResponse> => {
    const response = await api.get(
        `${endpoints.faqPublic}/faq/list`,
    );

    return response.data.data;
};

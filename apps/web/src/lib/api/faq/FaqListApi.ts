import {apiEndpoints} from "@mockio/shared/src";
import {FaqItem} from "@mockio/shared/src/api/faq/FaqItem";
import { api } from "@/lib/axios"

export interface FaqListResponse {
    items: FaqItem[];
}

export const FaqListApi = async (): Promise<FaqListResponse> => {
    const response = await api.get(
        `${apiEndpoints.faqPublic}/faq/list`,
    );

    return response.data.data;
};
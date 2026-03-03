import { api } from "@/lib/axios";
import { apiEndpoints } from "@/lib/api";
import { Interview } from "@mockio/shared/src/api/home/Interview";

export const interviewListApi = async (): Promise<Interview[]> => {
    try {
        const res = await api.get(
            `${apiEndpoints.interview}/main/list`
        );

        const list =
            res.data?.data?.interviews ??
            [];
        return list.map((item: any) => ({
            id: item.id,
            title: item.title,
            createdAt: item.createdAt,
            progress: item.progress,
        }));

    } catch (e) {
        console.error(e);
        return [];
    }
};

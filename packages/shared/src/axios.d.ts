import "axios";

type LoadingType = "top" | "center" | "none";

declare module "axios" {
    export interface AxiosRequestConfig {
        meta?: {
            loading?: LoadingType;
        };
    }

    export interface InternalAxiosRequestConfig {
        meta?: {
            loading?: LoadingType;
        };
    }
}
"use client";

import axios, {
    AxiosError,
    AxiosRequestConfig,
    InternalAxiosRequestConfig,
} from "axios";
import { apiBaseUrl, apiEndpoints } from "@mockio/shared/src/api";
import { useAuthStore } from "@/store/authStore";

const AUTH_PATH_REGEXES = [
    /^\/api\/auth\/v1\/login$/,
    /^\/api\/auth\/v1\/logout$/,
    /^\/api\/[^/]+\/v1\/public(?:\/.*)?$/,
    /^\/\.well-known(?:\/.*)?$/,
];

type LoadingType = "top" | "center" | "none";

type LoadingMetaConfig = {
    meta?: {
        loading?: LoadingType;
    };
};

type RetryAxiosRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
};

function emitLoadingStart(type: Exclude<LoadingType, "none">) {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
        new CustomEvent("global-loading:start", { detail: { type } })
    );
}

function emitLoadingEnd(type: Exclude<LoadingType, "none">) {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
        new CustomEvent("global-loading:end", { detail: { type } })
    );
}

function getLoadingType(
    config?: AxiosRequestConfig | InternalAxiosRequestConfig
): LoadingType {
    const loadingConfig = config as (AxiosRequestConfig & LoadingMetaConfig) | undefined;
    return loadingConfig?.meta?.loading ?? "top";
}

export const api = axios.create({
    baseURL: apiBaseUrl,
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        const loadingType = getLoadingType(config);

        if (loadingType === "top" || loadingType === "center") {
            emitLoadingStart(loadingType);
        }

        const accessToken = useAuthStore.getState().accessToken;
        console.log("accessToken:::",accessToken);
        if (accessToken) {
            config.headers = config.headers ?? {};
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => {
        const loadingType = getLoadingType(error.config);

        if (loadingType === "top" || loadingType === "center") {
            emitLoadingEnd(loadingType);
        }

        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        const loadingType = getLoadingType(response.config);

        if (loadingType === "top" || loadingType === "center") {
            emitLoadingEnd(loadingType);
        }

        return response;
    },
    async (error: AxiosError<any>) => {
        const loadingType = getLoadingType(error.config);

        if (loadingType === "top" || loadingType === "center") {
            emitLoadingEnd(loadingType);
        }

        if (!error.response || !error.config) {
            return Promise.reject(error);
        }

        const originalRequest = error.config as RetryAxiosRequestConfig;
        const status = error.response.status;

        if (
            status === 401
            &&
            !originalRequest._retry &&
            !isAuthPath(originalRequest.url)
        ) {
            originalRequest._retry = true;

            try {
                const refreshResponse = await axios.get(
                    `${apiEndpoints.authPublic}/refresh`,
                    { withCredentials: true }
                );

                const newAccessToken = refreshResponse.data?.data?.accessToken;

                if (!newAccessToken) {
                    useAuthStore.getState().clearAuth();
                    moveToLogin();
                    return Promise.reject(error);
                }

                useAuthStore.getState().setAccessToken(newAccessToken);

                originalRequest.headers = originalRequest.headers ?? {};
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return api(originalRequest);
            } catch (refreshError) {
                useAuthStore.getState().clearAuth();
                // moveToLogin();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

function isAuthPath(url?: string) {
    if (!url) return false;

    let path = url;

    if (typeof window !== "undefined") {
        try {
            path = new URL(url, window.location.origin).pathname;
        } catch {
            path = url;
        }
    }

    return AUTH_PATH_REGEXES.some((regex) => regex.test(path));
}

function moveToLogin() {
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
    }
}
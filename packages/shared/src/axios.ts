"use client";

import axios, {
    AxiosError,
    AxiosRequestConfig,
    InternalAxiosRequestConfig,
} from "axios";
import { apiBaseUrl } from "./api";

const AUTH_PATH_PREFIXES = ["/api/auth/v1/public", "/.well-known"];

type LoadingType = "top" | "center" | "none";

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

type LoadingMetaConfig = {
    meta?: {
        loading?: LoadingType;
    };
};

function getLoadingType(
    config?: AxiosRequestConfig | InternalAxiosRequestConfig
): LoadingType {
    const loadingConfig = config as (AxiosRequestConfig & LoadingMetaConfig) | undefined;
    return loadingConfig?.meta?.loading ?? "top";
}

export const api = axios.create({
    baseURL: apiBaseUrl,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const loadingType = getLoadingType(config);

        if (loadingType === "top" || loadingType === "center") {
            emitLoadingStart(loadingType);
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
    (error: AxiosError<any>) => {
        const loadingType = getLoadingType(error.config);

        if (loadingType === "top" || loadingType === "center") {
            emitLoadingEnd(loadingType);
        }

        if (!error.response) {
            return Promise.reject(error);
        }

        const status = error.response.status;
        const currentPath =
            typeof window !== "undefined" ? window.location.pathname : "";

        if (status === 401) {
            const reqUrl = error.config?.url;

            if (!isAuthPath(reqUrl) && currentPath !== "/login") {
                window.location.href = `http://localhost:9000/api/auth/v1/public/login`;
            }
        }

        return Promise.reject(error);
    }
);

function isAuthPath(url?: string) {
    if (!url) return false;

    try {
        const u = new URL(url, window.location.origin);
        return AUTH_PATH_PREFIXES.some((p) => u.pathname.startsWith(p));
    } catch {
        return AUTH_PATH_PREFIXES.some((p) => url.startsWith(p));
    }
}
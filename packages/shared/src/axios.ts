"use client";

import axios, { AxiosError } from "axios";
import { apiBaseUrl } from "./api";

const AUTH_PATH_PREFIXES = [
    "/api/auth/v1/public",
    "/.well-known",
];

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// (선택) 요청 로깅이 필요하면 여기서 찍기
api.interceptors.request.use((config) => {
  return config;
});

api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<any>) => {
      // 네트워크 오류
      if (!error.response) {
        // 필요하면 토스트/알림
        // alert("서버에 연결할 수 없습니다. 잠시후 시도 해주세요.");
        return Promise.reject(error);
      }

      const status = error.response.status;
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "";

      //  인증 만료/미인증 처리: 401
      if (status === 401) {
        if (currentPath !== "/login") {
          // 2) 또는 "서버 주도 로그인"이면 바로 게이트웨이 로그인 시작
            const reqUrl = error.config?.url;
            if (!isAuthPath(reqUrl) && currentPath !== "/login") {
                window.location.href = `http://localhost:9000/api/auth/v1/public/login`;
            }
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
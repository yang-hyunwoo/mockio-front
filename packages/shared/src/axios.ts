"use client";

import axios from "axios";

import { apiBaseUrl } from "./api";

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window === "undefined") {
    return config;
  }

  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const deleteCookie = (name: string) => {
  if (typeof document === "undefined") {
    return;
  }
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};

api.interceptors.response.use(
  (response) => {
    if (typeof window !== "undefined") {
      const newToken = response.headers["authorization"];
      if (newToken) {
        localStorage.setItem("accessToken", newToken);
        document.cookie = `accessToken=${newToken}; path=/;`;
      }
    }

    return response;
  },
  async (error: any) => {
    if (typeof window === "undefined") {
      return Promise.reject(error);
    }

    const requestUrl = error.config?.url ?? "";
    const currentPath = window.location.pathname;
    if (currentPath === "/login") {
      return Promise.reject(error);
    }

    if (
      error?.response?.data?.code === "SC_ERR400" ||
      error?.response?.data?.code === "SC_ERR401" ||
      error?.response?.data?.code === "SC_ERR402" ||
      error?.response?.data?.code === "SC_ERR404"
    ) {
      localStorage.removeItem("accessToken");
      deleteCookie("accessToken");
      deleteCookie("refresh-token");
      deleteCookie("isAutoLogin");
    }

    if (requestUrl.includes("/user/me")) {
      return Promise.reject(error);
    }

    if (error?.message === "Network Error") {
      alert("서버에 연결할 수 없습니다. 잠시후 시도 해주세요.");
    }

    if (error.response?.data?.errCode === "ERR_004") {
      alert("로그인 정보가 없습니다\n로그인 페이지로 이동합니다.");
      window.location.href = `/login?redirectTo=${currentPath}`;
    }

    return Promise.reject(error);
  }
);

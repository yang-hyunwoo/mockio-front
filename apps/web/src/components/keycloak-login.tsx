"use client";

import { useEffect, useState } from "react";

import {
  getKeycloak,
  getKeycloakRedirectUri,
  getKeycloakSilentCheckSsoUri,
  isKeycloakConfigured,
} from "@/lib/keycloak";

type AuthState = "idle" | "loading" | "authenticated" | "unauthenticated" | "error";

type KeycloakLoginProps = {
  primaryLabel?: string;
  loadingLabel?: string;
};

export default function KeycloakLogin({
  primaryLabel = "로그인하고 시작",
  loadingLabel = "로그인 상태 확인 중...",
}: KeycloakLoginProps) {
  const keycloak = getKeycloak();
  const [status, setStatus] = useState<AuthState>("idle");
  const [username, setUsername] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isKeycloakConfigured()) {
      setStatus("error");
      setErrorMessage("Missing Keycloak environment variables.");
      return;
    }

    setStatus("loading");
    keycloak
      .init({
        onLoad: "check-sso",
        pkceMethod: "S256",
        checkLoginIframe: false,
        silentCheckSsoRedirectUri: getKeycloakSilentCheckSsoUri(),
      })
      .then((authenticated) => {
        if (!authenticated) {
          setStatus("unauthenticated");
          return;
        }

        setStatus("authenticated");
        setUsername(keycloak.tokenParsed?.preferred_username ?? null);
      })
      .catch((error) => {
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "Keycloak init failed.");
      });
  }, [keycloak]);

  const handleLogin = () => {
    setErrorMessage(null);
    keycloak.login({ redirectUri: getKeycloakRedirectUri() });
  };

  const handleLogout = () => {
    setErrorMessage(null);
    keycloak.logout({ redirectUri: window.location.origin });
  };

  if (status === "authenticated") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-[#5c6c7e]">
          {username ? `${username}님으로 로그인됨.` : "로그인 완료."}
        </p>
        <button
          type="button"
          className="h-11 rounded-full border border-solid border-[#d7dde6] bg-white px-5 text-sm font-semibold text-[#2d4a6a] transition-colors hover:border-[#2d4a6a]/40 hover:bg-[#f2f6fb]"
          onClick={handleLogout}
        >
          로그아웃
        </button>
      </div>
    );
  }

  const isReady = status !== "loading";
  const isConfigured = isKeycloakConfigured();

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        className="h-11 rounded-full bg-[#355a7a] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#2f4f6b] disabled:cursor-not-allowed disabled:bg-[#94a3b8]"
        onClick={handleLogin}
        disabled={!isReady || !isConfigured}
      >
        {isReady ? primaryLabel : loadingLabel}
      </button>
      {status === "error" ? (
        <div className="rounded-lg border border-dashed border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage ?? "Keycloak configuration error."}
        </div>
      ) : null}
    </div>
  );
}

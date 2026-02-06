"use client";

import { useEffect, useState } from "react";

import {
  getKeycloak,
  getKeycloakRedirectUri,
  getKeycloakSilentCheckSsoUri,
  isKeycloakConfigured,
} from "@/lib/keycloak";

type AuthState = "idle" | "loading" | "authenticated" | "unauthenticated" | "error";

export default function KeycloakLogin() {
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
        <p className="text-sm text-zinc-600">
          Signed in {username ? `as ${username}` : "successfully"}.
        </p>
        <button
          type="button"
          className="h-11 rounded-full border border-solid border-black/10 px-5 text-sm font-medium transition-colors hover:border-transparent hover:bg-black/5"
          onClick={handleLogout}
        >
          Sign out
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
        className="h-11 rounded-full bg-black px-5 text-sm font-medium text-white transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:bg-black/40"
        onClick={handleLogin}
        disabled={!isReady || !isConfigured}
      >
        {isReady ? "Sign in with Keycloak" : "Checking login status..."}
      </button>
      {status === "error" ? (
        <div className="rounded-lg border border-dashed border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage ?? "Keycloak configuration error."}
        </div>
      ) : null}
    </div>
  );
}

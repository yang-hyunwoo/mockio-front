"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getKeycloak,
  getKeycloakSilentCheckSsoUri,
  isKeycloakConfigured,
} from "@/lib/keycloak";

export default function LoginCallbackPage() {
  const router = useRouter();
  const keycloak = getKeycloak();
  const [message, setMessage] = useState("Finishing sign-in...");

  useEffect(() => {
    if (!isKeycloakConfigured()) {
      setMessage("Missing Keycloak configuration.");
      return;
    }

    keycloak
      .init({
        onLoad: "check-sso",
        pkceMethod: "S256",
        checkLoginIframe: false,
        silentCheckSsoRedirectUri: getKeycloakSilentCheckSsoUri(),
      })
      .then((authenticated) => {
        if (!authenticated) {
          setMessage("Sign-in failed. Please try again.");
          return;
        }

        router.replace("/");
      })
      .catch((error) => {
        setMessage(error instanceof Error ? error.message : "Sign-in failed.");
      });
  }, [keycloak, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-sm text-zinc-600">
      {message}
    </div>
  );
}

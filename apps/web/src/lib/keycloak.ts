import Keycloak, { type KeycloakConfig } from "keycloak-js";

const keycloakConfig: KeycloakConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL ?? "",
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM ?? "",
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID ?? "",
};

let keycloakInstance: Keycloak | null = null;

export const isKeycloakConfigured = () =>
  Boolean(keycloakConfig.url && keycloakConfig.realm && keycloakConfig.clientId);

export const getKeycloakRedirectUri = () => {
  if (typeof window === "undefined") {
    return "";
  }

  return `${window.location.origin}/login/callback`;
};

export const getKeycloakSilentCheckSsoUri = () => {
  if (typeof window === "undefined") {
    return "";
  }

  return `${window.location.origin}/silent-check-sso.html`;
};

export const getKeycloak = () => {
  if (!keycloakInstance) {
    keycloakInstance = new Keycloak(keycloakConfig);
  }

  return keycloakInstance;
};

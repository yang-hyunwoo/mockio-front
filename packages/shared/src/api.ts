const normalizeBaseUrl = (value?: string) => {
  if (!value) {
    return "";
  }
  return value.endsWith("/") ? value.slice(0, -1) : value;
};

const getEnv = () => {
  if (typeof globalThis !== "undefined" && "process" in globalThis) {
    const proc = (globalThis as { process?: { env?: Record<string, string> } }).process;
    return proc?.env ?? {};
  }
  return {};
};

const env = getEnv();
const rawBaseUrl =
  env.NEXT_PUBLIC_API_URL ??
  env.API_URL ??
  env.EXPO_PUBLIC_API_URL ??
  "";

export const apiBaseUrl = normalizeBaseUrl(rawBaseUrl);

const version = "v1";

export const apiEndpoints = {
  user: `${apiBaseUrl}/users/${version}`,
  notification: `${apiBaseUrl}/notification/${version}`,
  chat: `${apiBaseUrl}/chat/${version}`,
  ai: `${apiBaseUrl}/ai/${version}`,
  auth: `${apiBaseUrl}/auth/${version}`,
  feedback: `${apiBaseUrl}/feedback/${version}`,
  noti: `${apiBaseUrl}/noti/${version}`,
  inquiry: `${apiBaseUrl}/inquiry/${version}`,
  faq: `${apiBaseUrl}/faq/${version}`,

  userPublic: `${apiBaseUrl}/users/${version}/public`,
  notificationPublic: `${apiBaseUrl}/notification/${version}/public`,
  chatPublic: `${apiBaseUrl}/chat/${version}/public`,
  aiPublic: `${apiBaseUrl}/ai/${version}/public`,
  notiPublic: `${apiBaseUrl}/noti/${version}/public`,
  faqPublic: `${apiBaseUrl}/faq/${version}/public`,
};

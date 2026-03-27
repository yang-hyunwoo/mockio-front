const normalizeBaseUrl = (value?: string) => {
  if (!value) {
    throw new Error("API URL is not defined");
  }
  return value.endsWith("/") ? value.slice(0, -1) : value;
};

const version = "v1";

const createEndpoints = (baseUrl: string) => ({
  user: `${baseUrl}/users/${version}`,
  notification: `${baseUrl}/notification/${version}`,
  chat: `${baseUrl}/chat/${version}`,
  ai: `${baseUrl}/ai/${version}`,
  auth: `${baseUrl}/auth/${version}`,
  feedback: `${baseUrl}/feedback/${version}`,
  noti: `${baseUrl}/notice/${version}`,
  inquiry: `${baseUrl}/inquiry/${version}`,
  faq: `${baseUrl}/faq/${version}`,
  interview: `${baseUrl}/interview/${version}`,

  userPublic: `${baseUrl}/users/${version}/public`,
  notificationPublic: `${baseUrl}/notification/${version}/public`,
  chatPublic: `${baseUrl}/chat/${version}/public`,
  aiPublic: `${baseUrl}/ai/${version}/public`,
  notiPublic: `${baseUrl}/notice/${version}/public`,
  faqPublic: `${baseUrl}/faq/${version}/public`,
  authPublic: `${baseUrl}/auth/${version}/public`,
});  

export const getClientApiBaseUrl = () =>
    normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL);

export const getClientApiEndpoints = () =>
    createEndpoints(getClientApiBaseUrl());

export const getServerApiBaseUrl = () =>
    normalizeBaseUrl(process.env.API_URL);

export const getServerApiEndpoints = () =>
    createEndpoints(getServerApiBaseUrl());
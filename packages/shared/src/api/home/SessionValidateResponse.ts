export type SessionValidateResponse = {
  userId: string;
  roles: string[];
  username?: string;
  preferredUsername?: string;
  provider?: string;
  name?: string;
};
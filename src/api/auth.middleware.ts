import {
  createKindeServerClient,
  GrantType,
  type SessionManager,
  type UserType,
} from "@kinde-oss/kinde-typescript-sdk";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import type { Context } from "hono";
import { EnvConfig } from "../../env";

export const kindeClient = createKindeServerClient(
  GrantType.AUTHORIZATION_CODE,
  {
    authDomain: EnvConfig.KINDE_ISSUER_URL,
    clientId: EnvConfig.KINDE_CLIENT_ID,
    clientSecret: EnvConfig.KINDE_CLIENT_SECRET,
    redirectURL: EnvConfig.KINDE_REDIRECT_URI,
    logoutRedirectURL: EnvConfig.KINDE_LOGOUT_REDIRECT_URI,
  },
);

type Env = {
  Variables: {
    user: UserType & { name?: string };
  };
};

export const sessionManager = (c: Context): SessionManager => ({
  async getSessionItem(key: string) {
    const result = getCookie(c, key);
    return result;
  },
  async setSessionItem(key: string, value: unknown) {
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
    } as const;
    if (typeof value === "string") {
      setCookie(c, key, value, cookieOptions);
    } else {
      setCookie(c, key, JSON.stringify(value), cookieOptions);
    }
  },
  async removeSessionItem(key: string) {
    deleteCookie(c, key);
  },
  async destroySession() {
    for (const key of ["id_token", "access_token", "user", "refresh_token"]) {
      deleteCookie(c, key);
    }
  },
});

export const getUser = createMiddleware<Env>(async (c, next) => {
  if (EnvConfig.HOSTING_MODE === 'selfhost') {
    c.set("user", {
      id: 'local-user',
      email: 'local-user@localhost',
      family_name: 'Local',
      given_name: 'User',
      name: 'Local User',
      picture: ''
    })
    return next();
  }
  try {
    const manager = sessionManager(c);

    const isAuthenticated = await kindeClient.isAuthenticated(manager);
    if (!isAuthenticated) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const user = await kindeClient.getUserProfile(manager);
    c.set("user", user);

    await next();
  } catch (e) {
    return c.json({ error: "Unauthorized" }, 401);
  }
});
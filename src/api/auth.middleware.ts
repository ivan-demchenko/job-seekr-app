import {
  createKindeServerClient,
  GrantType,
  type ACClient,
  type SessionManager,
  type UserType,
} from "@kinde-oss/kinde-typescript-sdk";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import type { Context, MiddlewareHandler } from "hono";
import type { CloudEnvConf, EnvType } from "../../env";

type Env = {
  Variables: {
    user: UserType & { name?: string };
  };
};

const getTrueAuthMiddleware = (env: CloudEnvConf): WithAuthMiddleware => {
  const sessionManager = (c: Context): SessionManager => ({
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
  const authClient = createKindeServerClient(
    GrantType.AUTHORIZATION_CODE,
    {
      authDomain: env.KINDE_ISSUER_URL,
      clientId: env.KINDE_CLIENT_ID,
      clientSecret: env.KINDE_CLIENT_SECRET,
      redirectURL: env.KINDE_REDIRECT_URI,
      logoutRedirectURL: env.KINDE_LOGOUT_REDIRECT_URI,
    },
  );
  const middleware = createMiddleware<Env>(async (c, next) => {
    try {
      const manager = sessionManager(c);

      const isAuthenticated = await authClient.isAuthenticated(manager);
      if (!isAuthenticated) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const user = await authClient.getUserProfile(manager);
      c.set("user", user);

      await next();
    } catch (e) {
      return c.json({ error: "Unauthorized" }, 401);
    }
  });
  return {
    _kind: 'cloud',
    middleware,
    sessionManager,
    authClient
  }
}

const getFakeAuthMiddleware = (): WithAuthMiddleware => {
  const middleware = createMiddleware<Env>(async (c, next) => {
    c.set("user", {
      id: 'local-user',
      email: 'local-user@localhost',
      family_name: 'Local',
      given_name: 'User',
      name: 'Local User',
      picture: ''
    })
    return next();
  });
  return {
    _kind: 'local',
    middleware
  }
}

export type WithAuthMiddleware =
  | {
    _kind: 'cloud'
    middleware: MiddlewareHandler<Env, string, {}>
    sessionManager: (c: Context) => SessionManager
    authClient: ACClient
  }
  | {
    _kind: 'local'
    middleware: MiddlewareHandler<Env, string, {}>
  }

export const makeAuthMiddleware = (
  env: EnvType
): WithAuthMiddleware => {
  return env.HOSTING_MODE === 'cloud'
    ? getTrueAuthMiddleware(env)
    : getFakeAuthMiddleware();
}
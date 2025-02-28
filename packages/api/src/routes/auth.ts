import { Hono } from "hono";
import type { WithAuthMiddleware } from "../auth.middleware";

export function makeAuthRouter(
  authMiddleware: WithAuthMiddleware,
) {
  return new Hono()
    .get("/login", async (c) => {
      if (authMiddleware._kind === 'cloud') {
        const { authClient, sessionManager } = authMiddleware;
        const loginUrl = await authClient.login(sessionManager(c));
        return c.redirect(loginUrl.toString());
      }
      return c.redirect('/');
    })
    .get("/register", async (c) => {
      if (authMiddleware._kind === 'cloud') {
        const { authClient, sessionManager } = authMiddleware;
        const registerUrl = await authClient.register(sessionManager(c));
        return c.redirect(registerUrl.toString());
      }
      return c.redirect('/');
    })
    .get("/callback", async (c) => {
      if (authMiddleware._kind === 'cloud') {
        const { authClient, sessionManager } = authMiddleware;
        const url = new URL(c.req.url);
        await authClient.handleRedirectToApp(sessionManager(c), url);
        return c.redirect("/");
      }
      return c.redirect("/");
    })
    .get("/logout", async (c) => {
      if (authMiddleware._kind === 'cloud') {
        const { authClient, sessionManager } = authMiddleware;
        const logoutUrl = await authClient.logout(sessionManager(c));
        return c.redirect(logoutUrl.toString());
      }
      return c.redirect("/");
    })
    .get("/me", authMiddleware.middleware, async (c) => {
      const user = c.var.user;
      return c.json({ user });
    });
}
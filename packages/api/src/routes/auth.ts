import { Hono } from "hono";
import type { WithAuthMiddleware } from "../auth.middleware";

/**
 * Creates the router for handling authentication-related endpoints.
 * @param authMiddleware - Middleware for authentication and authorization.
 * @returns A configured Hono router for authentication endpoints.
 */
export function makeAuthRouter(authMiddleware: WithAuthMiddleware) {
  return new Hono()
    /**
     * GET /api/auth/login
     * Redirects the user to the login page.
     * For cloud-based authentication, generates a login URL.
     */
    .get("/login", async (c) => {
      if (authMiddleware._kind === "cloud") {
        const { authClient, sessionManager } = authMiddleware;
        const loginUrl = await authClient.login(sessionManager(c));
        return c.redirect(loginUrl.toString());
      }
      return c.redirect("/");
    })
    /**
     * GET /api/auth/register
     * Redirects the user to the registration page.
     * For cloud-based authentication, generates a registration URL.
     */
    .get("/register", async (c) => {
      if (authMiddleware._kind === "cloud") {
        const { authClient, sessionManager } = authMiddleware;
        const registerUrl = await authClient.register(sessionManager(c));
        return c.redirect(registerUrl.toString());
      }
      return c.redirect("/");
    })
    /**
     * GET /api/auth/callback
     * Handles the callback after a user logs in or registers.
     * For cloud-based authentication, processes the redirect and logs the user in.
     */
    .get("/callback", async (c) => {
      if (authMiddleware._kind === "cloud") {
        const { authClient, sessionManager } = authMiddleware;
        const url = new URL(c.req.url);
        await authClient.handleRedirectToApp(sessionManager(c), url);
        return c.redirect("/");
      }
      return c.redirect("/");
    })
    /**
     * GET /api/auth/logout
     * Logs the user out and redirects them to the logout page.
     * For cloud-based authentication, generates a logout URL.
     */
    .get("/logout", async (c) => {
      if (authMiddleware._kind === "cloud") {
        const { authClient, sessionManager } = authMiddleware;
        const logoutUrl = await authClient.logout(sessionManager(c));
        return c.redirect(logoutUrl.toString());
      }
      return c.redirect("/");
    })
    /**
     * GET /api/auth/me
     * Retrieves the authenticated user's information.
     */
    .get("/me", authMiddleware.middleware, async (c) => {
      const user = c.var.user;
      return c.json({ user });
    });
}

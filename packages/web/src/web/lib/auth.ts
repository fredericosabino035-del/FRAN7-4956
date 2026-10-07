import { createAuthClient } from "better-auth/react";
import { managedAuthClient } from "@runablehq/managed-auth/client";
export const emailToken = () => sessionStorage.getItem("fran7_session") || "";
export const authClient = createAuthClient({
  baseURL: window.location.origin,
  basePath: "/api/auth",
  fetchOptions: { auth: { type: "Bearer", token: emailToken } },
  plugins: [
    managedAuthClient({
      applicationId: import.meta.env.VITE_APPLICATION_ID,
      issuer: import.meta.env.VITE_RUNABLE_AUTH_ISSUER,
    }),
  ],
});
export function captureSession(ctx: { response: Response }) {
  const token = ctx.response.headers.get("set-auth-token");
  if (token) sessionStorage.setItem("fran7_session", token);
}
export async function signOut() {
  await authClient.signOut();
  sessionStorage.removeItem("fran7_session");
}

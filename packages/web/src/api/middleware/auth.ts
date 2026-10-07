import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { auth } from "../auth";
export const admin = base.use(async ({ context, next }) => {
  const session = await auth.api.getSession({ headers: context.headers });
  if (!session) throw new ORPCError("UNAUTHORIZED");
  if (
    !session.user.emailVerified ||
    session.user.email.toLowerCase() !== "fran7officiall@gmail.com"
  )
    throw new ORPCError("FORBIDDEN", {
      message: "Acesso reservado à conta verificada da FRAN7.",
    });
  return next({ context: { user: session.user } });
});

export const authed = base.use(async ({ context, next }) => {
  const session = await auth.api.getSession({ headers: context.headers });
  if (!session) throw new ORPCError("UNAUTHORIZED");
  return next({ context: { user: session.user } });
});

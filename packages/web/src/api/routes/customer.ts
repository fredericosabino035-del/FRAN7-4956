import { z } from "zod";
import { eq } from "drizzle-orm";
import { authed } from "../middleware/auth";
import { db } from "../database";
import { customerProfiles } from "../database/schema";
const details = z.object({
  phone: z
    .string()
    .trim()
    .max(25)
    .refine(
      (v) => !v || /^[+\d\s()-]{6,25}$/.test(v),
      "Número de telefone inválido.",
    ),
  birthday: z
    .string()
    .max(5)
    .refine((v) => {
      if (!v) return true;
      if (!/^\d{2}\/\d{2}$/.test(v)) return false;
      const [d, m] = v.split("/").map(Number);
      return m >= 1 && m <= 12 && d >= 1 && d <= new Date(2000, m, 0).getDate();
    }, "Usa uma data válida no formato DD/MM."),
  marketing: z.boolean(),
});
export const customer = {
  profile: authed.handler(async ({ context }) => {
    const [p] = await db
      .select()
      .from(customerProfiles)
      .where(eq(customerProfiles.userId, context.user.id));
    return {
      name: context.user.name,
      email: context.user.email,
      emailVerified: context.user.emailVerified,
      phone: p?.phone || "",
      birthday: p?.birthday || "",
      marketing: p?.marketing || false,
    };
  }),
  save: authed.input(details).handler(async ({ context, input }) => {
    await db
      .insert(customerProfiles)
      .values({ userId: context.user.id, ...input })
      .onConflictDoUpdate({ target: customerProfiles.userId, set: input });
    return { ok: true };
  }),
};

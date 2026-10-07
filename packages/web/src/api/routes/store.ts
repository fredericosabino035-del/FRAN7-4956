import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { admin } from "../middleware/auth";
import { db } from "../database";
import { products, comments } from "../database/schema";
const productInput = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(2).max(100),
  price: z.number().int().min(0).max(100000000),
  image: z
    .string()
    .max(3000000)
    .refine(
      (v) =>
        /^\/images\/[\w.-]+$/.test(v) ||
        /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(v),
      "Imagem inválida",
    ),
  category: z.enum(["Unissexo", "Mulheres", "Homens", "Crianças"]),
  kind: z.enum(["T-shirts", "Bonés"]),
  sizes: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1).max(2000),
  provisional: z.boolean(),
  releaseLabel: z.string().trim().max(60),
});
const recent = new Map<string, number>();
export const store = {
  list: base.handler(() => db.select().from(products).orderBy(products.id)),
  access: admin.handler(({ context }) => ({ email: context.user.email })),
  update: admin.input(productInput).handler(async ({ input }) => {
    const { id, ...data } = input;
    const [p] = await db
      .update(products)
      .set(data)
      .where(eq(products.id, id))
      .returning();
    return p;
  }),
  comments: base
    .input(z.object({ productId: z.number().int().positive() }))
    .handler(({ input }) =>
      db
        .select()
        .from(comments)
        .where(eq(comments.productId, input.productId))
        .orderBy(desc(comments.id))
        .limit(50),
    ),
  comment: base
    .input(
      z.object({
        productId: z.number().int().positive(),
        name: z.string().trim().min(2).max(50),
        body: z.string().trim().min(3).max(500),
        website: z.string().max(0),
      }),
    )
    .handler(async ({ input, context }) => {
      const [p] = await db
        .select()
        .from(products)
        .where(eq(products.id, input.productId));
      if (!p) throw new ORPCError("NOT_FOUND");
      const key =
        context.headers.get("x-forwarded-for")?.split(",")[0] || "anonymous";
      const now = Date.now();
      const last = recent.get(key) || 0;
      if (now - last < 15000)
        throw new ORPCError("TOO_MANY_REQUESTS", {
          message: "Espera alguns segundos antes de comentar novamente.",
        });
      recent.set(key, now);
      if (recent.size > 10000) recent.clear();
      const [c] = await db
        .insert(comments)
        .values({
          productId: input.productId,
          name: input.name,
          body: input.body,
          createdAt: new Date().toISOString(),
        })
        .returning();
      return c;
    }),
  removeComment: admin
    .input(z.object({ id: z.number().int() }))
    .handler(async ({ input }) => {
      await db.delete(comments).where(eq(comments.id, input.id));
      return { ok: true };
    }),
};

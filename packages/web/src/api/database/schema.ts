import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
export * from "./auth-schema";
export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  image: text("image").notNull(),
  category: text("category").notNull(),
  kind: text("kind").notNull(),
  sizes: text("sizes").notNull(),
  description: text("description").notNull(),
  releaseLabel: text("release_label").notNull().default(""),
  provisional: integer("provisional", { mode: "boolean" })
    .notNull()
    .default(true),
});
export const comments = sqliteTable("comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id),
  name: text("name").notNull(),
  body: text("body").notNull(),
  createdAt: text("created_at").notNull(),
});

export const customerProfiles = sqliteTable("customer_profiles", {
  userId: text("user_id").primaryKey(),
  phone: text("phone").notNull().default(""),
  birthday: text("birthday").notNull().default(""),
  marketing: integer("marketing", { mode: "boolean" }).notNull().default(false),
});

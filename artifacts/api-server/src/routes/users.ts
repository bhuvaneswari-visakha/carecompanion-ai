import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateUserBody } from "@workspace/api-zod";

const router: IRouter = Router();

function serialize(u: typeof usersTable.$inferSelect) {
  return {
    id: u.id,
    name: u.name,
    email: u.email ?? null,
    phone: u.phone ?? null,
    createdAt: u.createdAt.toISOString(),
  };
}

router.post("/users", async (req, res) => {
  const parsed = CreateUserBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
  }
  const { name, email, phone } = parsed.data;
  const [created] = await db
    .insert(usersTable)
    .values({ name, email: email ?? null, phone: phone ?? null })
    .returning();
  return res.json(serialize(created));
});

router.get("/users", async (_req, res) => {
  const rows = await db.select().from(usersTable);
  return res.json(rows.map(serialize));
});

router.get("/users/:id", async (req, res) => {
  const id = req.params["id"]!;
  const [row] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!row) return res.status(404).json({ error: "User not found" });
  return res.json(serialize(row));
});

export default router;

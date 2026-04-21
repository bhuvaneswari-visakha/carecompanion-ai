import { Router, type IRouter } from "express";
import { db, appointmentsTable } from "@workspace/db";
import { and, desc, eq } from "drizzle-orm";
import { CreateAppointmentBody, UpdateAppointmentBody } from "@workspace/api-zod";

const router: IRouter = Router();

function serialize(a: typeof appointmentsTable.$inferSelect) {
  return {
    id: a.id,
    userId: a.userId,
    doctorName: a.doctorName,
    specialty: a.specialty,
    date: a.date,
    time: a.time,
    reason: a.reason ?? null,
    status: a.status,
    createdAt: a.createdAt.toISOString(),
  };
}

router.post("/appointments", async (req, res) => {
  const parsed = CreateAppointmentBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
  }
  const { userId, doctorName, specialty, date, time, reason } = parsed.data;
  const [created] = await db
    .insert(appointmentsTable)
    .values({ userId, doctorName, specialty, date, time, reason: reason ?? null })
    .returning();
  return res.json(serialize(created));
});

router.get("/appointments/user/:userId", async (req, res) => {
  const userId = req.params["userId"]!;
  const rows = await db
    .select()
    .from(appointmentsTable)
    .where(eq(appointmentsTable.userId, userId))
    .orderBy(desc(appointmentsTable.date));
  return res.json(rows.map(serialize));
});

router.put("/appointments/:id", async (req, res) => {
  const id = req.params["id"]!;
  const parsed = UpdateAppointmentBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
  }
  const updates = parsed.data;
  const patch: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(updates)) {
    if (v !== undefined) patch[k] = v;
  }
  if (Object.keys(patch).length === 0) {
    const [row] = await db.select().from(appointmentsTable).where(eq(appointmentsTable.id, id));
    if (!row) return res.status(404).json({ error: "Appointment not found" });
    return res.json(serialize(row));
  }
  const [updated] = await db
    .update(appointmentsTable)
    .set(patch)
    .where(eq(appointmentsTable.id, id))
    .returning();
  if (!updated) return res.status(404).json({ error: "Appointment not found" });
  return res.json(serialize(updated));
});

router.delete("/appointments/:id", async (req, res) => {
  const id = req.params["id"]!;
  const [updated] = await db
    .update(appointmentsTable)
    .set({ status: "cancelled" })
    .where(and(eq(appointmentsTable.id, id)))
    .returning();
  if (!updated) return res.status(404).json({ error: "Appointment not found" });
  return res.json(serialize(updated));
});

export default router;

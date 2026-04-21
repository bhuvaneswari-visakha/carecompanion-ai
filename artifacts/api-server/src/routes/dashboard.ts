import { Router, type IRouter } from "express";
import { db, appointmentsTable, conversationsTable, usersTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard/:userId", async (req, res) => {
  const userId = req.params["userId"]!;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) return res.status(404).json({ error: "User not found" });

  const appts = await db
    .select()
    .from(appointmentsTable)
    .where(eq(appointmentsTable.userId, userId))
    .orderBy(desc(appointmentsTable.date));

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = appts.filter((a) => a.status === "booked" && a.date >= today);
  const past = appts.filter((a) => a.status !== "booked" || a.date < today);

  const recentConvos = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.userId, userId))
    .orderBy(desc(conversationsTable.createdAt))
    .limit(5);

  const totalConvos = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.userId, userId));

  const ser = (a: typeof appointmentsTable.$inferSelect) => ({
    id: a.id,
    userId: a.userId,
    doctorName: a.doctorName,
    specialty: a.specialty,
    date: a.date,
    time: a.time,
    reason: a.reason ?? null,
    status: a.status,
    createdAt: a.createdAt.toISOString(),
  });

  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email ?? null,
      phone: user.phone ?? null,
      createdAt: user.createdAt.toISOString(),
    },
    upcomingAppointments: upcoming.map(ser),
    pastAppointments: past.map(ser),
    totalAppointments: appts.length,
    totalConversations: totalConvos.length,
    recentConversations: recentConvos.map((c) => ({
      id: c.id,
      userId: c.userId,
      message: c.message,
      response: c.response,
      createdAt: c.createdAt.toISOString(),
    })),
  });
});

export default router;

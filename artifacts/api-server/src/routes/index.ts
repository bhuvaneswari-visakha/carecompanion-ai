import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import appointmentsRouter from "./appointments";
import chatRouter from "./chat";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.get("/", (_req, res) => {
  res.json({
    status: "success",
    message: "CareCompanion AI Backend is running",
    endpoints: {
      health: "/api/healthz",
      users: "/api/users",
      appointments: "/api/appointments",
      chat: "/api/chat",
      conversations: "/api/conversations/:userId",
      dashboard: "/api/dashboard/:userId",
    },
  });
});

router.use(healthRouter);
router.use(usersRouter);
router.use(appointmentsRouter);
router.use(chatRouter);
router.use(dashboardRouter);

export default router;

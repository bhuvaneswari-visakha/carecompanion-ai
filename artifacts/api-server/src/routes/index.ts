import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import appointmentsRouter from "./appointments";
import chatRouter from "./chat";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(appointmentsRouter);
router.use(chatRouter);
router.use(dashboardRouter);

export default router;

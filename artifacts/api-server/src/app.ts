import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

app.use("/api", (_req: Request, res: Response) => {
  res.status(404).json({ status: "error", message: "Route not found" });
});

app.use(
  (err: unknown, req: Request, res: Response, _next: NextFunction) => {
    req.log.error({ err }, "Unhandled error");
    const message =
      err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({ status: "error", message });
  },
);

export default app;

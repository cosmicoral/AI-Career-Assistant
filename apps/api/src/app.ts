import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { requireAuth } from "./middleware/auth";
import { errorHandler } from "./middleware/error-handler";
import { aiRouter } from "./routes/ai";
import { applicationsRouter } from "./routes/applications";
import { assessmentCentreRouter } from "./routes/assessment-centre";
import { healthRouter } from "./routes/health";
import { interviewNotesRouter } from "./routes/interview-notes";
import { networkingRouter } from "./routes/networking";
import { onlineTestsRouter } from "./routes/online-tests";
import { profileRouter } from "./routes/profile";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.APP_ORIGIN,
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(
  rateLimit({
    windowMs: 60_000,
    limit: 120,
    standardHeaders: "draft-7",
    legacyHeaders: false
  })
);

app.use("/api/health", healthRouter);
app.use("/api/ai", requireAuth, aiRouter);
app.use("/api/profile", requireAuth, profileRouter);
app.use("/api/applications", requireAuth, applicationsRouter);
app.use("/api/interview-notes", requireAuth, interviewNotesRouter);
app.use("/api/networking", requireAuth, networkingRouter);
app.use("/api/assessment-centre", requireAuth, assessmentCentreRouter);
app.use("/api/online-tests", requireAuth, onlineTestsRouter);

app.use(errorHandler);

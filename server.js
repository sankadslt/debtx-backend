/*
  Purpose: This template is used for the main server page.
  Created Date: 2024-11-21
  Created By: Janendra Chamodi (apjanendra@gmail.com)
  Last Modified Date: 2024-12-7
  Modified By: Janendra Chamodi, Lasandi Randini
  Version: Node.js v20.11.1
*/

import express, { json } from "express";
import { config } from "dotenv";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { swaggerSpec } from "./swaggerOptions.js";
import helmet from "helmet";
import crypto from "crypto";

// Routes
import DRC_serviceRouter from "./routes/DRC_Service_route.js";
import rtomRouter from "./routes/RTOM_route.js";
import drcRouter from "./routes/DRC_route.js";
import RORoutes from "./routes/RO_route.js";
import serviceRouter from "./routes/Service_route.js";
import sequenceRouter from "./routes/Sequence_route.js";
import incidentRouter from "./routes/Incident_route.js";
import caseRouter from "./routes/Case_route.js";
import authRouter from "./routes/Auth.js";
import taskRouter from "./routes/Task_route.js";
import taskListRouter from "./routes/TaskList_route.js";
import chartRouter from "./routes/chart.js";
import commissionRouter from "./routes/Commission_route.js";
import tmpSLTApprovalRouter from "./routes/Tmp_SLT_Approval_routes.js";
import MoneyTransactionRouter from "./routes/Money_Transaction_route.js";
import fileDownloadRouter from "./routes/File_Download_Log_route.js";
import SettlementRouter from "./routes/Settlement_route.js";
import litigationRouter from "./routes/Litigation_route.js";
import LodRoutes from "./routes/LOD_route.js";
import FTL_LODRoutes from "./routes/FTL_LOD_route.js";
import User from "./routes/User_route.js";
// import "./passport.js"

config();
const app = express();
const PORT = process.env.PORT || 5000;

// === Security Headers ===
app.use(helmet());
app.use(helmet.frameguard({ action: "deny" }));
app.use(helmet.noSniff());
app.use(helmet.xssFilter());

// Disable cache
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  next();
});

// CSP with nonce
app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString("base64");
  res.locals.cspNonce = nonce;

  if (!req.path.startsWith("/api") && !req.path.startsWith("/api-docs")) {
    res.setHeader("Content-Security-Policy",
      `default-src 'self';
       script-src 'self' 'nonce-${nonce}';
       style-src 'self' 'nonce-${nonce}';
       img-src 'self' data:;
       connect-src 'self' wss://oneidentitytest.slt.com.lk;
       font-src 'self';
       frame-ancestors 'none';
       form-action 'self';`
    );
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  next();
});

// === Middlewares ===
app.use(json());
app.use(cors({
  origin: [
    process.env.CLIENT_URL || "http://localhost:5173",
    "http://124.43.177.52:8080",
    "http://debtx.slt.lk:8080",
    "https://debtx.slt.lk"
  ],
  credentials: true,
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// === Routes ===
app.use("/api/DRC", drcRouter);
app.use("/api/service", serviceRouter);
app.use("/api/DRC_service", DRC_serviceRouter);
app.use("/api/sequence", sequenceRouter);
app.use("/api/RTOM", rtomRouter);
app.use("/api/recovery_officer", RORoutes);
app.use("/api/incident", incidentRouter);
app.use("/api/case", caseRouter);
app.use("/api/auth", authRouter);
app.use("/api/task", taskRouter);
app.use("/api/taskList", taskListRouter);
app.use("/api", chartRouter);
app.use("/api", tmpSLTApprovalRouter);
app.use("/api/money", MoneyTransactionRouter);
app.use("/api/settlement", SettlementRouter);
app.use("/api/commission", commissionRouter);
app.use("/api/file", fileDownloadRouter);
app.use("/api/lod", LodRoutes);
app.use("/api/litigation", litigationRouter);
app.use("/api/ftl_lod", FTL_LODRoutes);
app.use("/api/user", User);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

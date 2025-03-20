/* 
        Purpose: This template is used for the main server page.
        Created Date: 2024-11-21
        Created By: Janendra Chamodi (apjanendra@gmail.com)
        Last Modified Date: 2024-12-7
        Modified By: Janendra Chamodi (apjanendra@gmail.com)
                    Lasandi Randini (randini-im20057@stu.kln.ac.lk)
        Version: Node.js v20.11.1
        Dependencies: cors , dotenv , express
        Related Files: DRC_route.js,swaggerOptions.js
        Notes: This template uses Node. 
*/


import express, { json } from "express";
import { config } from "dotenv";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { swaggerSpec } from "./swaggerOptions.js";
import DRC_serviceRouter from "./routes/DRC_Service_route.js";
import rtomRouter from "./routes/RTOM_route.js";
import drcRouter from "./routes/DRC_route.js";
import RORoutes from "./routes/RO_route.js";
import serviceRouter from "./routes/Service_route.js";
import sequenceRouter from "./routes/Sequence_route.js";
import incidentRouter from "./routes/Incident_route.js";
import caseRouter from "./routes/Case_route.js"
import authRouter from "./routes/Auth.js";
import taskRouter from "./routes/Task_route.js";
import taskListRouter from "./routes/TaskList_route.js";
import chartRouter from "./routes/chart.js";
import tmpSLTApprovalRouter from "./routes/Tmp_SLT_Approval_routes.js";
import MoneyTransactionRouter from "./routes/Money_Transaction_route.js";

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(json());
app.use(cors({ origin:[ process.env.CLIENT_URL || "http://220.247.224.226:9561","http://220.247.224.226:9562","http://220.247.224.226:9563","http://dptestserver1.slt.lk:9561","http://dptestserver1.slt.lk:9562","http://dptestserver1.slt.lk:9563"],credentials: true,}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
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
app.use("/api/money",MoneyTransactionRouter);

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

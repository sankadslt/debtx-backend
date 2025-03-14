import { Router } from "express";
import { getMoneyCommissions

 } from "../controllers/Money_Commission_controller";

const router = Router();

router.post("/getMoneyCommissions", getMoneyCommissions);
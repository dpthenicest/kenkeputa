// src/routes/auth.routes.ts
import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { registerSchema, loginSchema } from "../validation/auth.validation";

const router = Router();

router.post("/register", validate(registerSchema), authController.AuthController.register);
router.post("/login", validate(loginSchema), authController.AuthController.login);

export default router;

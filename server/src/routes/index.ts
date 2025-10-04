import { Router } from "express";
import { helloWorld } from "../controllers/helloController";

const router = Router();

router.get("/", (req, res) => res.send("Welcome to Express + TypeScript API"));
router.get("/hello", helloWorld);

export default router;

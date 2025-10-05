import { Router } from "express";
import { orderController } from "../controllers/order.controller";
import { validate } from "../middlewares/validate.middleware";
import { createOrderSchema, updateOrderStatusSchema } from "../validation/order.validation";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// ✅ All routes require authentication
router.use(authMiddleware);

router.post("/", validate(createOrderSchema), orderController.createOrder);
router.put("/:orderId/status", validate(updateOrderStatusSchema), orderController.updateStatus);
router.get("/", orderController.getUserOrders);

export default router;

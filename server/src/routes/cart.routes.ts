import { Router } from "express";
import { cartController } from "../controllers/cart.controller";
import { validate } from "../middlewares/validate.middleware";
import {
  addToCartSchema,
  updateCartSchema,
  removeFromCartSchema,
} from "../validation/cart.validation";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// ✅ All routes require authentication
router.use(authMiddleware);

router.get("/", cartController.getUserCart);
router.post("/add", validate(addToCartSchema), cartController.addToCart);
router.put("/update/:cartItemId", validate(updateCartSchema), cartController.updateCart);
router.delete("/remove/:cartItemId", validate(removeFromCartSchema), cartController.removeFromCart);

export default router;

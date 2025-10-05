import { Router } from "express";
import { productController } from "../controllers/product.controller";
import { validate } from "../middlewares/validate.middleware";
import { createProductSchema, updateProductSchema } from "../validation/product.validation";
import { authMiddleware, adminGuard } from "../middlewares/auth.middleware";

const router = Router();

// 🛡️ Only Admins can create, update, and delete products
router.post("/", authMiddleware, adminGuard, validate(createProductSchema), productController.create);
router.put("/:id", authMiddleware, adminGuard, validate(updateProductSchema), productController.update);
router.delete("/:id", authMiddleware, adminGuard, productController.delete);

// 👥 Public routes
router.get("/", productController.findAll);
router.get("/:id", productController.findById);

export default router;

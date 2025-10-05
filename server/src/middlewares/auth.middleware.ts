import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { AppError } from "../utils/appError";
import { IAuthPayload } from "../types";

declare global {
  namespace Express {
    interface Request {
      user?: IAuthPayload;
    }
  }
}

/**
 * Middleware to verify JWT and attach decoded user payload to req.user
 */
export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Authentication token missing or malformed", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token) as IAuthPayload;
    if (!decoded || !decoded.id) {
      return next(new AppError("Invalid token payload", 401));
    }

    req.user = decoded;
    next();
  } catch (error) {
    return next(new AppError("Invalid or expired token", 401));
  }
};

/**
 * Restricts access to admin-only routes
 */
export const adminGuard = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError("Unauthorized access", 401));
  }

  if (req.user.role !== "ADMIN") {
    return next(new AppError("Forbidden: Admin access required", 403));
  }

  next();
};

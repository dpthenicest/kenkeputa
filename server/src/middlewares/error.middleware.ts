import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/appError";

// Global error handler middleware
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("🔥 Error caught by middleware:", err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Handle known operational errors (AppError)
  if (err instanceof AppError) {
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }

  // Prisma known request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        statusCode = 409;
        message = `Duplicate field value violates unique constraint: ${err.meta?.target}`;
        break;
      case "P2025":
        statusCode = 404;
        message = "Record not found";
        break;
      default:
        message = "Database operation failed";
        break;
    }
  }

  // Prisma validation or initialization errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Invalid data provided to database";
  }

  // Zod validation errors
  if (err.name === "ZodError") {
    statusCode = 400;
    return res.status(statusCode).json({
      success: false,
      message: "Validation failed",
      errors: err.errors.map((e: any) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  // Default fallback error
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

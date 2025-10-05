// src/middlewares/validate.middleware.ts
import { Request, Response, NextFunction } from "express";
import { ZodError, ZodObject, ZodTypeAny } from "zod";

export const validate =
  (schema: ZodObject<any> | ZodTypeAny) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // Detect if schema expects { body, query, params }
      if (
        schema instanceof ZodObject &&
        ("body" in (schema as any).shape ||
          "query" in (schema as any).shape ||
          "params" in (schema as any).shape)
      ) {
        schema.parse({
          body: req.body,
          query: req.query,
          params: req.params,
        });
      } else {
        schema.parse(req.body);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        });
      }

      next(error);
    }
  };

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Marks trusted errors (e.g. user or validation errors)

    Error.captureStackTrace(this, this.constructor);
  }
}

import { Request, Response } from "express";

export const helloWorld = (req: Request, res: Response): void => {
  res.json({ message: "Hello, TypeScript with Express!" });
};

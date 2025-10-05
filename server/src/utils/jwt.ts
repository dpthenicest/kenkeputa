import jwt from "jsonwebtoken"
import { IAuthPayload } from "../types";
import { ENV } from "../config/env";

export const generateToken = (payload: IAuthPayload): string => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not defined");

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const verifyToken = (token: string): IAuthPayload => {
  return jwt.verify(token, ENV.JWT_SECRET) as IAuthPayload;
};

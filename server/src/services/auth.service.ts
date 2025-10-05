import prisma from "../lib/prisma";
import { hashPassword, comparePassword } from "../utils/hashPassword";
import { generateToken } from "../utils/jwt";
import { IUserCreate, IAuthResponse } from "../types";

export class AuthService {
  static async register(data: IUserCreate): Promise<IAuthResponse> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) throw new Error("Email already in use");

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        password: hashedPassword,
        role: "USER",
      },
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  }

  static async login(data: IUserCreate): Promise<IAuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) throw new Error("Invalid credentials");

    const isValid = await comparePassword(data.password, user.password);
    if (!isValid) throw new Error("Invalid credentials");

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  }
}

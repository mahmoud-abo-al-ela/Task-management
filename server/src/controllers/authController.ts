import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { AuthRequest } from "../middleware/auth";

const COOKIE_NAME = "token";
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

function createToken(userId: string) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET as string,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    } as jwt.SignOptions,
  );
}

function sendToken(res: Response, userId: string) {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie(COOKIE_NAME, createToken(userId), {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    maxAge: SEVEN_DAYS,
    path: "/",
  });
}

export async function register(req: Request, res: Response) {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: "Email is already registered" });
  }

  const user = await User.create({ name, email, password });

  sendToken(res, user._id.toString());
  res.status(201).json({
    user: { id: user._id, name: user.name, email: user.email },
  });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  sendToken(res, user._id.toString());
  res.json({
    user: { id: user._id, name: user.name, email: user.email },
  });
}

export function logout(_req: Request, res: Response) {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  res.json({ message: "Logged out" });
}

export async function getMe(req: AuthRequest, res: Response) {
  const user = await User.findById(req.userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ id: user._id, name: user.name, email: user.email });
}

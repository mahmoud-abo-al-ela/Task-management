import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";

import app from "../app";
import { User } from "../models/User";

let mongoServer: MongoMemoryServer;

// Runs MongoDB in memory so tests never touch the real database.
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

const newUser = {
  name: "Mahmoud",
  email: "mahmoud@example.com",
  password: "123456",
};

describe("auth", () => {
  it("registers a user and returns a token", async () => {
    const res = await request(app).post("/api/auth/register").send(newUser);

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
  });

  it("rejects an email that is already registered", async () => {
    await request(app).post("/api/auth/register").send(newUser);
    const res = await request(app).post("/api/auth/register").send(newUser);

    expect(res.status).toBe(409);
  });

  it("logs in with the correct password", async () => {
    await request(app).post("/api/auth/register").send(newUser);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: newUser.email, password: newUser.password });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("rejects a wrong password", async () => {
    await request(app).post("/api/auth/register").send(newUser);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: newUser.email, password: "wrong" });

    expect(res.status).toBe(401);
  });

  it("blocks /me without a token", async () => {
    const res = await request(app).get("/api/auth/me");

    expect(res.status).toBe(401);
  });
});

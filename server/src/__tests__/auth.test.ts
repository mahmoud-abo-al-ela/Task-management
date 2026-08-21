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
  password: "password123",
};

describe("auth", () => {
  it("registers a user and sets the auth cookie", async () => {
    const res = await request(app).post("/api/auth/register").send(newUser);

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(newUser.email);

    const cookies = res.headers["set-cookie"] as unknown as string[];
    expect(cookies.join()).toContain("token=");
    expect(cookies.join()).toContain("HttpOnly");
  });

  it("never sends the password back", async () => {
    const res = await request(app).post("/api/auth/register").send(newUser);

    expect(res.body.user.password).toBeUndefined();
    expect(res.body.token).toBeUndefined();
  });

  it("stores the password hashed", async () => {
    await request(app).post("/api/auth/register").send(newUser);

    const saved = await User.findOne({ email: newUser.email });
    expect(saved!.password).not.toBe(newUser.password);
  });

  it("rejects an email that is already registered", async () => {
    await request(app).post("/api/auth/register").send(newUser);
    const res = await request(app).post("/api/auth/register").send(newUser);

    expect(res.status).toBe(409);
  });

  it("rejects a password that is too weak", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...newUser, password: "short1" });

    expect(res.status).toBe(400);
  });

  it("logs in with the correct password", async () => {
    await request(app).post("/api/auth/register").send(newUser);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: newUser.email, password: newUser.password });

    expect(res.status).toBe(200);
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("gives the same answer for a wrong password and an unknown email", async () => {
    await request(app).post("/api/auth/register").send(newUser);

    const wrongPassword = await request(app)
      .post("/api/auth/login")
      .send({ email: newUser.email, password: "wrongpassword1" });

    const unknownEmail = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "password123" });

    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.body.message).toBe(unknownEmail.body.message);
  });

  it("blocks /me without a cookie", async () => {
    const res = await request(app).get("/api/auth/me");

    expect(res.status).toBe(401);
  });

  it("returns the user with a valid cookie", async () => {
    const agent = request.agent(app);
    await agent.post("/api/auth/register").send(newUser);

    const res = await agent.get("/api/auth/me");

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(newUser.email);
  });

  it("clears the cookie on logout", async () => {
    const agent = request.agent(app);
    await agent.post("/api/auth/register").send(newUser);
    await agent.post("/api/auth/logout");

    const res = await agent.get("/api/auth/me");

    expect(res.status).toBe(401);
  });
});

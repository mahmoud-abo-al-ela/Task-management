import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";

import app from "../app";
import { User } from "../models/User";
import { Task } from "../models/Task";

let mongoServer: MongoMemoryServer;

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
  await Task.deleteMany({});
});

async function registerUser(email: string) {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ name: "Test", email, password: "123456" });

  return res.body.token as string;
}

async function createTask(token: string, data: object = {}) {
  const res = await request(app)
    .post("/api/tasks")
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "My task", ...data });

  return res.body;
}

describe("tasks", () => {
  it("creates a task", async () => {
    const token = await registerUser("a@example.com");

    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Buy milk" });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("todo");
  });

  it("blocks requests with no token", async () => {
    const res = await request(app).get("/api/tasks");

    expect(res.status).toBe(401);
  });

  it("updates a task", async () => {
    const token = await registerUser("a@example.com");
    const task = await createTask(token);

    const res = await request(app)
      .patch(`/api/tasks/${task._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "done" });

    expect(res.body.status).toBe("done");
  });

  it("deletes a task", async () => {
    const token = await registerUser("a@example.com");
    const task = await createTask(token);

    await request(app)
      .delete(`/api/tasks/${task._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(await Task.countDocuments()).toBe(0);
  });

  it("searches by title and filters by status", async () => {
    const token = await registerUser("a@example.com");
    await createTask(token, { title: "Buy milk" });
    await createTask(token, { title: "Walk the dog", status: "done" });

    const search = await request(app)
      .get("/api/tasks?search=MILK")
      .set("Authorization", `Bearer ${token}`);

    const filter = await request(app)
      .get("/api/tasks?status=done")
      .set("Authorization", `Bearer ${token}`);

    expect(search.body).toHaveLength(1);
    expect(filter.body[0].title).toBe("Walk the dog");
  });
});

// A user must never reach another user's tasks.
describe("task ownership", () => {
  it("only lists your own tasks", async () => {
    const tokenA = await registerUser("a@example.com");
    const tokenB = await registerUser("b@example.com");
    await createTask(tokenA);

    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.body).toHaveLength(0);
  });

  it("cannot update or delete someone else's task", async () => {
    const tokenA = await registerUser("a@example.com");
    const tokenB = await registerUser("b@example.com");
    const task = await createTask(tokenA);

    const update = await request(app)
      .patch(`/api/tasks/${task._id}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ title: "Hacked" });

    const remove = await request(app)
      .delete(`/api/tasks/${task._id}`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(update.status).toBe(404);
    expect(remove.status).toBe(404);
    expect(await Task.countDocuments()).toBe(1);
  });
});

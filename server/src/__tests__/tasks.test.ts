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

async function signIn(email: string) {
  const agent = request.agent(app);
  await agent
    .post("/api/auth/register")
    .send({ name: "Test", email, password: "password123" });

  return agent;
}

async function createTask(
  agent: ReturnType<typeof request.agent>,
  data: object = {},
) {
  const res = await agent
    .post("/api/tasks")
    .send({ title: "My task", ...data });
  return res.body;
}

describe("tasks", () => {
  it("creates a task", async () => {
    const agent = await signIn("a@example.com");

    const res = await agent.post("/api/tasks").send({ title: "Buy milk" });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("todo");
  });

  it("rejects a task with no title", async () => {
    const agent = await signIn("a@example.com");

    const res = await agent
      .post("/api/tasks")
      .send({ description: "no title" });

    expect(res.status).toBe(400);
  });

  it("blocks requests with no cookie", async () => {
    const res = await request(app).get("/api/tasks");

    expect(res.status).toBe(401);
  });

  it("updates a task", async () => {
    const agent = await signIn("a@example.com");
    const task = await createTask(agent);

    const res = await agent
      .patch(`/api/tasks/${task._id}`)
      .send({ status: "done" });

    expect(res.body.status).toBe("done");
  });

  it("deletes a task", async () => {
    const agent = await signIn("a@example.com");
    const task = await createTask(agent);

    await agent.delete(`/api/tasks/${task._id}`);

    expect(await Task.countDocuments()).toBe(0);
  });

  it("searches by title and filters by status", async () => {
    const agent = await signIn("a@example.com");
    await createTask(agent, { title: "Buy milk" });
    await createTask(agent, { title: "Walk the dog", status: "done" });

    const search = await agent.get("/api/tasks?search=MILK");
    const filter = await agent.get("/api/tasks?status=done");

    expect(search.body.tasks).toHaveLength(1);
    expect(filter.body.tasks[0].title).toBe("Walk the dog");
  });

  it("paginates the list", async () => {
    const agent = await signIn("a@example.com");
    for (let i = 0; i < 12; i++) {
      await createTask(agent, { title: `Task ${i}` });
    }

    const res = await agent.get("/api/tasks?page=2&limit=10");

    expect(res.body.tasks).toHaveLength(2);
    expect(res.body.total).toBe(12);
    expect(res.body.totalPages).toBe(2);
  });
});

describe("task ownership", () => {
  it("only lists your own tasks", async () => {
    const userA = await signIn("a@example.com");
    const userB = await signIn("b@example.com");
    await createTask(userA);

    const res = await userB.get("/api/tasks");

    expect(res.body.tasks).toHaveLength(0);
  });

  it("cannot update or delete someone else's task", async () => {
    const userA = await signIn("a@example.com");
    const userB = await signIn("b@example.com");
    const task = await createTask(userA);

    const update = await userB
      .patch(`/api/tasks/${task._id}`)
      .send({ title: "Hacked" });

    const remove = await userB.delete(`/api/tasks/${task._id}`);

    expect(update.status).toBe(404);
    expect(remove.status).toBe(404);
    expect(await Task.countDocuments()).toBe(1);
  });
});

import { Response } from "express";
import { Task } from "../models/Task";
import { AuthRequest } from "../middleware/auth";

export async function getTasks(req: AuthRequest, res: Response) {
  const { search, status, priority } = req.query;

  const filter: any = { owner: req.userId };

  if (search) filter.title = { $regex: search, $options: "i" };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  const tasks = await Task.find(filter).sort({ createdAt: -1 });

  res.json(tasks);
}

export async function createTask(req: AuthRequest, res: Response) {
  const { title, description, status, priority, dueDate } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  const task = await Task.create({
    title,
    description,
    status,
    priority,
    dueDate,
    owner: req.userId,
  });

  res.status(201).json(task);
}

export async function updateTask(req: AuthRequest, res: Response) {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, owner: req.userId },
    req.body,
    { returnDocument: "after", runValidators: true },
  );

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  res.json(task);
}

export async function deleteTask(req: AuthRequest, res: Response) {
  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    owner: req.userId,
  });

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  res.json({ message: "Task deleted" });
}

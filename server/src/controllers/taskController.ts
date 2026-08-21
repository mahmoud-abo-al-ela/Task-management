import { Response } from "express";
import { Task } from "../models/Task";
import { AuthRequest } from "../middleware/auth";


export async function getTasks(req: AuthRequest, res: Response) {
  const { search, status, priority } = req.query;

  const filter: any = { owner: req.userId };

  if (search) filter.title = { $regex: search, $options: "i" };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 10, 50);

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Task.countDocuments(filter),
  ]);

  res.json({
    tasks,
    page,
    totalPages: Math.ceil(total / limit) || 1,
    total,
  });
}

function fileToAttachment(file: Express.Multer.File) {
  return {
    data: file.buffer,
    contentType: file.mimetype,
    filename: file.originalname,
    size: file.size,
  };
}

export async function createTask(req: AuthRequest, res: Response) {
  const { title, description, status, priority, dueDate } = req.body;

  const task = await Task.create({
    title,
    description,
    status,
    priority,
    dueDate: dueDate || null,
    owner: req.userId,
    ...(req.file && { attachment: fileToAttachment(req.file) }),
  });

  res.status(201).json(task);
}

export async function updateTask(req: AuthRequest, res: Response) {
  const { title, description, status, priority, dueDate } = req.body;

  const update: any = {};
  if (title !== undefined) update.title = title;
  if (description !== undefined) update.description = description;
  if (status !== undefined) update.status = status;
  if (priority !== undefined) update.priority = priority;
  if (dueDate !== undefined) update.dueDate = dueDate || null;
  if (req.file) update.attachment = fileToAttachment(req.file);

  const unset =
    req.body.removeAttachment === "true" && !req.file
      ? { attachment: 1 }
      : undefined;

  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, owner: req.userId },
    { $set: update, ...(unset && { $unset: unset }) },
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

export async function getAttachment(req: AuthRequest, res: Response) {
  const task = await Task.findOne({
    _id: req.params.id,
    owner: req.userId,
  }).select("+attachment.data");

  if (!task?.attachment?.data) {
    return res.status(404).json({ message: "No attachment" });
  }

  res.setHeader("Content-Type", task.attachment.contentType || "image/jpeg");
  res.send(task.attachment.data);
}

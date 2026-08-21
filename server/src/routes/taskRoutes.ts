import { Router } from "express";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getAttachment,
} from "../controllers/taskController";
import { protect } from "../middleware/auth";
import { uploadImage } from "../middleware/upload";
import { validate } from "../middleware/validate";
import { createTaskSchema, updateTaskSchema } from "../validators/taskSchemas";

const router = Router();

router.use(protect);

router.get("/", getTasks);

router.post("/", uploadImage, validate(createTaskSchema), createTask);
router.patch("/:id", uploadImage, validate(updateTaskSchema), updateTask);
router.delete("/:id", deleteTask);

router.get("/:id/attachment", getAttachment);

export default router;

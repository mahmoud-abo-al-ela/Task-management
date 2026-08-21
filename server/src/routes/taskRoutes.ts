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

const router = Router();

router.use(protect);

router.get("/", getTasks);
router.post("/", uploadImage, createTask);
router.patch("/:id", uploadImage, updateTask);
router.delete("/:id", deleteTask);
router.get("/:id/attachment", getAttachment);

export default router;

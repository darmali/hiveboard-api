import { Router } from "express";
import { getTasks, getTask, createTask, updateTask, deleteTask, unassignUsersFromTask } from "./tasksController.js";
const router = Router();

router.get("/", getTasks);
router.get("/:task_id", getTask);
router.post("/", createTask);
router.put("/:task_id", updateTask);
router.delete("/:task_id", deleteTask);
router.delete("/:task_id/unassign-users", unassignUsersFromTask);

export default router;

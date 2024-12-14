import { Router } from "express";
import { TaskController } from "../../controllers/taskController.js";
import { verifyToken } from "../../middlewares/authMiddleware.js";
import { validateData } from "../../middlewares/validationMiddleware.js";
import { createTaskSchema } from "../../db/tasksSchema.js";
const router = Router();

const taskController = new TaskController();

router.get("/:project_id", verifyToken, taskController.getTasks);
router.get("/:project_id/:task_id", verifyToken, taskController.getTask);
router.post("/:project_id", verifyToken, validateData(createTaskSchema), taskController.createTask);
router.post("/:project_id/:task_id/assign-users", verifyToken, taskController.assignUsersToTask);
router.delete("/:project_id/:task_id/unassign-users", verifyToken, taskController.unassignUsersFromTask);
//router.put("/:project_id/:task_id", updateTask);
//router.delete("/:project_id/:task_id", deleteTask);
//router.delete("/:project_id/:task_id/unassign-users", unassignUsersFromTask);

export default router;

import { Router } from "express";
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  assignUsersToProject,
  unassignUsersFromProject,
} from "./projectsController.js";
import { verifyToken } from "../../middlewares/authMiddleware.js";
import { validateData } from "../../middlewares/validationMiddleware.js";
import {
  createProjectSchema,
  updateProjectSchema,
} from "../../db/projectsSchema.js";

const router = Router();

router.get("/", verifyToken, getProjects);

router.post("/", verifyToken, validateData(createProjectSchema), createProject);

router.get("/:project_id", verifyToken, getProject);
router.put(
  "/:project_id",
  verifyToken,
  validateData(updateProjectSchema),
  updateProject
);

router.delete("/:project_id", verifyToken, deleteProject);
router.post("/:project_id/assign-users", verifyToken, assignUsersToProject);
router.delete("/:project_id/unassign-users", verifyToken, unassignUsersFromProject);

export default router;

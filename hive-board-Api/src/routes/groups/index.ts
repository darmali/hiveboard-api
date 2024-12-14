import { Router } from "express";
import {
  createGroup,
  getGroups,
  getGroup,
  updateGroup,
  deleteGroup,
  assignUsersToGroup,
  unassignUsersFromGroup,
} from "./groupsController.js";
import { verifyToken } from "../../middlewares/authMiddleware.js";
import { validateData } from "../../middlewares/validationMiddleware.js";
import { createGroupSchema, updateGroupSchema } from "../../db/groupsSchema.js";

const router = Router();

router.get("/", verifyToken, getGroups);

router.post("/", verifyToken, validateData(createGroupSchema), createGroup);

router.get("/:group_id", verifyToken, getGroup);

router.put(
  "/:group_id",
  verifyToken,
  validateData(updateGroupSchema),
  updateGroup
);

router.delete("/:group_id", verifyToken, deleteGroup);

router.post("/:group_id/assign-users", verifyToken, assignUsersToGroup);

router.delete("/:group_id/unassign-users", verifyToken, unassignUsersFromGroup);

export default router;

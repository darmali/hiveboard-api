import { Router } from "express";
import {
  createUserSchema,
  createUserWithCompanySchema,
  loginSchema
} from "../../db/usersSchema.js";
import { validateData } from "../../middlewares/validationMiddleware.js";
import { loginUser, registerUser } from "./usersController.js";

const router = Router();

router.post('/register', validateData(createUserWithCompanySchema), registerUser);

router.post('/login', validateData(loginSchema), loginUser);

export default router;

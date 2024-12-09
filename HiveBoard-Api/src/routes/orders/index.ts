import { Router } from 'express';
import {
  createOrder,
  getOrder,
  listOrders,
  updateOrder,
} from './ordersController.js';
import { validateData } from  "../../midllewares/validationMidlleware.js"; //'../../middlewares/validationMiddleware.js';
import { insertOrderWithItemsSchema, updateOrderSchema } from '../../db/ordersSchema.js';
import { verifyToken } from "../../midllewares/authMiddleware.js"; //'../../middlewares/authMiddleware.js';

const router = Router();

router.post(
  '/',
  verifyToken,
  validateData(insertOrderWithItemsSchema),
  createOrder
);

router.get('/', verifyToken, listOrders);
router.get('/:id', verifyToken, getOrder);
router.put('/:id', verifyToken, validateData(updateOrderSchema), updateOrder);

export default router;

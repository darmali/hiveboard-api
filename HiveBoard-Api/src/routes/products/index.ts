import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct,
} from "./productController.js";
import { validateData } from "../../midllewares/validationMidlleware.js";
import { z } from "zod";
import {
  createProductSchema,
  updateProductSchema,
} from "../../db/productsSchema.js";
import { verifyToken, verifySeller } from "../../midllewares/authMiddleware.js";

// const createProductSchema = z.object(
//   {
//     name: z.string(),
//     price: z.number({message: "price it should br a number"})
//   }
// );

const productsRouter = Router();

productsRouter.get("/", listProducts);

productsRouter.get("/:id", getProductById);

productsRouter.post(
  "/",
  verifyToken,
  verifySeller,
  validateData(createProductSchema),
  createProduct
);

productsRouter.put(
  "/:id",
  verifyToken,
  verifySeller,
  validateData(updateProductSchema),
  updateProduct
);

productsRouter.delete("/:id", verifyToken, verifySeller, deleteProduct);

export default productsRouter;

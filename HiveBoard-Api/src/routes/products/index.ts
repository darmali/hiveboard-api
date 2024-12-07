import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct,
} from "./productController";

const productsRouter = Router();

productsRouter.get("/", listProducts);

productsRouter.get("/:id", getProductById);

productsRouter.post("/", createProduct);

productsRouter.put("/", updateProduct);

productsRouter.delete("/:id", deleteProduct);

export { productsRouter };

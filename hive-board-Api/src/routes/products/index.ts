import { Router } from "express";
import { ProductController } from "./productController.js";
import { ProductService } from "../../services/productService.js";
import { validateData } from "../../middlewares/validationMiddleware.js";
import { z } from "zod";
import {
  createProductSchema,
  updateProductSchema,
} from "../../db/productsSchema.js";
import { verifyToken, verifySeller } from "../../middlewares/authMiddleware.js";

// const createProductSchema = z.object(
//   {
//     name: z.string(),
//     price: z.number({message: "price it should br a number"})
//   }
// );

const productService = new ProductService();
const productController = new ProductController(productService);

const productsRouter = Router();

productsRouter.get("/", productController.listProducts);

productsRouter.get("/:id", productController.getProductById);

productsRouter.post(
  "/",
  verifyToken,
  verifySeller,
  validateData(createProductSchema),
  productController.createProduct
);

productsRouter.put(
  "/:id",
  verifyToken,
  verifySeller,
  validateData(updateProductSchema),
  productController.updateProduct
);

productsRouter.delete("/:id", verifyToken, verifySeller, productController.deleteProduct);

export default productsRouter;

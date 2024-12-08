import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct,
} from "./productController";
import { validateData } from "../../midllewares/validationMidlleware";
import {z} from "zod";
import {
  createProductSchema,
  updateProductSchema,
} from '../../db/productsSchema.js';

// const createProductSchema = z.object(
//   {
//     name: z.string(),
//     price: z.number({message: "price it should br a number"})
//   }
// );



const productsRouter = Router();

productsRouter.get("/", listProducts);

productsRouter.get("/:id", getProductById);

productsRouter.post("/", validateData(createProductSchema), createProduct);

productsRouter.put("/:id", validateData(updateProductSchema), updateProduct);

productsRouter.delete("/:id", deleteProduct);

export { productsRouter };

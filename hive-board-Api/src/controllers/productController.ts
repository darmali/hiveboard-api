import { Request, Response } from "express";
import { ProductService } from "../services/productService.js";

export class ProductController {
  constructor(private productService: ProductService) {}

  async listProducts = async (req: Request, res: Response) => {
    try {
      const { pageNumber, pageSize } = req.query;
      const products = await this.productService.listProducts(Number(pageNumber), Number(pageSize));
      res.json(products);
    } catch (e) {
      res.status(500).send(e);
    }
  };

  async getProductById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const product = await this.productService.getProductById(Number(id));
      if (!product) {
        return res.status(404).json({ message: "product not found" });
      }
      res.json(product);
    } catch (e) {
      res.status(500).send(e);
    }
  };

  async createProduct = async (req: Request, res: Response) => {
    try {
      const product = await this.productService.createProduct(req.cleanBody);
      res.status(201).json(product);
    } catch (e) {
      res.status(500).send(e);
    }
  };

  async updateProduct = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const product = await this.productService.updateProduct(Number(id), req.cleanBody);
      if (!product) {
        return res.status(404).json({ message: "product not found" });
      }
      res.status(200).json(product);
    } catch (e) {
      res.status(500).send(e);
    }
  };

  async deleteProduct = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await this.productService.deleteProduct(Number(id));
      if (!deleted) {
        return res.status(404).json({ message: "product not found" });
      }
      res.status(204).send();
    } catch (e) {
      res.status(500).send(e);
    }
  };
}

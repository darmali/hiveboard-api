import { Request, Response } from "express";
import { db } from "../../db/index";
import { productsTable } from "../../db/productsSchema";
import { asc, eq } from "drizzle-orm";
import { withPagination } from "../../utils/dbHelper";

export async function listProducts(req: Request, res: Response) {
  try {
    const { pageNumber, pageSize } = req.query;

    const query = db.select().from(productsTable);
    const products = await withPagination(
      query.$dynamic(),
      asc(productsTable.id),
      Number(pageNumber),
      Number(pageSize)
    );

    res.json(products);
  } catch (e) {
    res.status(500).send(e);
  }
}

export async function getProductById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, Number(id)));
    if (!product) {
      res.status(404).json({ message: "product not found" });
    }
    res.json(product);
  } catch (e) {
    res.status(500).send(e);
  }
}

export async function createProduct(req: Request, res: Response) {
  try {
    const [product] = await db
      .insert(productsTable)
      .values(req.body)
      .returning();
    res.status(201).json(product);
  } catch (e) {
    res.status(500).send(e);
  }
}

export async function updateProduct(req: Request, res: Response) {
  try {
    const { id } = req.params; 
    const [product] = await db.update(productsTable).set(req.body).where(eq(productsTable.id, Number(id))).returning();
    if(!product){
        res.status(404).json({ message: "product not found" });
    }
    res.status(201).json(product);

  } catch (e) {
    res.status(500).send(e);
  }
}

export async function deleteProduct(req: Request, res: Response) {
  try {
    const { id } = req.params; 
    const [product] = await db.delete(productsTable).where(eq(productsTable.id, Number(id))).returning();

    if(!product){
        res.status(404).json({ message: "product not found" });
    } else{
        res.status(204).send();

    }

  } catch (e) {
    res.status(500).send(e);
  }
}

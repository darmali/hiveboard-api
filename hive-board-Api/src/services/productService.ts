import { db } from "../db/index.js";
import { productsTable } from "../db/productsSchema.js";
import { asc, eq } from "drizzle-orm";
import { withPagination } from "../utils/dbHelper.js";

export class ProductService {
  async listProducts(pageNumber: number, pageSize: number) {
    const query = db.select().from(productsTable);
    return await withPagination(
      query.$dynamic(),
      asc(productsTable.id),
      pageNumber,
      pageSize
    );
  }

  async getProductById(id: number) {
    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, id));
    return product;
  }

  async createProduct(data: any) {
    const [product] = await db
      .insert(productsTable)
      .values(data)
      .returning();
    return product;
  }

  async updateProduct(id: number, data: any) {
    const [product] = await db
      .update(productsTable)
      .set(data)
      .where(eq(productsTable.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: number) {
    const [product] = await db
      .delete(productsTable)
      .where(eq(productsTable.id, id))
      .returning();
    return product;
  }
} 
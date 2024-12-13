import { SQL, asc } from "drizzle-orm";
import { PgColumn, PgSelect } from "drizzle-orm/pg-core";

export function withPagination<T extends PgSelect>(
  qb: T,
  orderByColumn: PgColumn | SQL | SQL.Aliased,
  pageNumber = 1,
  pageSize = 10
) {
  if (pageSize > 10) {
    pageSize = 10;
  }
  return qb
    .orderBy(orderByColumn)
    .limit(pageSize)
    .offset((pageNumber - 1) * pageSize);
}

type DataRecord = Record<string, any>;

/**
 * Sanitizes a data object by keeping only specified fields
 * @param data - The data object to sanitize
 * @param fieldsToKeep - Array of fields to keep in the sanitized object
 * @returns A new object containing only the specified fields
 */
export const sanitizeData = <T extends DataRecord>(data: T, fieldsToKeep: (keyof T)[]) => {
  return fieldsToKeep.reduce((acc: Partial<T>, field) => {
    if (data[field] !== undefined) acc[field] = data[field];
    return acc;
  }, {});
};
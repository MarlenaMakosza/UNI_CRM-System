import { sql } from "db";
import { Product, UpsertProduct } from "../types/index.ts";
import { ProductNotFoundError } from "../utils/errorHandler.ts";

/**
 * Pobierz listę wszystkich produktów
 * @returns {Promise<Product[]>} - lista wszystkich produktów
 */
export function getAllProducts(): Promise<Product[]> {
  return sql<Product[]>`
    SELECT id, nazwa, opis, cena
    FROM produkt
    ORDER BY nazwa ASC
  `;
}

/**
 * Pobierz produkt po jego ID
 * @param {number} id - ID produktu
 * @returns {Promise<Product>} - dane produktu
 * @throws {ProductNotFoundError} gdy produkt nie istnieje
 */
export async function getProductById(id: number): Promise<Product> {
  const products = await sql<Product[]>`
    SELECT id, nazwa, opis, cena
    FROM produkt
    WHERE id = ${id}
    LIMIT 1
  `;

  if (products.length === 0) {
    throw new ProductNotFoundError(id);
  }

  return products[0];
}

/**
 * Dodaj nowy produkt do bazy
 * @param {UpsertProduct} product - dane nowego produktu
 * @returns {Promise<number>} - ID utworzonego produktu
 */
export async function insertProduct(product: UpsertProduct): Promise<number> {
  const result = await sql<{ id: number }[]>`
    INSERT INTO produkt (nazwa, opis, cena)
    VALUES (${product.nazwa}, ${product.opis}, ${product.cena})
    RETURNING id
  `;

  return result[0].id;
}

/**
 * Aktualizuj produkt
 * @param {number} id - ID produktu
 * @param {UpsertProduct} product - dane produktu
 * @returns {Promise<void>}
 */
export async function updateProduct(
  id: number,
  product: UpsertProduct,
): Promise<void> {
  await sql`
    UPDATE produkt
    SET
      nazwa = ${product.nazwa},
      opis = ${product.opis},
      cena = ${product.cena}
    WHERE id = ${id}
  `;
}

/**
 * Usuń produkt
 * @param {number} id - ID produktu
 * @returns {Promise<void>}
 * @throws {Error} gdy produkt jest używany w pozycjach umowy (FK constraint)
 */
export async function deleteProduct(id: number): Promise<void> {
  await sql`DELETE FROM produkt WHERE id = ${id}`;
}

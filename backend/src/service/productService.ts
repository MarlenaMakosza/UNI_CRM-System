import * as productRepo from "../repository/productRepository.ts";
import { Product, UpsertProduct } from "../types/index.ts";
import { validateId } from "../utils/clientValidation.ts";
import { validateUpsertProduct } from "../utils/productValidation.ts";

/**
 * Pobierz listę wszystkich produktów
 * @returns {Promise<Product[]>} - lista wszystkich produktów
 */
export async function listProducts(): Promise<Product[]> {
  return await productRepo.getAllProducts();
}

/**
 * Pobierz pełne dane produktu o podanym ID
 * @param {number} id - ID produktu
 * @returns {Promise<Product>} - dane produktu
 * @throws {InvalidInputError} gdy ID jest niepoprawne
 * @throws {ProductNotFoundError} gdy produkt nie istnieje
 */
export async function getProductDetails(id: number): Promise<Product> {
  validateId(id);
  return await productRepo.getProductById(id);
}

/**
 * Tworzy nowy produkt w systemie
 * @param {UpsertProduct} request - dane nowego produktu
 * @returns {Promise<Product>} - utworzony produkt
 * @throws {ValidationError} gdy dane są niepoprawne
 */
export async function createProduct(request: UpsertProduct): Promise<Product> {
  // Walidacja
  validateUpsertProduct(request);

  // Zapisz w bazie
  const productId = await productRepo.insertProduct(request);

  // Pobierz utworzony produkt
  return await productRepo.getProductById(productId);
}

/**
 * Aktualizuje produkt (PUT - pełna zamiana)
 * @param {number} id - ID produktu
 * @param {UpsertProduct} request - pełne dane produktu
 * @returns {Promise<Product>} - zaktualizowany produkt
 * @throws {InvalidInputError} gdy ID jest niepoprawne
 * @throws {ValidationError} gdy dane są niepoprawne
 */
export async function updateProduct(
  id: number,
  request: UpsertProduct,
): Promise<Product> {
  // Waliduj ID
  validateId(id);

  // Sprawdź czy produkt istnieje
  await productRepo.getProductById(id);

  // Waliduj request
  validateUpsertProduct(request);

  // Zaktualizuj produkt
  await productRepo.updateProduct(id, request);

  // Pobierz zaktualizowany produkt
  return await productRepo.getProductById(id);
}

/**
 * Usuwa produkt
 * @param {number} id - ID produktu
 * @throws {InvalidInputError} gdy ID jest niepoprawne
 * @throws {Error} gdy produkt jest używany w pozycjach umowy (FK constraint)
 */
export async function deleteProduct(id: number): Promise<void> {
  validateId(id);
  // Usuń (jeśli jest w użyciu, PostgreSQL rzuci FK constraint error)
  await productRepo.deleteProduct(id);
}

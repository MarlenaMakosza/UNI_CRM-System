import { Router } from "oak";
import * as productService from "../service/productService.ts";
import { handleError } from "../utils/errorHandler.ts";

export const productsRouter = new Router({ prefix: "/api/products" });

// ===== ENDPOINTS =====

// GET /api/products – lista produktów
productsRouter.get("/", async (ctx) => {
  try {
    ctx.response.body = await productService.listProducts();
    ctx.response.status = 200;
  } catch (error) {
    handleError(ctx, error);
  }
});

// GET /api/products/:id – szczegóły produktu
productsRouter.get("/:id", async (ctx) => {
  try {
    const id = Number(ctx.params.id);
    ctx.response.body = await productService.getProductDetails(id);
    ctx.response.status = 200;
  } catch (error) {
    handleError(ctx, error);
  }
});

// POST /api/products – utworzenie produktu
productsRouter.post("/", async (ctx) => {
  try {
    const body = ctx.request.body({ type: "json" });
    const data = await body.value;

    ctx.response.body = await productService.createProduct(data);
    ctx.response.status = 201;
  } catch (error) {
    handleError(ctx, error);
  }
});

// PUT /api/products/:id – aktualizacja produktu (pełna zamiana)
productsRouter.put("/:id", async (ctx) => {
  try {
    const id = Number(ctx.params.id);
    const body = ctx.request.body({ type: "json" });
    const data = await body.value;

    ctx.response.body = await productService.updateProduct(id, data);
    ctx.response.status = 200;
  } catch (error) {
    handleError(ctx, error);
  }
});

// DELETE /api/products/:id – usunięcie produktu
productsRouter.delete("/:id", async (ctx) => {
  try {
    const id = Number(ctx.params.id);
    await productService.deleteProduct(id);

    ctx.response.status = 204;
  } catch (error) {
    handleError(ctx, error);
  }
});

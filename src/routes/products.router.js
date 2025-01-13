import { Router } from "express";
import { getAllProducts,getProductById,addProduct,updateProduct,deleteProduct } from "../controllers/products.controller.js";


export default class ProductRouter {
  constructor() {
    this.router = Router();
    this.init();
  }

  getRouter() {
    return this.router;
  }

  init() {
    this.router.get("/", getAllProducts);
    this.router.get("/:pid", getProductById);
    this.router.post("/", addProduct);
    this.router.put("/:pid", updateProduct);
    this.router.delete("/:pid", deleteProduct);
  }

}

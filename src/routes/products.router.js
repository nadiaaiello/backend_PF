import { Router } from "express";
import ProductService from "../services/products.service.js";

export default class ProductRouter {
  constructor() {
    this.router = Router();
    this.productService = new ProductService();
    this.init();
  }

  getRouter() {
    return this.router;
  }

  init() {
    this.router.get("/", this.getAllProducts);
    this.router.get("/:pid", this.getProductById);
    this.router.post("/", this.addProduct);
    this.router.put("/:pid", this.updateProduct);
    this.router.delete("/:pid", this.deleteProduct);
  }

  // Get all products with pagination, sorting, and filtering
  getAllProducts = async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        sort = "asc",
        category,
        status,
      } = req.query;

      // Prepare filter conditions
      let filter = {};
      if (category) filter.category = category;
      if (status !== undefined) filter.status = status === "true";

      // Prepare sorting
      let sortObj = {};
      if (sort === "asc") {
        sortObj.price = 1; // Ascending
      } else if (sort === "desc") {
        sortObj.price = -1; // Descending
      }

      const products = await this.productService.getAll({
        page,
        limit,
        filter,
        sort: sortObj,
      });

      res.status(200).json(products);
    } catch (error) {
      console.log("Error fetching products:", error);
      res.status(500).json({ error: "Error fetching products" });
    }
  };

  // Get a single product by ID
  getProductById = async (req, res) => {
    const { pid } = req.params;
    try {
      const product = await this.productService.getById(pid);
      if (product) {
        res.status(200).json(product);
      } else {
        res.status(404).json({ error: `Product not found for ID: ${pid}` });
      }
    } catch (error) {
      console.log("Error fetching product by ID:", error);
      res.status(500).json({ error: "Error fetching product by ID" });
    }
  };

  // Add a new product
  addProduct = async (req, res) => {
    const productData = req.body;
    try {
      const product = await this.productService.save(productData);
      res.status(201).json(product);
    } catch (error) {
      console.log("Error adding product:", error);
      res.status(500).json({ error: "Error adding product" });
    }
  };

  // Update an existing product
  updateProduct = async (req, res) => {
    const { pid } = req.params;
    const updateData = req.body;
    try {
      const updatedProduct = await this.productService.update(pid, updateData);
      if (updatedProduct) {
        res.status(200).json(updatedProduct);
      } else {
        res.status(404).json({ error: `Product not found for ID: ${pid}` });
      }
    } catch (error) {
      console.log("Error updating product:", error);
      res.status(500).json({ error: "Error updating product" });
    }
  };

  // Delete a product
  deleteProduct = async (req, res) => {
    const { pid } = req.params;
    try {
      const result = await this.productService.delete(pid);
      if (result) {
        res.status(200).json({ message: `Product with ID: ${pid} deleted` });
      } else {
        res.status(404).json({ error: `Product not found for ID: ${pid}` });
      }
    } catch (error) {
      console.log("Error deleting product:", error);
      res.status(500).json({ error: "Error deleting product" });
    }
  };
}

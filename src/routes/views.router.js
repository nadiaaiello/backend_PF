import { Router } from "express";
import { authTokenAndRole } from "../utils.js"; // Ruta al archivo utils.js

class ViewsRouter {
  constructor() {
    this.router = Router();
    this.init();
  }

  getRouter() {
    return this.router;
  }

  init() {
    // Rutas públicas
    this.router.get("/", this.renderIndexPage);
    this.router.get("/login", this.renderLoginPage);
    this.router.get("/register", this.renderRegisterPage);
    this.router.get("/profile", this.renderProfilePage);

    // Rutas protegidas
    this.router.get("/products", this.renderProductsPage); // Requiere autenticación
    this.router.get("/cart", this.renderCartPage); // Requiere autenticación

    // Rutas protegidas para administradores
    this.router.get(
      "/admin/users",
      authTokenAndRole("ADMIN"),
      this.renderAdminUsersPage
    );

    // Rutas protegidas para usuarios premium y administradores
    this.router.get(
      "/create-product",
      authTokenAndRole("PREMIUM"),
      this.renderCreateProductPage
    );
  }

  // Render Home page (or product listing page)
  renderIndexPage = (req, res) => {
    res.render("index");
  };

  // Render Login page
  renderLoginPage = (req, res) => {
    res.render("login");
  };

  // Render Register page
  renderRegisterPage = (req, res) => {
    res.render("register");
  };

  renderProfilePage = (req, res) => {
    res.render("profile");
  };

  // Render Products page
  renderProductsPage = (req, res) => {
    res.render("products");
  };

  // Render Cart page
  renderCartPage = (req, res) => {
    res.render("cart");
  };

  // Admin page to manage users
  renderAdminUsersPage = (req, res) => {
    res.render("adminUsers");
  };

  // Render Create Product page for premium users or admins
  renderCreateProductPage = (req, res) => {
    res.render("createProduct");
  };
}

export default ViewsRouter;

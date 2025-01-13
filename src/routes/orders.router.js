import CustomRouter from "./custom.router.js";
import OrderService from "../services/order.service.js";
import { authTokenAndRole } from "../utils.js";
import {
  getOrderByUserId,
  saveOrder,
} from "../controllers/order.controller.js";

const orderService = new OrderService();

export default class OrdersRouter extends CustomRouter {
  init() {
    // Obtener todas las órdenes del usuario logueado
    this.get("/", [authTokenAndRole()], getOrderByUserId);

    // Crear una nueva orden
    this.post("/", [authTokenAndRole("admin")], saveOrder);

    // Eliminar una orden por ID
    this.delete("/:orderId", [authTokenAndRole("admin")], deleteOrder);
  }
}
